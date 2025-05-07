
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loader2, Settings, Save, Plus, Trash } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { mysqlConnection } from "../utils/mysqlConnection";
import { envManager } from "../utils/envManager";

export function EnvEditor() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  
  // Load environment variables on mount
  useEffect(() => {
    loadEnvVariables();
  }, []);
  
  const loadEnvVariables = async () => {
    setIsLoading(true);
    try {
      const env = await envManager.getAll();
      if (env) { // Check if env is not null/undefined before setting state
        setEnvVariables(env);
      }
    } catch (error) {
      console.error("Error loading environment variables:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar",
        description: "No se pudieron cargar las variables de entorno",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddVariable = () => {
    if (!newVarKey.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La clave no puede estar vacía",
      });
      return;
    }
    
    setEnvVariables({
      ...envVariables,
      [newVarKey]: newVarValue
    });
    
    setNewVarKey("");
    setNewVarValue("");
    
    toast({
      title: "Variable añadida",
      description: `Variable ${newVarKey} añadida`,
    });
  };
  
  const handleDeleteVariable = (key: string) => {
    const newVars = { ...envVariables };
    delete newVars[key];
    setEnvVariables(newVars);
    
    toast({
      title: "Variable eliminada",
      description: `Variable ${key} eliminada`,
    });
  };
  
  const handleUpdateValue = (key: string, value: string) => {
    setEnvVariables({
      ...envVariables,
      [key]: value
    });
  };
  
  const handleToggleValue = (key: string) => {
    const currentValue = envVariables[key];
    const newValue = currentValue === 'true' ? 'false' : 'true';
    
    setEnvVariables({
      ...envVariables,
      [key]: newValue
    });
  };
  
  const saveChanges = async () => {
    setIsLoading(true);
    try {
      await envManager.setVariables(envVariables);
      
      toast({
        title: "Cambios guardados",
        description: "Variables de entorno actualizadas correctamente",
      });
    } catch (error) {
      console.error("Error saving environment variables:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron guardar las variables de entorno",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isSensitiveKey = (key: string) => {
    const sensitiveKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'];
    return sensitiveKeys.some(sensitive => key.toUpperCase().includes(sensitive));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Variables de Entorno
        </CardTitle>
        <CardDescription>
          Gestiona las variables de entorno de la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-1/3">
            <Label htmlFor="newVarKey">Nombre de Variable</Label>
            <Input 
              id="newVarKey" 
              placeholder="NUEVA_VARIABLE"
              value={newVarKey}
              onChange={e => setNewVarKey(e.target.value.toUpperCase())}
            />
          </div>
          <div className="w-full sm:w-1/3">
            <Label htmlFor="newVarValue">Valor</Label>
            <Input 
              id="newVarValue" 
              placeholder="valor"
              value={newVarValue}
              onChange={e => setNewVarValue(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <Button 
              type="button" 
              className="w-full sm:w-auto"
              onClick={handleAddVariable}
              disabled={!newVarKey.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir Variable
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : Object.keys(envVariables).length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Variable</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-[60px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(envVariables).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>
                      {value === 'true' || value === 'false' ? (
                        <Switch 
                          checked={value === 'true'} 
                          onCheckedChange={() => handleToggleValue(key)}
                        />
                      ) : isSensitiveKey(key) ? (
                        <Input 
                          type="password"
                          value={value}
                          onChange={(e) => handleUpdateValue(key, e.target.value)}
                        />
                      ) : (
                        <Input 
                          value={value}
                          onChange={(e) => handleUpdateValue(key, e.target.value)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteVariable(key)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            No hay variables de entorno configuradas
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full gradient-btn"
          onClick={saveChanges}
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
              Guardar Cambios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default EnvEditor;
