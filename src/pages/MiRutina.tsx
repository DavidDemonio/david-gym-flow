import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, Download, Calendar, Clock, BarChart3, Dumbbell, Plus, Info, Play, History, Database, Edit, Trash2, Check, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { toast } from '../hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import ExerciseAnalytics from '../components/ExerciseAnalytics';
import WorkoutTimer, { WorkoutStats } from '../components/WorkoutTimer';
import { mysqlConnection, Routine, Exercise } from '../utils/mysqlConnection';
import PdfService from '../services/PdfService';

// Status types for routines
type RoutineStatus = 'pending' | 'in-progress' | 'completed';

// Mock data para ejercicios
const mockExercises = {
  fuerza: {
    principiante: {
      casa: [
        {day: 'Día 1', focus: 'Tren Superior', exercises: [
          {name: 'Flexiones', sets: 3, reps: '8-10', rest: '90 seg', tips: 'Mantén el core activo', calories: 8},
          {name: 'Fondos en silla', sets: 3, reps: '8-10', rest: '90 seg', tips: 'Hombros alejados de las orejas', calories: 7},
          {name: 'Remo con toalla', sets: 3, reps: '10-12', rest: '60 seg', tips: 'Contrae la espalda', calories: 6},
          {name: 'Extensiones de tríceps', sets: 3, reps: '12-15', rest: '60 seg', tips: 'Codos cerca de la cabeza', calories: 5}
        ]},
        {day: 'Día 2', focus: 'Tren Inferior', exercises: [
          {name: 'Sentadillas', sets: 3, reps: '12-15', rest: '90 seg', tips: 'Rodillas en línea con los pies', calories: 10},
          {name: 'Estocadas', sets: 3, reps: '10 por pierna', rest: '60 seg', tips: 'Mantén la espalda recta', calories: 9},
          {name: 'Puente de glúteos', sets: 3, reps: '15-20', rest: '60 seg', tips: 'Aprieta los glúteos al subir', calories: 7},
          {name: 'Elevaciones de pantorrilla', sets: 3, reps: '20-25', rest: '30 seg', tips: 'Extiende completamente', calories: 5}
        ]},
        {day: 'Día 3', focus: 'Full Body', exercises: [
          {name: 'Burpees', sets: 3, reps: '8-10', rest: '90 seg', tips: 'Mantén un ritmo constante', calories: 12},
          {name: 'Mountain Climbers', sets: 3, reps: '20 por pierna', rest: '60 seg', tips: 'Core estable', calories: 9},
          {name: 'Superman', sets: 3, reps: '12-15', rest: '60 seg', tips: 'Eleva brazos y piernas', calories: 6},
          {name: 'Plancha', sets: 3, reps: '30-45 seg', rest: '60 seg', tips: 'Alineación desde cabeza a talones', calories: 7}
        ]}
      ]
    },
    intermedio: {
      basico: [
        {day: 'Día 1', focus: 'Pecho y Tríceps', exercises: []},
        {day: 'Día 2', focus: 'Espalda y Bíceps', exercises: []},
        {day: 'Día 3', focus: 'Piernas y Hombros', exercises: []}
      ]
    }
  },
  volumen: {
    principiante: {
      casa: [
        {day: 'Día 1', focus: 'Pecho y Brazos', exercises: []},
        {day: 'Día 2', focus: 'Piernas y Core', exercises: []},
        {day: 'Día 3', focus: 'Espalda y Hombros', exercises: []}
      ]
    }
  },
  definicion: {
    principiante: {
      casa: [
        {day: 'Día 1', focus: 'Full Body + HIIT', exercises: []},
        {day: 'Día 2', focus: 'Cardio y Core', exercises: []},
        {day: 'Día 3', focus: 'Full Body Circuito', exercises: []}
      ]
    }
  }
};

interface WeeklyRoutine {
  name: string;
  days: number;
  dayNames: string[];
  focusAreas: Record<string, string>;
  exercises: Record<string, any[]>;
  status?: RoutineStatus;
}

interface WorkoutHistory {
  date: string;
  duration: number;
  calories: number;
  exercises: number;
  sets: number;
}

const MiRutina = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeDay, setActiveDay] = useState(0);
  const [weeklyRoutine, setWeeklyRoutine] = useState<WeeklyRoutine | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [liveWorkoutActive, setLiveWorkoutActive] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([]);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Intentar obtener datos del formulario o usar valores por defecto
  const formData = location.state?.formData || {
    objetivo: 'fuerza',
    nivel: 'principiante',
    dias: 3,
    equipamiento: 'casa'
  };
  
  // Verificar conexión a la base de datos y cargar datos al iniciar
  useEffect(() => {
    const isConnected = mysqlConnection.isConnected();
    setDatabaseConnected(isConnected);
    
    if (isConnected) {
      // Cargar rutinas guardadas en la base de datos
      loadSavedRoutines();
    }
  }, []);
  
  const loadSavedRoutines = async () => {
    try {
      const routines = await mysqlConnection.getRoutines();
      if (routines && routines.length > 0) {
        setSavedRoutines(routines);
        console.log("Rutinas cargadas desde MySQL:", routines.length);
        
        // Si hay rutinas y ninguna seleccionada, seleccionar la primera
        if (!selectedRoutineId && routines.length > 0) {
          setSelectedRoutineId(routines[0].id);
        }
      }
    } catch (err) {
      console.error("Error al cargar rutinas desde MySQL:", err);
    }
  };
  
  // Verificar si hay una rutina semanal en localStorage al cargar
  useEffect(() => {
    // Primero intentamos cargar desde el parámetro de location
    if (location.state?.weeklyRoutine) {
      const savedRoutine = localStorage.getItem('weeklyRoutine');
      if (savedRoutine) {
        try {
          setWeeklyRoutine(JSON.parse(savedRoutine));
        } catch (err) {
          console.error("Error parsing weekly routine data:", err);
        }
      }
    } 
    // Si no hay rutina en el state o en localStorage y hay rutinas en MySQL, usar esas
    else if (databaseConnected && selectedRoutineId && savedRoutines.length > 0) {
      // Encontrar la rutina seleccionada
      const selectedRoutine = savedRoutines.find(r => r.id === selectedRoutineId);
      if (selectedRoutine) {
        convertRoutineToWeeklyFormat(selectedRoutine);
      }
    }
    
    // Cargar historial de entrenamientos
    const savedHistory = localStorage.getItem('workoutHistory');
    if (savedHistory) {
      try {
        setWorkoutHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error("Error parsing workout history data:", err);
      }
    }
  }, [location, savedRoutines, selectedRoutineId, databaseConnected]);
  
  // Convertir rutina de la base de datos al formato necesario para la interfaz
  const convertRoutineToWeeklyFormat = (selectedRoutine: Routine) => {
    const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const selectedDays = weekDays.slice(0, selectedRoutine.dias);
    
    // Crear objeto de enfoque por día
    const focusAreas: Record<string, string> = {};
    Object.keys(selectedRoutine.exercises).forEach((day, index) => {
      const dayNumber = (index + 1).toString();
      const exercises = selectedRoutine.exercises[day];
      // Detectar el enfoque basado en los grupos musculares más frecuentes
      const muscleGroups = exercises.flatMap(ex => ex.muscleGroups || []);
      
      if (muscleGroups.includes("Pecho") && muscleGroups.includes("Tríceps")) {
        focusAreas[dayNumber] = "Pecho y Tríceps";
      } else if (muscleGroups.includes("Espalda") && muscleGroups.includes("Bíceps")) {
        focusAreas[dayNumber] = "Espalda y Bíceps";
      } else if (muscleGroups.includes("Piernas") || muscleGroups.includes("Cuádriceps")) {
        focusAreas[dayNumber] = "Piernas y Hombros";
      } else if (muscleGroups.includes("Core") || muscleGroups.includes("Abdominales")) {
        focusAreas[dayNumber] = "Core y Cardio";
      } else {
        focusAreas[dayNumber] = "Full Body";
      }
    });
    
    // Crear rutina semanal
    const routineData: WeeklyRoutine = {
      name: selectedRoutine.name,
      days: selectedRoutine.dias,
      dayNames: selectedDays,
      focusAreas: focusAreas,
      exercises: selectedRoutine.exercises,
      status: selectedRoutine.status as RoutineStatus || 'pending'
    };
    
    setWeeklyRoutine(routineData);
  };
  
  // Obtener rutina basada en los datos del formulario
  const rutina = location.state?.formData ? 
    (mockExercises[location.state.formData.objetivo]?.[location.state.formData.nivel]?.[location.state.formData.equipamiento] || []) : [];
  
  // Manejar la descarga de la rutina en PDF
  const handleDownload = async () => {
    toast({
      title: "Generando PDF...",
      description: "Tu rutina se está convirtiendo a PDF",
    });
    
    try {
      // Determinar qué datos de rutina usar
      const routineData = weeklyRoutine || {
        name: "Mi Rutina Personalizada",
        days: location.state?.formData?.dias || 3,
        dayNames: rutina.map(day => day.day),
        focusAreas: Object.fromEntries(
          rutina.map((day, index) => [(index + 1).toString(), day.focus])
        ),
        exercises: Object.fromEntries(
          rutina.map((day, index) => [day.day, day.exercises])
        )
      };
      
      await PdfService.generateRoutinePDF(routineData);
      
      toast({
        title: "¡PDF generado!",
        description: "Tu rutina ha sido descargada como PDF",
      });
    } catch (err) {
      console.error('Error al generar el PDF:', err);
      toast({
        variant: "destructive",
        title: "Error al generar PDF",
        description: "Ocurrió un problema al crear el archivo PDF",
      });
    }
  };
  
  // Navegar a la página de máquinas y ejercicios
  const handleExploreExercises = () => {
    navigate('/maquinas-ejercicios');
  };
  
  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };
  
  // Iniciar entrenamiento en vivo
  const startLiveWorkout = () => {
    setLiveWorkoutActive(true);
  };
  
  // Completar entrenamiento en vivo
  const completeLiveWorkout = (stats: WorkoutStats) => {
    // Guardar estadísticas del entrenamiento
    const newWorkoutEntry: WorkoutHistory = {
      date: stats.date.toISOString(),
      duration: stats.duration,
      calories: stats.totalCalories,
      exercises: stats.exercisesCompleted,
      sets: stats.setsCompleted
    };
    
    const updatedHistory = [...workoutHistory, newWorkoutEntry];
    setWorkoutHistory(updatedHistory);
    localStorage.setItem('workoutHistory', JSON.stringify(updatedHistory));
    
    // Si hay una rutina activa y está "in-progress", actualizar su estado a "completed"
    if (weeklyRoutine && weeklyRoutine.status === 'in-progress' && selectedRoutineId) {
      updateRoutineStatus(selectedRoutineId, 'completed');
    }
    
    setLiveWorkoutActive(false);
    setShowAnalytics(true);
  };
  
  // Cancelar entrenamiento en vivo
  const cancelLiveWorkout = () => {
    setLiveWorkoutActive(false);
  };
  
  // Seleccionar una rutina guardada
  const handleSelectRoutine = (routineId: number) => {
    setSelectedRoutineId(routineId);
    // Encontrar la rutina seleccionada
    const selectedRoutine = savedRoutines.find(r => r.id === routineId);
    if (selectedRoutine) {
      convertRoutineToWeeklyFormat(selectedRoutine);
      setActiveDay(0);
    }
  };
  
  // Actualizar el nombre de una rutina
  const handleStartEditName = () => {
    if (weeklyRoutine) {
      setNewRoutineName(weeklyRoutine.name);
      setIsEditingName(true);
      // Focus the input after it appears
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 10);
    }
  };
  
  // Guardar el nuevo nombre de la rutina
  const handleSaveRoutineName = async () => {
    if (!selectedRoutineId || !newRoutineName.trim()) {
      setIsEditingName(false);
      return;
    }
    
    try {
      await mysqlConnection.updateRoutineName(selectedRoutineId, newRoutineName.trim());
      
      // Update local state
      setSavedRoutines(prev => 
        prev.map(routine => 
          routine.id === selectedRoutineId ? { ...routine, name: newRoutineName.trim() } : routine
        )
      );
      
      // Update weekly routine
      if (weeklyRoutine) {
        setWeeklyRoutine({ ...weeklyRoutine, name: newRoutineName.trim() });
      }
      
      toast({
        title: "Nombre actualizado",
        description: "El nombre de la rutina ha sido actualizado con éxito",
      });
      
      // Notify via email
      try {
        await fetch('/api/email/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: "Rutina Actualizada",
            text: `La rutina "${newRoutineName}" ha sido renombrada en tu perfil de David GymFlow.`,
          }),
        });
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    } catch (error) {
      console.error('Error updating routine name:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el nombre de la rutina",
      });
    }
    
    setIsEditingName(false);
  };
  
  // Abrir diálogo de confirmación para eliminar rutina
  const handleConfirmDelete = (routineId: number) => {
    setRoutineToDelete(routineId);
    setShowDeleteDialog(true);
  };
  
  // Eliminar rutina
  const handleDeleteRoutine = async () => {
    if (!routineToDelete) {
      setShowDeleteDialog(false);
      return;
    }
    
    try {
      // Get the name before deletion for the notification
      const routineName = savedRoutines.find(r => r.id === routineToDelete)?.name || "Rutina";
      
      await mysqlConnection.deleteRoutine(routineToDelete);
      
      // Update local state
      setSavedRoutines(prev => prev.filter(routine => routine.id !== routineToDelete));
      
      // If the deleted routine was selected, select another one or set to null
      if (selectedRoutineId === routineToDelete) {
        const remainingRoutines = savedRoutines.filter(r => r.id !== routineToDelete);
        if (remainingRoutines.length > 0) {
          setSelectedRoutineId(remainingRoutines[0].id);
          convertRoutineToWeeklyFormat(remainingRoutines[0]);
        } else {
          setSelectedRoutineId(null);
          setWeeklyRoutine(null);
        }
      }
      
      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada con éxito",
      });
      
      // Notify via email
      try {
        await fetch('/api/email/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: "Rutina Eliminada",
            text: `La rutina "${routineName}" ha sido eliminada de tu perfil de David GymFlow.`,
          }),
        });
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la rutina",
      });
    }
    
    setShowDeleteDialog(false);
    setRoutineToDelete(null);
  };
  
  // Actualizar el estado de una rutina
  const updateRoutineStatus = async (routineId: number, status: RoutineStatus) => {
    try {
      await mysqlConnection.updateRoutineStatus(routineId, status);
      
      // Update local state
      setSavedRoutines(prev => 
        prev.map(routine => 
          routine.id === routineId ? { ...routine, status } : routine
        )
      );
      
      // Update weekly routine
      if (weeklyRoutine) {
        setWeeklyRoutine({ ...weeklyRoutine, status });
      }
      
      const statusMessages = {
        'pending': 'pendiente',
        'in-progress': 'en progreso',
        'completed': 'completada'
      };
      
      toast({
        title: "Estado actualizado",
        description: `La rutina ahora está ${statusMessages[status]}`,
      });
      
      // Notify via email
      try {
        const routineName = savedRoutines.find(r => r.id === routineId)?.name || "Rutina";
        
        await fetch('/api/email/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: "Estado de Rutina Actualizado",
            text: `La rutina "${routineName}" ahora está ${statusMessages[status]} en tu perfil de David GymFlow.`,
          }),
        });
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    } catch (error) {
      console.error('Error updating routine status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado de la rutina",
      });
    }
  };
  
  // Calcular calorías totales quemadas por día
  const calculateDailyCalories = (dayIndex) => {
    if (weeklyRoutine) {
      const dayName = weeklyRoutine.dayNames[dayIndex];
      const exercises = weeklyRoutine.exercises[dayName] || [];
      return exercises.reduce((total, ex) => total + (ex.calories || 0) * ex.sets, 0);
    }
    
    if (rutina[dayIndex]) {
      return rutina[dayIndex].exercises.reduce((total, ex) => total + (ex.calories || 0) * ex.sets, 0);
    }
    
    return 0;
  };
  
  const calculateWeeklyCalories = () => {
    let total = 0;
    
    if (weeklyRoutine) {
      weeklyRoutine.dayNames.forEach((dayName, index) => {
        total += calculateDailyCalories(index);
      });
    } else {
      rutina.forEach((_, index) => {
        total += calculateDailyCalories(index);
      });
    }
    
    return total;
  };
  
  // Obtener ejercicios del día actual
  const getCurrentDayExercises = () => {
    if (weeklyRoutine) {
      const dayName = weeklyRoutine.dayNames[activeDay];
      return weeklyRoutine.exercises[dayName] || [];
    }
    
    if (rutina[activeDay]) {
      return rutina[activeDay].exercises;
    }
    
    return [];
  };

  // Mostrar entrenamiento en vivo
  if (liveWorkoutActive) {
    const currentExercises = getCurrentDayExercises();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <WorkoutTimer 
          exercises={currentExercises} 
          onComplete={completeLiveWorkout}
          onCancel={cancelLiveWorkout}
        />
      </div>
    );
  }
  
  // Renderizar badge según el estado de la rutina
  const renderStatusBadge = (status: RoutineStatus | undefined) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50">Pendiente</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50">En progreso</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50">Completada</Badge>;
      default:
        return null;
    }
  };
  
  // Si hay una rutina semanal, mostrarla
  if (weeklyRoutine) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <Calendar className="h-7 w-7 text-purple-500 dark:text-purple-400" />
              
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={nameInputRef}
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                    className="py-1 text-lg font-bold w-[250px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveRoutineName();
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <Button size="sm" variant="ghost" onClick={handleSaveRoutineName} className="w-8 h-8 p-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)} className="w-8 h-8 p-0">
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              ) : (
                <h1 className="text-3xl font-bold gradient-text flex items-center">
                  {weeklyRoutine.name || "Mi Rutina Semanal"}
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEditName}
                    className="ml-2 opacity-50 hover:opacity-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </h1>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {/* Status dropdown */}
              {selectedRoutineId && (
                <DropdownMenu open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 p-2 gap-1 text-sm">
                      {renderStatusBadge(weeklyRoutine.status)}
                      <span className="sr-only">Cambiar estado</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem 
                      onClick={() => updateRoutineStatus(selectedRoutineId, 'pending')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">Pendiente</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateRoutineStatus(selectedRoutineId, 'in-progress')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">En progreso</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateRoutineStatus(selectedRoutineId, 'completed')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Badge variant="outline" className="bg-green-100 text-green-800">Completada</Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Saved routines selector */}
              {databaseConnected && savedRoutines.length > 0 && (
                <div className="flex items-center gap-2">
                  <select 
                    className="text-sm border rounded p-1 bg-background dark:bg-gray-800 h-8" 
                    value={selectedRoutineId || ''}
                    onChange={(e) => handleSelectRoutine(Number(e.target.value))}
                  >
                    {savedRoutines.map(routine => (
                      <option key={routine.id} value={routine.id}>{routine.name}</option>
                    ))}
                  </select>
                  {selectedRoutineId && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleConfirmDelete(selectedRoutineId)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 w-8 h-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="ml-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                    <Database className="h-3 w-3 mr-1" />
                    MySQL
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={toggleAnalytics}
              variant={showAnalytics ? "default" : "outline"}
              className="px-4 py-2 flex items-center text-sm animate-fade-in"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {showAnalytics ? 'Ocultar Analytics' : 'Ver Analytics'}
            </Button>
            <Button 
              onClick={handleExploreExercises}
              variant="outline"
              className="px-4 py-2 flex items-center text-sm animate-fade-in animate-delay-100"
            >
              <Plus className="mr-2 h-4 w-4" />
              Explorar Ejercicios
            </Button>
            <button 
              onClick={handleDownload}
              className="gradient-btn px-4 py-2 flex items-center text-sm animate-fade-in animate-delay-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </button>
          </div>
        </div>
        
        {showAnalytics && (
          <ExerciseAnalytics 
            weeklyCalories={calculateWeeklyCalories()}
            dailyCalories={weeklyRoutine.dayNames.map((_, index) => calculateDailyCalories(index))}
            dayNames={weeklyRoutine.dayNames}
            workoutHistory={workoutHistory}
          />
        )}
        
        {/* Pestañas de días */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {weeklyRoutine.dayNames.map((day, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap flex items-center gap-1 animate-fade-in ${
                  activeDay === index 
                    ? 'bg-purple-600 text-white dark:bg-purple-500 transform scale-105' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                } hover:scale-105`}
                style={{animationDelay: `${index * 75}ms`}}
                onClick={() => setActiveDay(index)}
              >
                {day}
                <span className="text-xs ml-1">
                  {weeklyRoutine.focusAreas[(index + 1).toString()]}
                </span>
                <span className="ml-1 text-xs flex items-center" title="Calorías">
                  <Clock className="h-3 w-3 mr-1" />
                  {calculateDailyCalories(index)}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Contenido del día seleccionado */}
        {weeklyRoutine.dayNames[activeDay] && (
          <div className="glass-card rounded-xl p-6 animate-fadeInUp">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold mb-1">{weeklyRoutine.dayNames[activeDay]}</h2>
                {weeklyRoutine.exercises[weeklyRoutine.dayNames[activeDay]]?.length > 0 && (
                  <Button 
                    onClick={startLiveWorkout}
                    className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar entrenamiento
                  </Button>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-purple-600 dark:text-purple-400 font-medium">
                  {weeklyRoutine.focusAreas[(activeDay + 1).toString()]}
                </p>
                <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                  <Activity className="h-4 w-4 mr-1" />
                  {calculateDailyCalories(activeDay)} calorías
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {weeklyRoutine.exercises[weeklyRoutine.dayNames[activeDay]]?.map((exercise, index) => (
                <div 
                  key={index}
                  className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:border-purple-200 dark:hover:border-purple-700 transition-all hover:shadow-md transform hover:-translate-y-1"
                  style={{animationDelay: `${index * 150}ms`}}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{exercise.emoji || "💪"}</span>
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Series</p>
                      <p className="font-medium">{exercise.sets || 3}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Repeticiones</p>
                      <p className="font-medium">{exercise.reps || "12-15"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Descanso</p>
                      <p className="font-medium">{exercise.rest || "60 seg"}</p>
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Calorías por rep.</p>
                      <p className="font-medium flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {exercise.calories || 5} kcal
                      </p>
                    </div>
                  </div>
                  
                  {exercise.description && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300 flex">
                      <Info className="text-blue-500 dark:text-blue-400 h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <p>{exercise.description}</p>
                    </div>
                  )}
                </div>
              ))}

              {(!weeklyRoutine.exercises[weeklyRoutine.dayNames[activeDay]] || 
                weeklyRoutine.exercises[weeklyRoutine.dayNames[activeDay]].length === 0) && (
                <div className="text-center p-6">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No hay ejercicios asignados para este día</p>
                  <Button 
                    onClick={handleExploreExercises}
                    className="gradient-btn hover:scale-105 transition-transform"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir ejercicios
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar rutina</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 sm:space-x-0 sm:justify-end">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteRoutine}>Eliminar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  // Si no hay rutina disponible o si no hay rutina semanal, mostrar alternativas
  if (rutina.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="glass-card rounded-xl p-8 max-w-2xl mx-auto animate-fadeInUp">
          <h1 className="text-2xl font-bold mb-4">No hay rutina disponible</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No se encontró una rutina para la combinación seleccionada. Por favor, crea una nueva rutina.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/crear-rutina" 
              className="gradient-btn px-6 py-2 inline-flex items-center hover:scale-105 transition-transform"
            >
              Crear Nueva Rutina
              <Dumbbell className="ml-2 h-5 w-5" />
            </a>
            <Button
              onClick={handleExploreExercises}
              variant="outline"
              className="px-6 py-2 inline-flex items-center hover:scale-105 transition-transform"
            >
              Explorar Ejercicios
              <Plus className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Si no hay rutina semanal, mostrar la rutina normal
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold gradient-text flex items-center">
          <Activity className="mr-3 h-7 w-7" />
          Mi Rutina
        </h1>
        
        <div className="flex gap-3">
          <Button 
            onClick={toggleAnalytics}
            variant={showAnalytics ? "default" : "outline"}
            className="px-4 py-2 flex items-center text-sm animate-fade-in"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {showAnalytics ? 'Ocultar Analytics' : 'Ver Analytics'}
          </Button>
          <Button 
            onClick={handleExploreExercises}
            variant="outline"
            className="px-4 py-2 flex items-center text-sm animate-fade-in animate-delay-100"
          >
            <Plus className="mr-2 h-4 w-4" />
            Explorar Ejercicios
          </Button>
          <button 
            onClick={handleDownload}
            className="gradient-btn px-4 py-2 flex items-center text-sm animate-fade-in animate-delay-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </button>
        </div>
      </div>
      
      {showAnalytics && (
        <ExerciseAnalytics 
          weeklyCalories={calculateWeeklyCalories()}
          dailyCalories={rutina.map((_, index) => calculateDailyCalories(index))}
          dayNames={rutina.map(day => day.day)}
          workoutHistory={workoutHistory}
        />
      )}
      
      {/* Resto del código para mostrar rutinas... */}
      {/* ... keep existing code */}
    </div>
  );
};

export default MiRutina;
