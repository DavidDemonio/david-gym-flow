import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Exercise as DataExercise } from "../data/equipmentData";
import { Exercise, mysqlConnection, Routine } from "../utils/mysqlConnection";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Check, Database, Loader2 } from "lucide-react";
import { statsManager } from "../utils/statsManager";

interface CreateWeeklyRoutineDialogProps {
  exercises: DataExercise[];
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Comprobar si estamos conectados a MySQL
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [databaseExercises, setDatabaseExercises] = useState<Exercise[]>([]);
  
  useEffect(() => {
    // Comprobar conexión a la base de datos
    const checkConnection = async () => {
      const isConnected = mysqlConnection.isConnected();
      setDatabaseConnected(isConnected);
      
      if (isConnected) {
        // Cargar ejercicios de la base de datos
        try {
          const dbExercises = await mysqlConnection.getExercises();
          if (dbExercises && dbExercises.length > 0) {
            setDatabaseExercises(dbExercises);
            console.log("Ejercicios cargados desde MySQL:", dbExercises.length);
          }
        } catch (err) {
          console.error("Error al cargar ejercicios:", err);
        }
      }
    };
    
    if (open) {
      checkConnection();
    }
  }, [open]);
  
  // Función para crear rutina automáticamente basada en los grupos musculares
  const createAutomaticRoutine = async () => {
    setIsLoading(true);
    try {
      const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      const selectedDays = weekDays.slice(0, days);
      
      const routineData: DayExercises = {};
      
      // Determinar qué conjunto de ejercicios usar
      const exercisesToUse = databaseConnected && databaseExercises.length > 0 
        ? databaseExercises 
        : exercises.map(ex => convertToMySQLExercise(ex));
      
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
        } else {
          // Para "Full Body" o cualquier otro enfoque no especificado
          targetMuscles = ["Pecho", "Espalda", "Hombros", "Tríceps", "Bíceps", "Abdominales", "Cuádriceps", "Glúteos"];
        }
        
        // Filtrar ejercicios que coincidan con los grupos musculares objetivo
        let dayExercises = exercisesToUse.filter(ex => {
          if (!ex.muscleGroups) return false;
          const muscleGroups = Array.isArray(ex.muscleGroups) ? ex.muscleGroups : [ex.muscleGroups];
          return muscleGroups.some(mg => targetMuscles.includes(mg));
        });
        
        // Si no hay suficientes ejercicios, añadir algunos genéricos
        if (dayExercises.length < 3) {
          const genericExercises = exercisesToUse.filter(ex => !dayExercises.includes(ex));
          dayExercises = [...dayExercises, ...genericExercises.slice(0, 3 - dayExercises.length)];
        }
        
        // Limitar a 4-6 ejercicios por día
        dayExercises = dayExercises.slice(0, 5);
        
        routineData[day] = dayExercises;
      });
      
      // Construir un objeto con los datos de la rutina
      const routineName = "Mi Rutina Semanal";
      const weeklyRoutineData = {
        name: routineName,
        days: days,
        dayNames: selectedDays,
        focusAreas: focusAreas,
        exercises: routineData
      };
      
      // Guardar la rutina en localStorage
      localStorage.setItem('weeklyRoutine', JSON.stringify(weeklyRoutineData));
      
      // Si estamos conectados a la base de datos, guardar también en MySQL
      if (databaseConnected) {
        try {
          const routineToSave: Routine = {
            id: Date.now(), // This generates a numeric timestamp
            name: routineName,
            objetivo: "personalizada",
            nivel: "personalizada", 
            equipamiento: "personalizada",
            dias: days, // days is already a number
            exercises: routineData,
            createdAt: new Date().toISOString()
          };
          
          // Primero obtenemos las rutinas existentes
          const existingRoutines = await mysqlConnection.getRoutines();
          
          // Añadimos la nueva rutina y guardamos toda la colección
          const updatedRoutines = [...existingRoutines, routineToSave];
          const saveResult = await mysqlConnection.saveRoutines(updatedRoutines);
          
          if (saveResult) {
            // Update statistics - a new routine was created
            statsManager.addRoutineCompleted();
            
            // Store updated routines in localStorage for immediate access in MiRutina page
            localStorage.setItem('app_routines', JSON.stringify(updatedRoutines));
            
            toast({
              title: "¡Rutina guardada en MySQL!",
              description: `Tu rutina de ${days} días ha sido guardada en la base de datos`,
            });
          } else {
            throw new Error("Error al guardar la rutina");
          }
        } catch (err) {
          console.error("Error al guardar rutina en MySQL:", err);
          toast({
            variant: "destructive",
            title: "Error al guardar",
            description: "No se pudo guardar la rutina en la base de datos",
          });
        }
      }
      
      // Mostrar notificación
      toast({
        title: "¡Rutina semanal creada!",
        description: `Tu rutina de ${days} días ha sido creada exitosamente`,
      });
      
      // Cerrar diálogo y navegar a la página de rutina
      onClose();
      navigate('/mi-rutina', { state: { weeklyRoutine: true } });
    } catch (err) {
      console.error("Error al crear rutina:", err);
      toast({
        variant: "destructive",
        title: "Error al crear rutina",
        description: "Ocurrió un error al generar tu rutina",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert from data/equipmentData Exercise to utils/mysqlConnection Exercise
  const convertToMySQLExercise = (ex: DataExercise): Exercise => {
    return {
      id: ex.id,
      name: ex.name,
      emoji: ex.emoji,
      equipment: Array.isArray(ex.equipment) ? ex.equipment : ex.equipment ? [ex.equipment] : null,
      muscleGroups: ex.muscleGroups,
      difficulty: ex.difficulty,
      description: ex.description,
      requiresGym: ex.requiresGym,
      caloriesPerRep: ex.caloriesPerRep,
      videoUrl: ex.videoUrl
    };
  };

  const handleDayFocusChange = (day: string, value: string) => {
    setFocusAreas(prev => ({
      ...prev,
      [day]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Crear Rutina Semanal
          </DialogTitle>
          <DialogDescription>
            Configura tu rutina de entrenamiento semanal personalizada
            {databaseConnected && databaseExercises.length > 0 && (
              <div className="mt-1 flex items-center text-green-600 dark:text-green-400 text-sm">
                <Database className="h-4 w-4 mr-1" />
                <span>MySQL conectado ({databaseExercises.length} ejercicios disponibles)</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">¿Cuántos días entrenarás por semana?</h3>
            <div className="flex justify-center mb-2">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{days}</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              step="1"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-500"
            />
            <div className="w-full flex justify-between mt-1 px-1 text-xs text-gray-500 dark:text-gray-400">
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Enfoque por día</h3>
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: days }).map((_, index) => {
                const dayNumber = (index + 1).toString();
                return (
                  <div key={dayNumber} className="flex items-center">
                    <div className="w-20 font-medium dark:text-gray-300">
                      Día {dayNumber}:
                    </div>
                    <Select 
                      value={focusAreas[dayNumber] || "Full Body"} 
                      onValueChange={(value) => handleDayFocusChange(dayNumber, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un enfoque" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
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
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
          <Button 
            onClick={createAutomaticRoutine}
            className="gradient-btn w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando rutina...
              </>
            ) : databaseConnected && databaseExercises.length > 0 ? (
              <>
                <Database className="mr-2 h-4 w-4" />
                Crear Rutina con datos MySQL
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Crear Mi Rutina Semanal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWeeklyRoutineDialog;
