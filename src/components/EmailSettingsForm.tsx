
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Send, Check, AlertTriangle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { mysqlConnection } from "../utils/mysqlConnection";
import { EmailConfig } from "../services/MysqlService";

export function EmailSettingsForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const [formData, setFormData] = useState<EmailConfig>({
    host: '',
    port: 587,
    user: '',
    password: '',
    from: '',
    secure: false,
    secureType: 'TLS'
  });

  // Load values from MySQL connection on mount
  useEffect(() => {
    const loadEmailConfig = async () => {
      const config = mysqlConnection.getEmailConfig();
      if (config) {
        setFormData({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          from: config.from,
          secure: config.secure,
          secureType: config.secureType
        });
        
        // If there's a user profile, use its email as test email
        const userProfile = await mysqlConnection.getUserProfile();
        if (userProfile?.data?.email) {
          setTestEmail(userProfile.data.email);
        }
      }
    };
    
    loadEmailConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) : value
    }));
  };

  const handleSecureChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, secure: checked }));
  };

  const handleSecureTypeChange = (value: "TLS" | "SSL") => {
    setFormData(prev => ({ ...prev, secureType: value }));
  };

  const testEmailConnection = async () => {
    setIsTesting(true);
    try {
      const result = await mysqlConnection.testEmailConfig(formData);
      
      if (result.success) {
        toast({
          title: "Conexión SMTP exitosa",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error de conexión SMTP",
          description: result.message,
        });
      }
    } catch (err) {
      console.error('Error testing email connection:', err);
      toast({
        variant: "destructive",
        title: "Error de conexión SMTP",
        description: "Ocurrió un error al probar la conexión SMTP."
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, ingresa un correo electrónico de prueba."
      });
      return;
    }
    
    setIsSending(true);
    try {
      const result = await mysqlConnection.sendEmail(
        testEmail,
        "Prueba de correo desde GymFlow",
        `Este es un correo de prueba enviado desde GymFlow.
        
        Este correo confirma que tu configuración SMTP está funcionando correctamente.
        
        Saludos,
        El equipo de GymFlow`
      );
      
      if (result.success) {
        toast({
          title: "Correo enviado",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error al enviar correo",
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        variant: "destructive",
        title: "Error al enviar correo",
        description: "Ocurrió un error al enviar el correo de prueba."
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await mysqlConnection.setEmailConfig(formData);
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de correo electrónico ha sido guardada.",
      });
    } catch (err) {
      console.error('Error saving email configuration:', err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar la configuración de correo electrónico."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" /> 
          Configuración de Correo Electrónico
        </CardTitle>
        <CardDescription>
          Configura el servidor SMTP para el envío de correos electrónicos desde la aplicación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="host">Servidor SMTP</Label>
              <Input
                id="host"
                name="host"
                placeholder="smtp.gmail.com"
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
                placeholder="587"
                value={formData.port}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="user">Usuario SMTP</Label>
              <Input
                id="user"
                name="user"
                placeholder="usuario@gmail.com"
                value={formData.user}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="password">Contraseña SMTP</Label>
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
          
          <div>
            <Label htmlFor="from">Correo Electrónico de Origen</Label>
            <Input
              id="from"
              name="from"
              placeholder="nombre@ejemplo.com"
              value={formData.from}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Este es el correo que aparecerá como remitente de los mensajes enviados.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-1 items-center space-x-2">
              <Switch 
                id="secure" 
                checked={formData.secure} 
                onCheckedChange={handleSecureChange} 
              />
              <Label htmlFor="secure" className="cursor-pointer">Conexión Segura</Label>
            </div>
            
            <div className="flex flex-1 items-center space-x-2">
              <Select 
                value={formData.secureType} 
                onValueChange={(value) => handleSecureTypeChange(value as "TLS" | "SSL")}
                disabled={!formData.secure}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TLS">TLS</SelectItem>
                  <SelectItem value="SSL">SSL</SelectItem>
                </SelectContent>
              </Select>
              <Label>Tipo de Seguridad</Label>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Correo electrónico de prueba"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={sendTestEmail}
                disabled={isSending || !testEmail}
                className="w-full sm:w-auto"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Enviar Correo de Prueba
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <CardFooter className="px-0 flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={testEmailConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Probando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" /> Probar Conexión SMTP
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

export default EmailSettingsForm;
