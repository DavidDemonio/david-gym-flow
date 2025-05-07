
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Database, Check, AlertTriangle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { mysqlConnection } from "../utils/mysqlConnection";

export function DatabaseSettingsForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const [formData, setFormData] = useState({
    host: '',
    port: 3306,
    database: '',
    user: '',
    password: ''
  });

  // Load values from MySQL connection on mount
  useEffect(() => {
    const config = mysqlConnection.getConfig();
    if (config) {
      setFormData({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password
      });
      setIsConnected(mysqlConnection.isConnected());
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'port' ? parseInt(value) : value
    });
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const result = await mysqlConnection.testConnection(formData);
      
      // Safely check result properties with null/undefined checks
      if (result) {
        // Handle possible result type variants
        if (typeof result === 'object' && 'success' in result) {
          // For object with success property
          const success = result?.success === true;
          setIsConnected(success);
          
          const successMessage = success ? 
            "La conexión a la base de datos se ha establecido correctamente." : 
            "No se pudo conectar a la base de datos.";
          
          toast({
            title: success ? "Conexión exitosa" : "Error de conexión",
            description: result?.message ?? successMessage,
          });
        } else if (typeof result === 'boolean') {
          // For boolean result
          setIsConnected(result);
          toast({
            title: result ? "Conexión exitosa" : "Error de conexión",
            description: result ? 
              "La conexión a la base de datos se ha establecido correctamente." : 
              "No se pudo conectar a la base de datos."
          });
        } else {
          // Unexpected result type
          setIsConnected(false);
          toast({
            variant: "destructive",
            title: "Error de conexión",
            description: "Respuesta inesperada al probar la conexión."
          });
        }
      } else {
        // No result returned
        setIsConnected(false);
        toast({
          variant: "destructive",
          title: "Error de conexión",
          description: "No se recibió respuesta al probar la conexión."
        });
      }
    } catch (err) {
      console.error('Error testing connection:', err);
      setIsConnected(false);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "Ocurrió un error al probar la conexión a la base de datos."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await mysqlConnection.setConfig(formData);
      await testConnection();
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de la base de datos ha sido guardada.",
      });
    } catch (err) {
      console.error('Error saving database configuration:', err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar la configuración de la base de datos."
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
          Base de Datos Principal
        </CardTitle>
        <CardDescription>
          Configura la conexión a la base de datos MySQL para almacenar ejercicios, equipos y datos del usuario.
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
              placeholder="gymflow"
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
                  <Check className="h-4 w-4 mr-1" /> Conectado a la base de datos
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
              onClick={testConnection}
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

export default DatabaseSettingsForm;
