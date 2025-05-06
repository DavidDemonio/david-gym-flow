
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Database, Check, AlertTriangle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import MysqlService from "../services/MysqlService";
import { mysqlConnection } from "../utils/mysqlConnection";
import { envManager } from "../utils/envManager";

interface RoutinesDbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export function RoutinesDatabaseSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [formData, setFormData] = useState<RoutinesDbConfig>({
    host: '',
    port: 3306,
    database: 'gymflow_routines',
    user: '',
    password: ''
  });

  // Load values from environment variables on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const env = await envManager.getAll();
        
        if (env.ROUTINES_MYSQL_HOST) {
          setFormData({
            host: env.ROUTINES_MYSQL_HOST || '',
            port: parseInt(env.ROUTINES_MYSQL_PORT || '3306'),
            database: env.ROUTINES_MYSQL_DATABASE || 'gymflow_routines',
            user: env.ROUTINES_MYSQL_USER || '',
            password: env.ROUTINES_MYSQL_PASSWORD || ''
          });
          
          // Check if we have connection info
          if (env.ROUTINES_MYSQL_HOST && env.ROUTINES_MYSQL_USER) {
            testConnection({
              host: env.ROUTINES_MYSQL_HOST,
              port: parseInt(env.ROUTINES_MYSQL_PORT || '3306'),
              database: env.ROUTINES_MYSQL_DATABASE || 'gymflow_routines',
              user: env.ROUTINES_MYSQL_USER,
              password: env.ROUTINES_MYSQL_PASSWORD || ''
            });
          }
        }
      } catch (err) {
        console.error('Error loading routines database settings:', err);
      }
    };
    
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'port' ? parseInt(value) : value
    });
  };

  const testConnection = async (config = formData) => {
    setIsTesting(true);
    try {
      const result = await MysqlService.testConnection(config);
      
      if (result.success) {
        setIsConnected(true);
        toast({
          title: "Conexión exitosa",
          description: "La conexión a la base de datos de rutinas se ha establecido correctamente."
        });
      } else {
        setIsConnected(false);
        toast({
          variant: "destructive",
          title: "Error de conexión",
          description: result.message || "No se pudo conectar a la base de datos de rutinas."
        });
      }
    } catch (err) {
      setIsConnected(false);
      console.error('Error testing routines database connection:', err);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "Ocurrió un error al probar la conexión a la base de datos de rutinas."
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const initializeDatabase = async () => {
    setIsInitializing(true);
    try {
      const result = await MysqlService.initializeRoutinesDb(formData);
      
      if (result.success) {
        toast({
          title: "Base de datos inicializada",
          description: "La base de datos de rutinas ha sido inicializada correctamente."
        });
        
        // Also update the connection status
        setIsConnected(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error de inicialización",
          description: result.message || "No se pudo inicializar la base de datos de rutinas."
        });
      }
    } catch (err) {
      console.error('Error initializing routines database:', err);
      toast({
        variant: "destructive",
        title: "Error de inicialización",
        description: "Ocurrió un error al inicializar la base de datos de rutinas."
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save to environment variables
      await envManager.setAll({
        ROUTINES_MYSQL_HOST: formData.host,
        ROUTINES_MYSQL_PORT: formData.port.toString(),
        ROUTINES_MYSQL_DATABASE: formData.database,
        ROUTINES_MYSQL_USER: formData.user,
        ROUTINES_MYSQL_PASSWORD: formData.password
      });
      
      // Update connection in mysqlConnection utility
      await mysqlConnection.setRoutinesDbConfig(formData);
      
      // Test connection
      await testConnection();
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de la base de datos de rutinas ha sido guardada."
      });
    } catch (err) {
      console.error('Error saving routines database configuration:', err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar la configuración de la base de datos de rutinas."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" /> 
          Base de Datos para Rutinas
        </CardTitle>
        <CardDescription>
          Configura una base de datos MySQL separada para almacenar las rutinas de entrenamiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="host">Servidor MySQL</Label>
              <Input
                id="host"
                name="host"
                placeholder="localhost o dirección IP"
                value={formData.host}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="port">Puerto</Label>
              <Input
                id="port"
                name="port"
                type="number"
                placeholder="3306"
                value={formData.port}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="database">Nombre de la Base de Datos</Label>
            <Input
              id="database"
              name="database"
              placeholder="gymflow_routines"
              value={formData.database}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="user">Usuario</Label>
              <Input
                id="user"
                name="user"
                placeholder="usuario"
                value={formData.user}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center">
              {isConnected ? (
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <Check className="h-4 w-4 mr-1" /> Conectado a la base de datos de rutinas
                </div>
              ) : (
                <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" /> No conectado
                </div>
              )}
            </div>
          </div>
          
          <CardFooter className="px-0 flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => testConnection()}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Probando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" /> Probar Conexión
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="secondary" 
              className="w-full sm:w-auto"
              onClick={initializeDatabase}
              disabled={isInitializing || !isConnected}
            >
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inicializando...
                </>
              ) : (
                'Inicializar Base de Datos'
              )}
            </Button>
            
            <Button 
              type="submit" 
              className="w-full sm:w-auto gradient-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                'Guardar Configuración'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

export default RoutinesDatabaseSettings;
