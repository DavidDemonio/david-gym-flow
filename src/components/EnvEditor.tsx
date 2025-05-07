
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Save } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { envManager } from "../utils/envManager";

export function EnvEditor() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [variables, setVariables] = useState("");
  
  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    setIsLoading(true);
    try {
      const loadedVars = await envManager.getAllVariables();
      
      if (loadedVars && typeof loadedVars === 'object') {
        // Convert the object to a string format for the textarea
        const varsString = Object.entries(loadedVars)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');
          
        setVariables(varsString);
      }
      
      toast({
        title: "Variables cargadas",
        description: "Variables de entorno cargadas correctamente"
      });
    } catch (error) {
      console.error("Error loading environment variables:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar variables de entorno"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveVariables = async () => {
    setIsLoading(true);
    try {
      // Parse the variables from the textarea into an object
      const varsObject: Record<string, string> = {};
      variables.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2];
          varsObject[key] = value;
        }
      });
      
      // Use the envManager to save variables
      const success = await envManager.updateVariables(varsObject);
      
      if (success) {
        toast({
          title: "Variables guardadas",
          description: "Variables de entorno guardadas correctamente"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al guardar variables de entorno"
        });
      }
    } catch (error) {
      console.error("Error saving environment variables:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al guardar variables de entorno"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Variables de Entorno
        </CardTitle>
        <CardDescription>
          Edita directamente las variables de entorno de la aplicación
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="env-variables">Variables de entorno</Label>
            <Textarea
              id="env-variables"
              placeholder="KEY=value"
              className="font-mono h-64"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
            />
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md border border-amber-200 dark:border-amber-900/50">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Advertencia:</strong> Editar incorrectamente estas variables puede hacer que la aplicación deje de funcionar. 
              Asegúrate de conocer lo que estás haciendo.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={loadVariables}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : "Recargar"}
        </Button>
        
        <Button 
          onClick={saveVariables}
          className="gradient-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
