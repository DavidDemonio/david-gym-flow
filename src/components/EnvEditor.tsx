
import React, { useState, useEffect } from 'react';
import { envManager, EnvVariables } from '../utils/envManager';
import { mysqlConnection } from '../utils/mysqlConnection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Save, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EnvEditor: React.FC = () => {
  const { toast } = useToast();
  const [variables, setVariables] = useState<EnvVariables>({});
  const [envContent, setEnvContent] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Load variables on component mount
    loadVariables();
  }, []);
  
  const loadVariables = async () => {
    setIsLoading(true);
    try {
      // Try to refresh environment variables from server first
      await envManager.refresh();
      
      // Then get the latest variables
      const vars = envManager.getAll();
      setVariables(vars);
      setEnvContent(envManager.exportToEnvFormat());
    } catch (err) {
      console.error('Error loading environment variables:', err);
      toast({
        variant: "destructive",
        title: "Error al cargar variables",
        description: "No se pudieron cargar las variables de entorno",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle variable changes
  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };
  
  // Save all variables
  const handleSaveVariables = async () => {
    setSaveStatus('saving');
    try {
      envManager.setAll(variables);
      
      // Wait a moment for the variables to apply
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh the env content display
      setEnvContent(envManager.exportToEnvFormat());
      
      // Try to reconnect to database with new settings
      if (mysqlConnection.isConnected()) {
        await mysqlConnection.reconnect();
      } else {
        await mysqlConnection.loadEnvVariables();
      }
      
      setSaveStatus('saved');
      toast({
        title: "Variables guardadas",
        description: "Las variables de entorno han sido actualizadas y aplicadas.",
      });
      
      // Reset status after a delay
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "Hubo un problema al guardar las variables.",
      });
      
      // Reset status after a delay
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };
  
  // Import variables from .env format
  const handleImportEnv = () => {
    if (envManager.importFromEnvFormat(envContent)) {
      setVariables(envManager.getAll());
      toast({
        title: "Variables importadas",
        description: "Las variables de entorno han sido importadas y aplicadas correctamente.",
      });
      
      // Wait for MySQL to reconnect if needed
      setTimeout(async () => {
        if (mysqlConnection.isConnected()) {
          const result = await mysqlConnection.testConnection();
          if (result.success) {
            toast({
              title: "Conexión a MySQL restaurada",
              description: "Se ha restablecido la conexión a la base de datos.",
            });
          }
        }
      }, 1000);
    } else {
      toast({
        variant: "destructive",
        title: "Error de importación",
        description: "Hubo un problema al importar las variables. Verifique el formato.",
      });
    }
  };
  
  // Generate a .env file for download
  const handleDownloadEnv = () => {
    const content = envManager.exportToEnvFormat();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Archivo .env descargado",
      description: "Se ha descargado el archivo .env con las variables configuradas.",
    });
  };
  
  // Refresh variables from server
  const handleRefreshVariables = async () => {
    setIsLoading(true);
    try {
      await envManager.refresh();
      setVariables(envManager.getAll());
      setEnvContent(envManager.exportToEnvFormat());
      toast({
        title: "Variables actualizadas",
        description: "Se han cargado las variables de entorno desde el servidor.",
      });
    } catch (err) {
      console.error('Error refreshing variables:', err);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: "No se pudieron actualizar las variables desde el servidor.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render save button with appropriate status
  const renderSaveButton = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <Button disabled className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Guardando...
          </Button>
        );
      case 'saved':
        return (
          <Button variant="outline" className="flex items-center gap-1 bg-green-50 border-green-200 text-green-600">
            <Check className="h-4 w-4" />
            ¡Guardado!
          </Button>
        );
      case 'error':
        return (
          <Button variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Error
          </Button>
        );
      default:
        return (
          <Button onClick={handleSaveVariables} className="flex items-center gap-1" disabled={isLoading}>
            <Save className="h-4 w-4" />
            Guardar Variables
          </Button>
        );
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Variables de Entorno (.env)
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CardDescription>
              Configure las variables de entorno para su aplicación
            </CardDescription>
          </div>
          <Badge variant={mysqlConnection.isConnected() ? "success" : "warning"}>
            {mysqlConnection.isConnected() ? "MySQL Conectado" : "MySQL Desconectado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="form">
          <TabsList className="mb-4">
            <TabsTrigger value="form">Formulario</TabsTrigger>
            <TabsTrigger value="raw">.env Texto</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-md font-semibold">MySQL</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="mysql_host">Host</Label>
                      <Input 
                        id="mysql_host" 
                        value={variables.MYSQL_HOST || ''} 
                        onChange={(e) => handleVariableChange('MYSQL_HOST', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="mysql_port">Puerto</Label>
                      <Input 
                        id="mysql_port" 
                        value={variables.MYSQL_PORT || '3306'} 
                        onChange={(e) => handleVariableChange('MYSQL_PORT', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="mysql_user">Usuario</Label>
                      <Input 
                        id="mysql_user" 
                        value={variables.MYSQL_USER || ''} 
                        onChange={(e) => handleVariableChange('MYSQL_USER', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="mysql_password">Contraseña</Label>
                      <Input 
                        id="mysql_password" 
                        type="password"
                        value={variables.MYSQL_PASSWORD || ''} 
                        onChange={(e) => handleVariableChange('MYSQL_PASSWORD', e.target.value)} 
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="mysql_database">Base de datos</Label>
                      <Input 
                        id="mysql_database" 
                        value={variables.MYSQL_DATABASE || 'gymflow'} 
                        onChange={(e) => handleVariableChange('MYSQL_DATABASE', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-md font-semibold">SMTP</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="smtp_host">Host</Label>
                      <Input 
                        id="smtp_host" 
                        value={variables.SMTP_HOST || ''} 
                        onChange={(e) => handleVariableChange('SMTP_HOST', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_port">Puerto</Label>
                      <Input 
                        id="smtp_port" 
                        value={variables.SMTP_PORT || '587'} 
                        onChange={(e) => handleVariableChange('SMTP_PORT', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_user">Usuario</Label>
                      <Input 
                        id="smtp_user" 
                        value={variables.SMTP_USER || ''} 
                        onChange={(e) => handleVariableChange('SMTP_USER', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_password">Contraseña</Label>
                      <Input 
                        id="smtp_password" 
                        type="password"
                        value={variables.SMTP_PASSWORD || ''} 
                        onChange={(e) => handleVariableChange('SMTP_PASSWORD', e.target.value)} 
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="from_email">Email Remitente</Label>
                      <Input 
                        id="from_email" 
                        value={variables.FROM_EMAIL || ''} 
                        onChange={(e) => handleVariableChange('FROM_EMAIL', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_secure">Conexión Segura</Label>
                      <select
                        id="smtp_secure"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={variables.SMTP_SECURE || 'false'}
                        onChange={(e) => handleVariableChange('SMTP_SECURE', e.target.value)}
                      >
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="smtp_secure_type">Tipo Seguridad</Label>
                      <select
                        id="smtp_secure_type"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={variables.SMTP_SECURE_TYPE || 'TLS'}
                        onChange={(e) => handleVariableChange('SMTP_SECURE_TYPE', e.target.value)}
                        disabled={variables.SMTP_SECURE !== 'true'}
                      >
                        <option value="TLS">TLS</option>
                        <option value="SSL">SSL</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-md font-semibold">Aplicación</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="app_name">Nombre</Label>
                      <Input 
                        id="app_name" 
                        value={variables.APP_NAME || 'GymFlow'} 
                        onChange={(e) => handleVariableChange('APP_NAME', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="debug_mode">Modo Debug</Label>
                      <select
                        id="debug_mode"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={variables.DEBUG_MODE || 'false'}
                        onChange={(e) => handleVariableChange('DEBUG_MODE', e.target.value)}
                      >
                        <option value="true">Activado</option>
                        <option value="false">Desactivado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="raw">
            <div className="space-y-4">
              <Textarea 
                value={envContent} 
                onChange={(e) => setEnvContent(e.target.value)} 
                className="font-mono text-xs min-h-[300px]" 
              />
              <div className="flex justify-end space-x-2">
                <Button onClick={handleImportEnv} className="flex items-center gap-1" disabled={isLoading}>
                  <Upload className="h-4 w-4" />
                  Importar y Aplicar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex gap-2">
          <Button onClick={handleDownloadEnv} variant="outline" className="flex items-center gap-1" disabled={isLoading}>
            <Download className="h-4 w-4" />
            Descargar .env
          </Button>
          
          <Button onClick={handleRefreshVariables} variant="outline" className="flex items-center gap-1" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar desde servidor
          </Button>
        </div>
        
        {renderSaveButton()}
      </CardFooter>
    </Card>
  );
};

export default EnvEditor;
