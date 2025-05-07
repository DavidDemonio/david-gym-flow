
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

class PdfService {
  /**
   * Genera un PDF a partir de datos de rutina
   */
  async generateRoutinePDF(routineData: any): Promise<void> {
    try {
      // Crear un elemento HTML temporal para renderizar la rutina
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-container';
      tempDiv.style.width = '210mm';
      tempDiv.style.padding = '10mm';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      // Agregar estilo CSS al documento
      const style = document.createElement('style');
      style.textContent = `
        .pdf-container { color: #333; }
        .pdf-header { text-align: center; margin-bottom: 20px; }
        .pdf-title { font-size: 24px; color: #6027c5; margin-bottom: 5px; }
        .pdf-subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
        .day-title { font-size: 18px; color: #6027c5; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .exercise { margin: 15px 0; padding: 10px; border: 1px solid #eee; border-radius: 5px; }
        .exercise-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .exercise-meta { display: flex; justify-content: space-between; font-size: 14px; color: #666; margin-bottom: 8px; }
        .exercise-description { font-size: 14px; line-height: 1.4; background: #f7f7f7; padding: 8px; border-radius: 4px; }
      `;
      document.head.appendChild(style);
      
      // Crear contenido del PDF
      const header = document.createElement('div');
      header.className = 'pdf-header';

      const title = document.createElement('h1');
      title.className = 'pdf-title';
      title.textContent = routineData.name || 'Mi Rutina de Entrenamiento';
      header.appendChild(title);
      
      const subtitle = document.createElement('p');
      subtitle.className = 'pdf-subtitle';
      subtitle.textContent = `Rutina de ${routineData.days} días - Generada ${new Date().toLocaleDateString()}`;
      header.appendChild(subtitle);
      tempDiv.appendChild(header);
      
      // Agregar días y ejercicios
      if (routineData.exercises && routineData.dayNames) {
        routineData.dayNames.forEach((dayName: string, index: number) => {
          const dayDiv = document.createElement('div');
          
          const dayTitle = document.createElement('h2');
          dayTitle.className = 'day-title';
          dayTitle.textContent = `${dayName} - ${routineData.focusAreas[(index + 1).toString()] || ''}`;
          dayDiv.appendChild(dayTitle);
          
          // Agregar ejercicios del día
          const exercises = routineData.exercises[dayName] || [];
          if (exercises.length > 0) {
            exercises.forEach((exercise: any) => {
              const exerciseDiv = document.createElement('div');
              exerciseDiv.className = 'exercise';
              
              const exerciseTitle = document.createElement('div');
              exerciseTitle.className = 'exercise-title';
              exerciseTitle.textContent = `${exercise.emoji || '💪'} ${exercise.name}`;
              exerciseDiv.appendChild(exerciseTitle);
              
              const exerciseMeta = document.createElement('div');
              exerciseMeta.className = 'exercise-meta';
              exerciseMeta.innerHTML = `
                <span>Series: ${exercise.sets || 3}</span>
                <span>Reps: ${exercise.reps || '10-12'}</span>
                <span>Descanso: ${exercise.rest || '60s'}</span>
                <span>Calorías: ${exercise.calories || '5'} kcal</span>
              `;
              exerciseDiv.appendChild(exerciseMeta);
              
              if (exercise.description) {
                const exerciseDesc = document.createElement('div');
                exerciseDesc.className = 'exercise-description';
                exerciseDesc.textContent = exercise.description;
                exerciseDiv.appendChild(exerciseDesc);
              }
              
              dayDiv.appendChild(exerciseDiv);
            });
          } else {
            const noExercises = document.createElement('p');
            noExercises.textContent = 'No hay ejercicios programados para este día';
            noExercises.style.fontStyle = 'italic';
            noExercises.style.color = '#999';
            noExercises.style.textAlign = 'center';
            noExercises.style.padding = '20px 0';
            dayDiv.appendChild(noExercises);
          }
          
          tempDiv.appendChild(dayDiv);
        });
      }
      
      // Agregar el div al documento para renderizarlo
      document.body.appendChild(tempDiv);
      
      // Generar el PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Convertir HTML a Canvas para incluirlo en el PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Agregar la primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Agregar páginas adicionales si el contenido es demasiado largo
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Guardar el PDF
      pdf.save(`${routineData.name || 'Rutina'}.pdf`);
      
      // Limpiar
      document.body.removeChild(tempDiv);
      document.head.removeChild(style);
      
    } catch (error) {
      console.error('Error generando el PDF:', error);
      throw error;
    }
  }
}

export default new PdfService();
