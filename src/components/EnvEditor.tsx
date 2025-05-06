
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileDown, FileUp, Loader2, RefreshCw, Save } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { envManager } from "../utils/envManager";
import { mysqlConnection } from "../utils/mysqlConnection";

function EnvEditor() {
  const { toast } = useToast();
  const [envContent, setEnvContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Load current env variables on mount
  useEffect(() => {
    loadEnvVariables();
  }, []);
  
  const loadEnvVariables = async () => {
    try {
      // Get all environment variables and convert to .env format
      const envText = envManager.exportToEnvFormat();
      setEnvContent(envText);
    } catch (err) {
      console.error('Error loading environment variables:', err);
      toast({
        variant: "destructive",
        title: "Error al cargar variables",
        description: "No se pudieron cargar las variables de entorno."
      });
    }
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = envManager.importFromEnvFormat(envContent);
      
      if (success) {
        toast({
          title: "Variables guardadas",
          description: "Las variables de entorno han sido actualizadas."
        });
        
        // Reload services with new environment variables
        await mysqlConnection.loadEnvironmentVariables();
        
      } else {
        throw new Error('Failed to import environment variables');
      }
    } catch (err) {
      console.error('Error saving environment variables:', err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron guardar las variables de entorno."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await envManager.refresh();
      loadEnvVariables();
      
      toast({
        title: "Variables actualizadas",
        description: "Las variables de entorno han sido actualizadas desde el servidor."
      });
    } catch (err) {
      console.error('Error refreshing environment variables:', err);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: "No se pudieron actualizar las variables de entorno."
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const downloadEnvFile = () => {
    const element = document.createElement("a");
    const file = new Blob([envContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = ".env";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Archivo descargado",
      description: "El archivo .env ha sido descargado."
    });
  };
  
  const uploadEnvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setEnvContent(content);
        
        toast({
          title: "Archivo cargado",
          description: "El archivo .env ha sido cargado. Haga clic en Guardar para aplicar los cambios."
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5" /> 
          Editor de Variables de Entorno
        </CardTitle>
        <CardDescription>
          Edite directamente las variables de entorno en formato .env. Solo para usuarios avanzados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
            <p className="text-amber-800 dark:text-amber-300 text-sm">
              <strong>Advertencia:</strong> La edición manual de las variables de entorno puede causar problemas en la aplicación. 
              Solo realice cambios si sabe lo que está haciendo.
            </p>
          </div>
          
          <Textarea 
            value={envContent}
            onChange={(e) => setEnvContent(e.target.value)}
            className="font-mono h-80"
            placeholder="# Variables de entorno en formato KEY=VALUE"
          />
          
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={downloadEnvFile}
              size="sm"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Descargar .env
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              size="sm"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Cargar .env
            </Button>
            <input 
              id="file-upload" 
              type="file" 
              accept=".env,text/plain" 
              onChange={uploadEnvFile} 
              style={{display: 'none'}} 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> Actualizar desde Servidor
            </>
          )}
        </Button>
        
        <Button
          type="button"
          onClick={handleSave}
          className="gradient-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Guardar Cambios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default EnvEditor;
