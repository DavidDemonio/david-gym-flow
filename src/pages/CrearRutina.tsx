import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowRight, CheckCircle, Database } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Exercise, mysqlConnection } from "../utils/mysqlConnection";

const objetivos = [
  { id: 'fuerza', name: 'Fuerza', description: 'Aumentar tu fuerza y potencia muscular' },
  { id: 'volumen', name: 'Volumen', description: 'Ganar masa muscular y tamaño' },
  { id: 'definicion', name: 'Definición', description: 'Reducir grasa y marcar la musculatura' },
  { id: 'resistencia', name: 'Resistencia', description: 'Mejorar tu rendimiento y resistencia' }
];

const niveles = [
  { id: 'principiante', name: 'Principiante' },
  { id: 'intermedio', name: 'Intermedio' },
  { id: 'avanzado', name: 'Avanzado' }
];

const equipamientos = [
  { id: 'casa', name: 'En casa (mínimo equipamiento)' },
  { id: 'basico', name: 'Equipo básico (mancuernas, barras)' },
  { id: 'completo', name: 'Gimnasio completo' }
];

const CrearRutina = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    objetivo: '',
    nivel: '',
    dias: 3,
    equipamiento: '',
  });
  
  // Estado para ejercicios disponibles
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  // Estado para indicar si estamos conectados a la base de datos
  const [databaseConnected, setDatabaseConnected] = useState(false);

  // Cargar ejercicios desde la base de datos al iniciar
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      const isConnected = mysqlConnection.isConnected();
      setDatabaseConnected(isConnected);
      
      if (isConnected) {
        // Cargar ejercicios desde la base de datos
        try {
          const exercises = await mysqlConnection.getExercises();
          if (exercises && exercises.length > 0) {
            setAvailableExercises(exercises);
            console.log("Ejercicios cargados desde MySQL:", exercises.length);
          }
        } catch (err) {
          console.error("Error al cargar ejercicios:", err);
        }
      }
    };
    
    checkDatabaseConnection();
  }, []);

  const handleSelectObjetivo = (objetivo: string) => {
    setFormData({ ...formData, objetivo });
  };

  const handleSelectNivel = (nivel: string) => {
    setFormData({ ...formData, nivel });
  };

  const handleSelectEquipamiento = (equipamiento: string) => {
    setFormData({ ...formData, equipamiento });
  };

  const handleDiasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dias = parseInt(e.target.value);
    setFormData({ ...formData, dias });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.objetivo || !formData.nivel || !formData.equipamiento) {
      toast({
        variant: "destructive",
        title: "Error en el formulario",
        description: "Por favor completa todos los campos",
      });
      return;
    }
    
    // Decidir si usar datos de la base de datos o los mockups
    if (databaseConnected && availableExercises.length > 0) {
      await generateRoutineFromDatabase();
    } else {
      // Usar el método antiguo con datos mockup
      console.log('Datos enviados:', formData);
      
      // Simulando generación de rutina
      toast({
        title: "¡Rutina creada!",
        description: "Tu rutina personalizada está lista",
      });
      
      // Redireccionar a la página de rutina
      navigate('/mi-rutina', { state: { formData } });
    }
  };
  
  // Generar rutina desde la base de datos
  const generateRoutineFromDatabase = async () => {
    // Filtrar ejercicios según los criterios
    try {
      // Calcular ejercicios para cada día
      const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      const selectedDays = weekDays.slice(0, formData.dias);
      
      // Mapear nivel seleccionado a dificultad de ejercicio
      let difficultyLevel = "Principiante";
      if (formData.nivel === 'intermedio') difficultyLevel = "Intermedio";
      if (formData.nivel === 'avanzado') difficultyLevel = "Avanzado";
      
      // Mapear equipamiento seleccionado
      let equipmentType = "Sin equipo";
      if (formData.equipamiento === 'basico') equipmentType = "Mancuernas";
      if (formData.equipamiento === 'completo') equipmentType = "Máquinas";
      
      // Configuración para cada día de entrenamiento
      const dayFocus = [
        { day: 0, focus: ["Pecho", "Tríceps"], name: "Pecho y Tríceps" },
        { day: 1, focus: ["Espalda", "Bíceps"], name: "Espalda y Bíceps" },
        { day: 2, focus: ["Piernas", "Hombros", "Glúteos"], name: "Piernas y Hombros" },
        { day: 3, focus: ["Full body"], name: "Full Body" },
        { day: 4, focus: ["Core", "Abdominales"], name: "Core y Cardio" },
        { day: 5, focus: ["Pecho", "Espalda", "Hombros"], name: "Parte Superior" },
        { day: 6, focus: ["Piernas", "Glúteos", "Core"], name: "Parte Inferior" },
      ];
      
      // Generar rutina
      const routineData: {[day: string]: Exercise[]} = {};
      
      // Para cada día seleccionado
      for (let i = 0; i < selectedDays.length; i++) {
        const dayName = selectedDays[i];
        const dayConfig = dayFocus[i % dayFocus.length];
        
        // Filtrar ejercicios para este día
        let filteredExercises = availableExercises.filter(ex => {
          // Verificar dificultad si está disponible
          const difficultyMatch = !ex.difficulty || ex.difficulty === difficultyLevel;
          
          // Verificar grupo muscular
          const muscleMatch = ex.muscleGroups.some(mg => dayConfig.focus.includes(mg));
          
          // Verificar equipamiento
          let equipmentMatch = false;
          
          if (!ex.equipment) {
            equipmentMatch = true; // Sin requisitos de equipo
          } else if (formData.equipamiento === 'completo') {
            equipmentMatch = true; // Tenemos todo el equipo disponible
          } else if (Array.isArray(ex.equipment)) {
            // Verificar si alguna de las opciones de equipo coincide
            equipmentMatch = ex.equipment.includes("Sin equipo") || ex.equipment.includes(equipmentType);
          } else {
            // Si equipment es un string individual
            equipmentMatch = ex.equipment === "Sin equipo" || ex.equipment === equipmentType;
          }
          
          return difficultyMatch && muscleMatch && equipmentMatch;
        });
        
        // Si no hay suficientes ejercicios, agregar algunos genéricos
        if (filteredExercises.length < 4) {
          const genericExercises = availableExercises.filter(ex => {
            if (filteredExercises.includes(ex)) return false;
            
            // Verificar solo el equipamiento para ejercicios genéricos
            let equipmentMatch = false;
            
            if (!ex.equipment) {
              equipmentMatch = true; // Sin requisitos de equipo
            } else if (formData.equipamiento === 'completo') {
              equipmentMatch = true; // Tenemos todo el equipo disponible
            } else if (Array.isArray(ex.equipment)) {
              // Verificar si alguna de las opciones de equipo coincide
              equipmentMatch = ex.equipment.includes("Sin equipo") || ex.equipment.includes(equipmentType);
            } else {
              // Si equipment es un string individual
              equipmentMatch = ex.equipment === "Sin equipo" || ex.equipment === equipmentType;
            }
            
            return equipmentMatch;
          });
          
          // Añadir ejercicios genéricos hasta tener al menos 4
          filteredExercises = [...filteredExercises, ...genericExercises.slice(0, 4 - filteredExercises.length)];
        }
        
        // Limitar a 5 ejercicios por día como máximo
        filteredExercises = filteredExercises.slice(0, 5);
        
        // Guardar para este día
        routineData[dayName] = filteredExercises;
      }
      
      // Guardar rutina en la "base de datos"
      const weeklyRoutineData = {
        name: "Mi Rutina Personalizada",
        days: formData.dias,
        dayNames: selectedDays,
        focusAreas: Object.fromEntries(
          selectedDays.map((_, index) => [(index + 1).toString(), dayFocus[index % dayFocus.length].name])
        ),
        exercises: routineData
      };
      
      // Guardar en localStorage y en la "base de datos"
      localStorage.setItem('weeklyRoutine', JSON.stringify(weeklyRoutineData));
      
      if (mysqlConnection.isConnected()) {
        await mysqlConnection.saveRoutine({
          name: "Mi Rutina Personalizada",
          objetivo: formData.objetivo,
          nivel: formData.nivel,
          equipamiento: formData.equipamiento,
          dias: formData.dias,
          exercises: routineData
        });
      }
      
      toast({
        title: "¡Rutina creada!",
        description: "Tu rutina personalizada se ha generado con éxito desde la base de datos.",
      });
      
      // Redireccionar a la página de rutina
      navigate('/mi-rutina', { state: { weeklyRoutine: true } });
    } catch (err) {
      console.error("Error al generar rutina:", err);
      toast({
        variant: "destructive",
        title: "Error al generar rutina",
        description: "Ocurrió un error al generar tu rutina. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold mb-2 gradient-text">Crear Rutina Personalizada</h1>
          {databaseConnected && availableExercises.length > 0 && (
            <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
              <Database className="h-4 w-4 mr-1" />
              <span>MySQL conectado ({availableExercises.length} ejercicios)</span>
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-8">Completa la información para generar tu rutina perfecta</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección Objetivo */}
          <div className="glass-card rounded-xl p-6 animate-fadeInUp">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-700 w-7 h-7 rounded-full flex items-center justify-center mr-3">1</span>
              Selecciona tu objetivo principal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objetivos.map((objetivo) => (
                <div 
                  key={objetivo.id}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.objetivo === objetivo.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleSelectObjetivo(objetivo.id)}
                >
                  {formData.objetivo === objetivo.id && (
                    <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-purple-600" />
                  )}
                  <h3 className="font-semibold">{objetivo.name}</h3>
                  <p className="text-gray-500 text-sm">{objetivo.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sección Nivel */}
          <div className="glass-card rounded-xl p-6 animate-fadeInUp animate-delay-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-700 w-7 h-7 rounded-full flex items-center justify-center mr-3">2</span>
              ¿Cuál es tu nivel de experiencia?
            </h2>
            
            <div className="flex flex-wrap gap-4">
              {niveles.map((nivel) => (
                <button
                  key={nivel.id}
                  type="button"
                  className={`px-5 py-2 rounded-full border-2 transition-all ${
                    formData.nivel === nivel.id 
                      ? 'bg-purple-100 border-purple-500 text-purple-800' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleSelectNivel(nivel.id)}
                >
                  {nivel.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sección Días */}
          <div className="glass-card rounded-xl p-6 animate-fadeInUp animate-delay-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-700 w-7 h-7 rounded-full flex items-center justify-center mr-3">3</span>
              ¿Cuántos días puedes entrenar a la semana?
            </h2>
            
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-purple-600 mb-2">{formData.dias}</span>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={formData.dias}
                onChange={handleDiasChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="w-full flex justify-between mt-2 px-1 text-sm text-gray-500">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>
          </div>
          
          {/* Sección Equipamiento */}
          <div className="glass-card rounded-xl p-6 animate-fadeInUp animate-delay-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-700 w-7 h-7 rounded-full flex items-center justify-center mr-3">4</span>
              ¿Qué equipamiento tienes disponible?
            </h2>
            
            <div className="space-y-3">
              {equipamientos.map((equipo) => (
                <div
                  key={equipo.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.equipamiento === equipo.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleSelectEquipamiento(equipo.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      formData.equipamiento === equipo.id 
                        ? 'border-purple-600 bg-purple-600' 
                        : 'border-gray-400'
                    }`}>
                      {formData.equipamiento === equipo.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium">{equipo.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botón de envío */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="gradient-btn px-8 py-3 text-lg flex items-center"
            >
              {databaseConnected && availableExercises.length > 0 ? (
                <>
                  Generar Mi Rutina desde MySQL
                  <Database className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Generar Mi Rutina
                  <Dumbbell className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearRutina;
