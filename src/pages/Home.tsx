
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, BarChart3, Calendar, ChevronRight, Users, Settings, Clock, Play, Mail, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '../hooks/use-toast';
import { mysqlConnection } from "../utils/mysqlConnection";
import MysqlService from "../services/MysqlService";
import ExerciseEquipmentManager from '../components/ExerciseEquipmentManager';
import RoutineManager from '../components/RoutineManager';

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("routines");
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState<string>("");
  const [routinesCount, setRoutinesCount] = useState<number>(0);
  const [exercisesCount, setExercisesCount] = useState<number>(0);
  
  // Check database connection, user profile and stats on mount
  useEffect(() => {
    checkConnection();
    loadUserProfile();
    loadStats();
    setGreeting(getGreeting());
  }, []);
  
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "¡Buenos días";
    } else if (hour >= 12 && hour < 18) {
      return "¡Buenas tardes";
    } else {
      return "¡Buenas noches";
    }
  };
  
  const checkConnection = () => {
    const connected = mysqlConnection.isConnected();
    setIsConnected(connected);
    
    if (!connected) {
      // Show toast only if not connected, to avoid too many notifications
      toast({
        variant: "default",
        title: "Base de datos no conectada",
        description: "Configura la conexión a MySQL en Ajustes para acceder a todas las funciones",
      });
    }
  };
  
  const loadUserProfile = async () => {
    const user = MysqlService.getCurrentUser();
    if (user) {
      setUserProfile(user);
    } else {
      const profile = await mysqlConnection.getUserProfile();
      setUserProfile(profile);
    }
  };
  
  const loadStats = async () => {
    try {
      // Get routines stats
      const routines = await mysqlConnection.getRoutines();
      setRoutinesCount(routines?.length || 0);
      
      // Get exercise stats
      const exercises = await mysqlConnection.getExercises();
      setExercisesCount(exercises?.length || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Message with old-style look */}
        <div className="mb-10 glassmorphic-hero-card rounded-xl p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 border border-purple-200 dark:border-purple-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left animate-fadeInUp">
              <h1 className="text-4xl font-bold mb-2">
                {greeting}{userProfile?.name ? `, ${userProfile.name}!` : '!'}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 animate-fadeInUp animate-delay-100">
                Tu asistente personal para entrenamientos y rutinas
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/crear-rutina')}
                  className="gradient-btn gap-2"
                  size="lg"
                >
                  <Play className="h-4 w-4" />
                  Comenzar Entrenamiento
                </Button>
                <Button 
                  onClick={() => navigate('/ajustes')}
                  variant="outline"
                  className="gap-2"
                  size="lg"
                >
                  <Settings className="h-4 w-4" />
                  Ajustes
                </Button>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center animate-fadeInLeft">
              <div className="text-7xl mb-3">💪</div>
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">{routinesCount}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Rutinas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">{exercisesCount}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ejercicios</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {!isConnected && (
          <Card className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 animate-fadeInUp animate-delay-200">
            <CardContent className="p-4">
              <div className="flex gap-2 items-center">
                <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <p className="text-amber-800 dark:text-amber-200">
                  Configura la conexión a la base de datos en 
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/ajustes')}
                    className="px-1 text-amber-600 dark:text-amber-400"
                  >
                    Ajustes
                  </Button> 
                  para acceder a todas las funcionalidades
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="animate-fadeInUp animate-delay-300">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="routines" className="text-base py-3">Mis Rutinas</TabsTrigger>
            <TabsTrigger value="exercises" className="text-base py-3">Ejercicios y Equipamiento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routines" className="space-y-8">
            <RoutineManager />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dumbbell className="mr-3 h-5 w-5" />
                    Crear Rutina
                  </CardTitle>
                  <CardDescription>
                    Crea una rutina personalizada según tus objetivos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Define tus objetivos, nivel y equipamiento disponible para generar una rutina adaptada a ti.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate('/crear-rutina')}
                    className="gradient-btn w-full"
                  >
                    Crear Nueva Rutina
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Calculadora IMC
                  </CardTitle>
                  <CardDescription>
                    Calcula tu Índice de Masa Corporal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Conoce tu IMC y obtén recomendaciones basadas en tu composición corporal.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate('/calculadora-imc')}
                    className="w-full"
                    variant="outline"
                  >
                    Calcular mi IMC
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-3 h-5 w-5" />
                    Mi Perfil
                  </CardTitle>
                  <CardDescription>
                    Personaliza tu experiencia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Actualiza tu información personal, preferencias y configura notificaciones.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate('/ajustes')}
                    className="w-full"
                    variant="secondary"
                  >
                    Ver Perfil
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Quick Actions Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Acciones rápidas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-secondary/20"
                  onClick={() => navigate('/mi-rutina')}
                >
                  <Play className="h-5 w-5" />
                  <span>Iniciar rutina</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-secondary/20"
                  onClick={() => navigate('/maquinas-ejercicios')}
                >
                  <Dumbbell className="h-5 w-5" />
                  <span>Ver ejercicios</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-secondary/20"
                  onClick={() => setActiveTab('exercises')}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Planificar semana</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-secondary/20"
                  onClick={() => navigate('/ajustes')}
                >
                  <Mail className="h-5 w-5" />
                  <span>Enviar rutina</span>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exercises">
            <ExerciseEquipmentManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
