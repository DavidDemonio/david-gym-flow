
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, BarChart3, Calendar, ChevronRight, Users, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '../hooks/use-toast';
import { mysqlConnection } from "../utils/mysqlConnection";
import ExerciseEquipmentManager from '../components/ExerciseEquipmentManager';
import RoutineManager from '../components/RoutineManager';

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("routines");
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Check database connection and user profile on mount
  useEffect(() => {
    checkConnection();
    loadUserProfile();
  }, []);
  
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
  
  const loadUserProfile = () => {
    const profile = mysqlConnection.getUserProfile();
    setUserProfile(profile);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold gradient-text mb-4 animate-fadeInUp">David GymFlow</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 animate-fadeInUp animate-delay-100">
            Tu asistente personal para entrenamientos y rutinas
          </p>
          
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
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="animate-fadeInUp animate-delay-300">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="routines" className="text-base py-3">Mis Rutinas</TabsTrigger>
            <TabsTrigger value="exercises" className="text-base py-3">Ejercicios y Equipamiento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routines" className="space-y-8">
            <RoutineManager />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="transition-all hover:shadow-md">
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
              
              <Card className="transition-all hover:shadow-md">
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
