
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Exercise } from "../data/equipmentData";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Check } from "lucide-react";

interface CreateWeeklyRoutineDialogProps {
  exercises: Exercise[];
  open: boolean;
  onClose: () => void;
}

interface DayExercises {
  [day: string]: Exercise[];
}

export function CreateWeeklyRoutineDialog({ 
  exercises, 
  open, 
  onClose 
}: CreateWeeklyRoutineDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [days, setDays] = useState<number>(3);
  const [focusAreas, setFocusAreas] = useState<Record<string, string>>({
    "1": "Pecho y Tríceps",
    "2": "Espalda y Bíceps",
    "3": "Piernas y Hombros",
    "4": "Full Body",
    "5": "Core y Cardio"
  });
  
  // Función para crear rutina automáticamente basada en los grupos musculares
  const createAutomaticRoutine = () => {
    const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const selectedDays = weekDays.slice(0, days);
    
    const routineData: DayExercises = {};
    
    // Asignar ejercicios para cada día según el área de enfoque
    selectedDays.forEach((day, index) => {
      const dayNumber = (index + 1).toString();
      const focus = focusAreas[dayNumber] || "Full Body";
      let targetMuscles: string[] = [];
      
      // Determinar los grupos musculares objetivo según el enfoque
      if (focus === "Pecho y Tríceps") {
        targetMuscles = ["Pecho", "Tríceps", "Hombros"];
      } else if (focus === "Espalda y Bíceps") {
        targetMuscles = ["Espalda", "Bíceps", "Antebrazos"];
      } else if (focus === "Piernas y Hombros") {
        targetMuscles = ["Cuádriceps", "Glúteos", "Isquiotibiales", "Hombros"];
      } else if (focus === "Core y Cardio") {
        targetMuscles = ["Abdominales", "Core", "Full body"];
      }
      
      // Filtrar ejercicios que coincidan con los grupos musculares objetivo
      let dayExercises = exercises.filter(ex => 
        ex.muscleGroups.some(mg => targetMuscles.includes(mg))
      );
      
      // Limitar a 4-6 ejercicios por día
      dayExercises = dayExercises.slice(0, 5);
      
      routineData[day] = dayExercises;
    });
    
    // Construir un objeto con los datos de la rutina
    const weeklyRoutineData = {
      name: "Mi Rutina Semanal",
      days: days,
      dayNames: selectedDays,
      focusAreas: focusAreas,
      exercises: routineData
    };
    
    // Guardar la rutina (aquí simularemos guardado en localStorage)
    localStorage.setItem('weeklyRoutine', JSON.stringify(weeklyRoutineData));
    
    // Mostrar notificación
    toast({
      title: "¡Rutina semanal creada!",
      description: `Tu rutina de ${days} días ha sido creada exitosamente`,
      action: <Check className="h-4 w-4 text-green-500" />,
    });
    
    // Cerrar diálogo y navegar a la página de rutina
    onClose();
    navigate('/mi-rutina', { state: { weeklyRoutine: true } });
  };

  const handleDayFocusChange = (day: string, value: string) => {
    setFocusAreas(prev => ({
      ...prev,
      [day]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Crear Rutina Semanal
          </DialogTitle>
          <DialogDescription>
            Configura tu rutina de entrenamiento semanal personalizada
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-700">¿Cuántos días entrenarás por semana?</h3>
            <div className="flex justify-center mb-2">
              <span className="text-3xl font-bold text-purple-600">{days}</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              step="1"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="w-full flex justify-between mt-1 px-1 text-xs text-gray-500">
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-700">Enfoque por día</h3>
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: days }).map((_, index) => {
                const dayNumber = (index + 1).toString();
                return (
                  <div key={dayNumber} className="flex items-center">
                    <div className="w-20 font-medium">
                      Día {dayNumber}:
                    </div>
                    <Select 
                      value={focusAreas[dayNumber] || "Full Body"} 
                      onValueChange={(value) => handleDayFocusChange(dayNumber, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un enfoque" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pecho y Tríceps">💪 Pecho y Tríceps</SelectItem>
                        <SelectItem value="Espalda y Bíceps">🏋️ Espalda y Bíceps</SelectItem>
                        <SelectItem value="Piernas y Hombros">🦵 Piernas y Hombros</SelectItem>
                        <SelectItem value="Full Body">🏃 Full Body</SelectItem>
                        <SelectItem value="Core y Cardio">❤️ Core y Cardio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={createAutomaticRoutine}
            className="gradient-btn"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Crear Mi Rutina Semanal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWeeklyRoutineDialog;
