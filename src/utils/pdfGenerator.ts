
import { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';

// Define the exercise interface
interface Exercise {
  id: number;
  name: string;
  emoji: string;
  sets: number;
  reps: string;
  muscleGroups: string[];
  rest: string;
}

// Define routine interface
interface RoutineDay {
  [day: string]: Exercise[];
}

interface RoutineData {
  name: string;
  days: number;
  exercises: RoutineDay;
}

/**
 * Generate a PDF from routine data
 */
export async function generatePDF(routineData: RoutineData): Promise<void> {
  try {
    // Dynamically import the required modules to avoid build errors
    const [jsPDFModule, html2canvasModule] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const html2canvas = html2canvasModule.default;
    
    // Create a hidden container to render the routine
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '794px'; // A4 width in px
    container.className = 'pdf-container';
    
    // Add styling
    container.innerHTML = `
      <style>
        .pdf-container * {
          font-family: Arial, sans-serif;
        }
        .pdf-header {
          text-align: center;
          padding: 20px;
          background: #f5f5f5;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        .pdf-header h1 {
          color: #333;
          margin: 0;
        }
        .pdf-day {
          margin-bottom: 30px;
        }
        .pdf-day h2 {
          color: #444;
          border-bottom: 2px solid #ddd;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .pdf-exercise {
          padding: 12px;
          background: #f9f9f9;
          margin-bottom: 12px;
          border-left: 4px solid #7E69AB;
          border-radius: 4px;
        }
        .pdf-exercise-title {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .pdf-exercise-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pdf-exercise-detail {
          background: #eee;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .pdf-footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
      </style>
      <div class="pdf-header">
        <h1>${routineData.name}</h1>
        <p>Plan de entrenamiento - ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    
    // Add each day
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    for (let i = 0; i < routineData.days; i++) {
      const dayKey = (i + 1).toString();
      const dayExercises = routineData.exercises[dayKey] || [];
      
      const dayEl = document.createElement('div');
      dayEl.className = 'pdf-day';
      dayEl.innerHTML = `
        <h2>Día ${i + 1} - ${dayNames[i] || `Día ${i + 1}`}</h2>
      `;
      
      if (dayExercises.length === 0) {
        dayEl.innerHTML += '<p>No hay ejercicios programados para este día.</p>';
      } else {
        dayExercises.forEach(exercise => {
          const exerciseEl = document.createElement('div');
          exerciseEl.className = 'pdf-exercise';
          exerciseEl.innerHTML = `
            <div class="pdf-exercise-title">
              <div>${exercise.emoji || '💪'} ${exercise.name}</div>
              <div>${exercise.sets} series × ${exercise.reps}</div>
            </div>
            <div class="pdf-exercise-details">
              <div class="pdf-exercise-detail">Descanso: ${exercise.rest}</div>
              <div class="pdf-exercise-detail">Grupos musculares: ${exercise.muscleGroups.join(', ')}</div>
            </div>
          `;
          dayEl.appendChild(exerciseEl);
        });
      }
      
      container.appendChild(dayEl);
    }
    
    // Add footer
    const footer = document.createElement('div');
    footer.className = 'pdf-footer';
    footer.innerHTML = `
      <p>Generado desde GymFlow - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    `;
    container.appendChild(footer);
    
    document.body.appendChild(container);
    
    try {
      // Create PDF
      const pdf = new jsPDF('portrait', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvas = await html2canvas(container, {
        scale: 2, // Higher quality
        logging: false, 
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfPageHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Handle case if content is longer than a single page
      let heightLeft = pdfPageHeight;
      let position = 0;
      
      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfPageHeight);
      heightLeft -= pdfHeight;
      
      // Add more pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfPageHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${routineData.name.replace(/\s+/g, '_')}.pdf`);
      
    } finally {
      // Clean up
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Hook to download a routine as PDF
 */
export function useDownloadRoutinePDF() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const downloadPDF = async (routineData: RoutineData) => {
    setIsGenerating(true);
    
    try {
      await generatePDF(routineData);
      toast({
        title: "PDF generado correctamente",
        description: "Tu rutina se ha descargado como PDF",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        variant: "destructive",
        title: "Error al generar PDF",
        description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return { downloadPDF, isGenerating };
}
