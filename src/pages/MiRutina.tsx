
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, Download, Calendar, Clock, BarChart3, Dumbbell, Info, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Button } from "@/components/ui/button";

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
}

const MiRutina = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeDay, setActiveDay] = useState(0);
  const [weeklyRoutine, setWeeklyRoutine] = useState<WeeklyRoutine | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Intentar obtener datos del formulario o usar valores por defecto
  const formData = location.state?.formData || {
    objetivo: 'fuerza',
    nivel: 'principiante',
    dias: 3,
    equipamiento: 'casa'
  };
  
  // Verificar si hay una rutina semanal en localStorage al cargar
  useEffect(() => {
    const savedRoutine = localStorage.getItem('weeklyRoutine');
    if (savedRoutine) {
      try {
        setWeeklyRoutine(JSON.parse(savedRoutine));
      } catch (err) {
        console.error("Error parsing weekly routine data:", err);
      }
    }
  }, [location]);
  
  // Obtener rutina basada en los datos del formulario
  const rutina = mockExercises[formData.objetivo]?.[formData.nivel]?.[formData.equipamiento] || [];
  
  // Manejar la descarga de la rutina
  const handleDownload = () => {
    toast({
      title: "Descarga iniciada",
      description: "Tu rutina se está descargando como PDF",
    });
    
    // Aquí iría la lógica real de generación del PDF
    console.log('Descargando rutina:', weeklyRoutine || formData);
  };
  
  // Navegar a la página de máquinas y ejercicios
  const handleExploreExercises = () => {
    navigate('/maquinas-ejercicios');
  };
  
  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
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
  
  // Si hay una rutina semanal, mostrarla
  if (weeklyRoutine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold gradient-text flex items-center">
            <Calendar className="mr-3 h-7 w-7" />
            Mi Rutina Semanal
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
            dailyCalories={weeklyRoutine.dayNames.map((_, index) => calculateDailyCalories(index))}
            dayNames={weeklyRoutine.dayNames}
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
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
              <h2 className="text-2xl font-bold mb-1">{weeklyRoutine.dayNames[activeDay]}</h2>
              <div className="flex justify-between items-center">
                <p className="text-purple-600 font-medium">
                  {weeklyRoutine.focusAreas[(activeDay + 1).toString()]}
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  <Activity className="h-4 w-4 mr-1" />
                  {calculateDailyCalories(activeDay)} calorías
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {weeklyRoutine.exercises[weeklyRoutine.dayNames[activeDay]]?.map((exercise, index) => (
                <div 
                  key={index}
                  className="border border-gray-100 rounded-lg p-4 bg-white hover:border-purple-200 transition-all hover:shadow-md transform hover:-translate-y-1"
                  style={{animationDelay: `${index * 150}ms`}}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{exercise.emoji}</span>
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Series</p>
                      <p className="font-medium">{exercise.sets || 3}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Repeticiones</p>
                      <p className="font-medium">{exercise.reps || "12-15"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Descanso</p>
                      <p className="font-medium">{exercise.rest || "60 seg"}</p>
                    </div>
                    <div className="text-green-600">
                      <p className="text-xs text-gray-500">Calorías por rep.</p>
                      <p className="font-medium flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {exercise.calories || 5} kcal
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex">
                    <Info className="text-blue-500 h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{exercise.description}</p>
                  </div>
                </div>
              ))}

              {(!weeklyRoutine.exercises[weeklyRoutine.dayNames[activeDay]] || 
                weeklyRoutine.exercises[weeklyRoutine.dayNames[activeDay]].length === 0) && (
                <div className="text-center p-6">
                  <p className="text-gray-500 mb-4">No hay ejercicios asignados para este día</p>
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
      </div>
    );
  }
  
  // Si no hay rutina semanal, mostrar la rutina normal
  // Si no hay rutina disponible
  if (rutina.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="glass-card rounded-xl p-8 max-w-2xl mx-auto animate-fadeInUp">
          <h1 className="text-2xl font-bold mb-4">No hay rutina disponible</h1>
          <p className="text-gray-600 mb-6">
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
        />
      )}
      
      {/* Resumen de la rutina */}
      <div className="glass-card rounded-xl p-6 mb-8 animate-fadeInUp">
        <h2 className="text-xl font-semibold mb-4">Resumen de tu rutina</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center mb-2">
              <BarChart3 className="text-purple-600 h-5 w-5 mr-2" />
              <h3 className="font-medium">Objetivo</h3>
            </div>
            <p className="text-gray-700 capitalize">{formData.objetivo}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center mb-2">
              <Activity className="text-blue-600 h-5 w-5 mr-2" />
              <h3 className="font-medium">Nivel</h3>
            </div>
            <p className="text-gray-700 capitalize">{formData.nivel}</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center mb-2">
              <Calendar className="text-indigo-600 h-5 w-5 mr-2" />
              <h3 className="font-medium">Frecuencia</h3>
            </div>
            <p className="text-gray-700">{formData.dias} días/semana</p>
          </div>
          
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-100 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center mb-2">
              <Dumbbell className="text-pink-600 h-5 w-5 mr-2" />
              <h3 className="font-medium">Equipo</h3>
            </div>
            <p className="text-gray-700 capitalize">{formData.equipamiento}</p>
          </div>
        </div>
      </div>
      
      {/* Pestañas de días */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {rutina.map((day, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full transition-all whitespace-nowrap hover:scale-105 animate-fade-in ${
                activeDay === index 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              style={{animationDelay: `${index * 75}ms`}}
              onClick={() => setActiveDay(index)}
            >
              {day.day} - {day.focus}
              <span className="ml-2 text-xs flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                {calculateDailyCalories(index)}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Contenido del día seleccionado */}
      {rutina[activeDay] && (
        <div className="glass-card rounded-xl p-6 animate-fadeInUp">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">{rutina[activeDay].day}</h2>
            <div className="flex justify-between items-center">
              <p className="text-purple-600 font-medium">{rutina[activeDay].focus}</p>
              <div className="flex items-center text-green-600 font-medium">
                <Activity className="h-4 w-4 mr-1" />
                {calculateDailyCalories(activeDay)} calorías
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {rutina[activeDay].exercises.map((exercise, index) => (
              <div 
                key={index}
                className="border border-gray-100 rounded-lg p-4 bg-white hover:border-purple-200 transition-all hover:shadow-md transform hover:-translate-y-1"
                style={{animationDelay: `${index * 150}ms`}}
              >
                <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Series</p>
                    <p className="font-medium">{exercise.sets}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Repeticiones</p>
                    <p className="font-medium">{exercise.reps}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Descanso</p>
                    <p className="font-medium">{exercise.rest}</p>
                  </div>
                  <div className="text-green-600">
                    <p className="text-xs text-gray-500">Calorías por rep.</p>
                    <p className="font-medium flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {exercise.calories || 5} kcal
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex">
                  <Info className="text-blue-500 h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{exercise.tips}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiRutina;
