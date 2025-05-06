
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Activity, Dumbbell, Database, Save, RotateCcw, Shield, Download, Upload } from "lucide-react";
import { equipmentList, exerciseData } from '../data/equipmentData';
import { mysqlConnection, DbConfig } from "../utils/mysqlConnection";

const muscleGroups = [
  "Pecho", "Espalda", "Hombros", "Tríceps", "Bíceps", "Abdominales",
  "Cuádriceps", "Isquiotibiales", "Glúteos", "Pantorrillas", "Full body", "Core"
];

const difficultyLevels = ["Principiante", "Intermedio", "Avanzado"];
const equipment = ["Sin equipo", "Mancuernas", "Barras", "Máquinas", "Bandas elásticas", "Otro"];

const Ajustes = () => {
  const { toast } = useToast();

  // Estado para equipos y ejercicios personalizados
  const [customEquipment, setCustomEquipment] = useState([...equipmentList]);
  const [customExercises, setCustomExercises] = useState([...exerciseData]);
  
  // Estado para los formularios
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    description: "",
    muscleGroups: [] as string[],
  });

  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    muscleGroups: [] as string[],
    equipment: "",
    difficulty: "Principiante",
    sets: 3,
    reps: "12-15",
    rest: "60 seg",
    calories: 5,
    emoji: "💪",
  });
  
  // Estado para la configuración de la base de datos
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "gymflow"
  });
  
  // Cargar configuración guardada de la base de datos al iniciar
  useEffect(() => {
    const savedConfig = mysqlConnection.getConfig();
    if (savedConfig) {
      setDbConfig(savedConfig);
    }
    
    // Cargar equipos y ejercicios guardados
    const loadSavedData = async () => {
      if (mysqlConnection.isConnected()) {
        const savedEquipment = await mysqlConnection.getEquipment();
        const savedExercises = await mysqlConnection.getExercises();
        
        if (savedEquipment && savedEquipment.length > 0) {
          setCustomEquipment(savedEquipment);
        }
        
        if (savedExercises && savedExercises.length > 0) {
          setCustomExercises(savedExercises);
        }
      }
    };
    
    loadSavedData();
  }, []);

  // Manejar cambios en el formulario de equipamiento
  const handleEquipmentChange = (field: string, value: any) => {
    setNewEquipment({ ...newEquipment, [field]: value });
  };

  // Manejar cambios en el formulario de ejercicios
  const handleExerciseChange = (field: string, value: any) => {
    setNewExercise({ ...newExercise, [field]: value });
  };

  // Manejar selección de grupos musculares para equipamiento
  const handleEquipmentMuscleGroupToggle = (group: string) => {
    const current = [...newEquipment.muscleGroups];
    if (current.includes(group)) {
      handleEquipmentChange('muscleGroups', current.filter(g => g !== group));
    } else {
      handleEquipmentChange('muscleGroups', [...current, group]);
    }
  };

  // Manejar selección de grupos musculares para ejercicios
  const handleExerciseMuscleGroupToggle = (group: string) => {
    const current = [...newExercise.muscleGroups];
    if (current.includes(group)) {
      handleExerciseChange('muscleGroups', current.filter(g => g !== group));
    } else {
      handleExerciseChange('muscleGroups', [...current, group]);
    }
  };

  // Añadir un nuevo equipamiento
  const handleAddEquipment = () => {
    if (!newEquipment.name || newEquipment.muscleGroups.length === 0) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor proporciona un nombre y al menos un grupo muscular.",
      });
      return;
    }

    const updatedList = [
      ...customEquipment,
      {
        ...newEquipment,
        id: Date.now(),
        imagePath: "/placeholder.svg"
      }
    ];
    
    setCustomEquipment(updatedList);
    
    // Guardar en "base de datos"
    if (mysqlConnection.isConnected()) {
      mysqlConnection.saveEquipment(updatedList);
    }
    
    toast({
      title: "Equipo añadido",
      description: `${newEquipment.name} ha sido añadido a tu lista de equipos.`,
    });

    // Limpiar formulario
    setNewEquipment({
      name: "",
      description: "",
      muscleGroups: []
    });
  };

  // Añadir un nuevo ejercicio
  const handleAddExercise = () => {
    if (!newExercise.name || newExercise.muscleGroups.length === 0) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor proporciona un nombre y al menos un grupo muscular.",
      });
      return;
    }

    const updatedList = [
      ...customExercises,
      {
        ...newExercise,
        id: Date.now(),
        imagePath: "/placeholder.svg"
      }
    ];
    
    setCustomExercises(updatedList);
    
    // Guardar en "base de datos"
    if (mysqlConnection.isConnected()) {
      mysqlConnection.saveExercises(updatedList);
    }
    
    toast({
      title: "Ejercicio añadido",
      description: `${newExercise.name} ha sido añadido a tu lista de ejercicios.`,
    });

    // Limpiar formulario
    setNewExercise({
      name: "",
      description: "",
      muscleGroups: [],
      equipment: "",
      difficulty: "Principiante",
      sets: 3,
      reps: "12-15",
      rest: "60 seg",
      calories: 5,
      emoji: "💪"
    });
  };
  
  // Guardar configuración de base de datos
  const saveDbConfig = () => {
    // Validar configuración
    if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
      toast({
        variant: "destructive",
        title: "Configuración incompleta",
        description: "Por favor completa todos los campos obligatorios.",
      });
      return;
    }
    
    // Guardar configuración
    mysqlConnection.setConfig(dbConfig);
    
    toast({
      title: "Configuración guardada",
      description: "Configuración de MySQL guardada correctamente.",
    });
  };
  
  // Guardar todos los datos en la base de datos
  const saveAllData = async () => {
    if (!mysqlConnection.isConnected()) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "Por favor configura la conexión MySQL primero.",
      });
      return;
    }
    
    try {
      // Guardar equipos
      await mysqlConnection.saveEquipment(customEquipment);
      
      // Guardar ejercicios
      await mysqlConnection.saveExercises(customExercises);
      
      // Recuperar y guardar rutinas existentes
      const existingRoutine = localStorage.getItem('weeklyRoutine');
      if (existingRoutine) {
        const routine = JSON.parse(existingRoutine);
        await mysqlConnection.saveRoutine({
          name: routine.name || "Mi Rutina",
          objetivo: "personalizada",
          nivel: "personalizada",
          equipamiento: "personalizada",
          dias: routine.days || 3,
          exercises: routine.exercises || {}
        });
      }
      
      toast({
        title: "Datos guardados",
        description: "Todos los datos han sido guardados en la base de datos.",
      });
    } catch (err) {
      console.error("Error al guardar datos:", err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "Ocurrió un error al guardar los datos. Inténtalo de nuevo.",
      });
    }
  };
  
  // Cargar datos desde la base de datos
  const loadAllData = async () => {
    if (!mysqlConnection.isConnected()) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "Por favor configura la conexión MySQL primero.",
      });
      return;
    }
    
    try {
      // Cargar equipos
      const equipment = await mysqlConnection.getEquipment();
      if (equipment.length > 0) {
        setCustomEquipment(equipment);
      }
      
      // Cargar ejercicios
      const exercises = await mysqlConnection.getExercises();
      if (exercises.length > 0) {
        setCustomExercises(exercises);
      }
      
      toast({
        title: "Datos cargados",
        description: "Todos los datos han sido cargados desde la base de datos.",
      });
    } catch (err) {
      console.error("Error al cargar datos:", err);
      toast({
        variant: "destructive",
        title: "Error al cargar",
        description: "Ocurrió un error al cargar los datos. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold gradient-text flex items-center">
          <BarChart className="mr-3 h-7 w-7" />
          Ajustes
        </h1>
        
        <Button
          onClick={saveAllData}
          className="gradient-btn px-4 py-2 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Guardar en MySQL
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuración MySQL
            </CardTitle>
            <CardDescription>
              Configura la conexión a la base de datos MySQL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="host">Servidor</Label>
              <Input 
                id="host" 
                value={dbConfig.host} 
                onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                placeholder="localhost" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Puerto</Label>
              <Input 
                id="port" 
                type="number" 
                value={dbConfig.port} 
                onChange={(e) => setDbConfig({...dbConfig, port: parseInt(e.target.value)})}
                placeholder="3306" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Input 
                id="user" 
                value={dbConfig.user} 
                onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                placeholder="root" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                value={dbConfig.password} 
                onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                placeholder="Contraseña" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database">Base de datos</Label>
              <Input 
                id="database" 
                value={dbConfig.database} 
                onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                placeholder="gymflow" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setDbConfig({
              host: "localhost",
              port: 3306,
              user: "root",
              password: "",
              database: "gymflow"
            })}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer
            </Button>
            <Button onClick={saveDbConfig}>
              <Shield className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="equipment" className="col-span-1 lg:col-span-3">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6 bg-secondary dark:bg-gray-800 dark:text-gray-200">
            <TabsTrigger value="equipment" className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-700">
              <Dumbbell className="h-4 w-4" />
              Añadir Máquinas
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-700">
              <Activity className="h-4 w-4" />
              Añadir Ejercicios
            </TabsTrigger>
          </TabsList>
          
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              onClick={saveAllData}
              variant="default"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar todo en MySQL
            </Button>
            
            <Button
              onClick={loadAllData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Cargar desde MySQL
            </Button>
          </div>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Añadir nueva máquina o equipo</CardTitle>
                <CardDescription>
                  Personaliza tu inventario de equipos de gimnasio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="equipment-name">Nombre del equipo</Label>
                  <Input
                    id="equipment-name"
                    value={newEquipment.name}
                    onChange={(e) => handleEquipmentChange('name', e.target.value)}
                    placeholder="Ej: Máquina Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment-description">Descripción</Label>
                  <Input
                    id="equipment-description"
                    value={newEquipment.description}
                    onChange={(e) => handleEquipmentChange('description', e.target.value)}
                    placeholder="Describe brevemente el equipo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grupos musculares principales</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {muscleGroups.map(group => (
                      <div
                        key={group}
                        className={`
                          px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors
                          ${newEquipment.muscleGroups.includes(group)
                            ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500 dark:text-purple-300'
                            : 'border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-600'
                          }
                        `}
                        onClick={() => handleEquipmentMuscleGroupToggle(group)}
                      >
                        {group}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddEquipment} className="w-full gradient-btn">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Añadir Equipo
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="exercises">
            <Card>
              <CardHeader>
                <CardTitle>Añadir nuevo ejercicio</CardTitle>
                <CardDescription>
                  Crea ejercicios personalizados para tus rutinas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-name">Nombre del ejercicio</Label>
                    <Input
                      id="exercise-name"
                      value={newExercise.name}
                      onChange={(e) => handleExerciseChange('name', e.target.value)}
                      placeholder="Ej: Press de banca inclinado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise-equipment">Equipo necesario</Label>
                    <Select
                      value={newExercise.equipment}
                      onValueChange={(value) => handleExerciseChange('equipment', value)}
                    >
                      <SelectTrigger id="exercise-equipment">
                        <SelectValue placeholder="Seleccionar equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map(item => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercise-description">Descripción</Label>
                  <Input
                    id="exercise-description"
                    value={newExercise.description}
                    onChange={(e) => handleExerciseChange('description', e.target.value)}
                    placeholder="Describe brevemente el ejercicio"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-difficulty">Dificultad</Label>
                    <Select
                      value={newExercise.difficulty}
                      onValueChange={(value) => handleExerciseChange('difficulty', value)}
                    >
                      <SelectTrigger id="exercise-difficulty">
                        <SelectValue placeholder="Seleccionar dificultad" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise-emoji">Emoji representativo</Label>
                    <Input
                      id="exercise-emoji"
                      value={newExercise.emoji}
                      onChange={(e) => handleExerciseChange('emoji', e.target.value)}
                      placeholder="💪"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-sets">Series</Label>
                    <Input
                      id="exercise-sets"
                      type="number"
                      min="1"
                      max="10"
                      value={newExercise.sets}
                      onChange={(e) => handleExerciseChange('sets', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise-reps">Repeticiones</Label>
                    <Input
                      id="exercise-reps"
                      value={newExercise.reps}
                      onChange={(e) => handleExerciseChange('reps', e.target.value)}
                      placeholder="Ej: 8-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise-rest">Descanso</Label>
                    <Input
                      id="exercise-rest"
                      value={newExercise.rest}
                      onChange={(e) => handleExerciseChange('rest', e.target.value)}
                      placeholder="Ej: 60 seg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercise-calories">Calorías por repetición</Label>
                  <Input
                    id="exercise-calories"
                    type="number"
                    min="1"
                    max="20"
                    value={newExercise.calories}
                    onChange={(e) => handleExerciseChange('calories', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grupos musculares principales</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {muscleGroups.map(group => (
                      <div
                        key={group}
                        className={`
                          px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors
                          ${newExercise.muscleGroups.includes(group)
                            ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500 dark:text-purple-300'
                            : 'border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-600'
                          }
                        `}
                        onClick={() => handleExerciseMuscleGroupToggle(group)}
                      >
                        {group}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddExercise} className="w-full gradient-btn">
                  <Activity className="mr-2 h-4 w-4" />
                  Añadir Ejercicio
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Ajustes;
