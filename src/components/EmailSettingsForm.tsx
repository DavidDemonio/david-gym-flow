
import React, { useState, useEffect } from 'react';
import { mysqlConnection, EmailConfig, UserProfile } from '../utils/mysqlConnection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Send, TestTube, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailSettingsForm: React.FC = () => {
  const { toast } = useToast();
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: ''
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    name: '',
    notificationsEnabled: false
  });
  
  // Load saved configurations
  useEffect(() => {
    const savedEmailConfig = mysqlConnection.getEmailConfig();
    if (savedEmailConfig) {
      setEmailConfig(savedEmailConfig);
    }
    
    const savedUserProfile = mysqlConnection.getUserProfile();
    if (savedUserProfile) {
      setUserProfile(savedUserProfile);
    }
  }, []);
  
  // Handle email config changes
  const handleEmailConfigChange = (field: keyof EmailConfig, value: string | number) => {
    setEmailConfig(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle user profile changes
  const handleUserProfileChange = (field: keyof UserProfile, value: string | boolean) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };
  
  // Save email configuration
  const handleSaveEmailConfig = () => {
    // Basic validation
    if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.fromEmail) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor complete los campos requeridos de configuración SMTP.",
      });
      return;
    }
    
    mysqlConnection.setEmailConfig(emailConfig);
    toast({
      title: "Configuración guardada",
      description: "La configuración de correo ha sido guardada correctamente.",
    });
  };
  
  // Save user profile
  const handleSaveUserProfile = () => {
    // Basic validation
    if (!userProfile.email) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Por favor ingrese su dirección de correo electrónico.",
      });
      return;
    }
    
    mysqlConnection.setUserProfile(userProfile);
    toast({
      title: "Perfil guardado",
      description: "La información de usuario ha sido guardada correctamente.",
    });
  };
  
  // Test SMTP connection
  const handleTestEmailConfig = () => {
    const result = mysqlConnection.testEmailConfig();
    
    if (result.success) {
      toast({
        title: "Conexión exitosa",
        description: result.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: result.message,
      });
    }
  };
  
  // Send test email
  const handleSendTestEmail = () => {
    if (!userProfile.email) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Por favor ingrese su dirección de correo electrónico primero.",
      });
      return;
    }
    
    const result = mysqlConnection.sendEmail(
      userProfile.email,
      "Prueba de correo GymFlow",
      `Hola ${userProfile.name || 'usuario'},\n\nEste es un correo de prueba desde la aplicación GymFlow.\n\nSaludos!`
    );
    
    if (result.success) {
      toast({
        title: "Correo enviado",
        description: result.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: result.message,
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil de Usuario
          </CardTitle>
          <CardDescription>
            Configure su perfil para recibir notificaciones y rutinas por correo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_email">Correo Electrónico</Label>
              <Input
                id="user_email"
                type="email"
                value={userProfile.email}
                onChange={(e) => handleUserProfileChange('email', e.target.value)}
                placeholder="tu@correo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_name">Nombre</Label>
              <Input
                id="user_name"
                value={userProfile.name || ''}
                onChange={(e) => handleUserProfileChange('name', e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={userProfile.notificationsEnabled}
              onCheckedChange={(checked) => handleUserProfileChange('notificationsEnabled', checked)}
            />
            <Label htmlFor="notifications">Recibir notificaciones por correo</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveUserProfile} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Guardar Perfil
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Configuración SMTP</CardTitle>
          <CardDescription>
            Configure el servidor de correo electrónico para enviar notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">Host SMTP</Label>
              <Input
                id="smtp_host"
                value={emailConfig.smtpHost}
                onChange={(e) => handleEmailConfigChange('smtpHost', e.target.value)}
                placeholder="smtp.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_port">Puerto SMTP</Label>
              <Input
                id="smtp_port"
                type="number"
                value={emailConfig.smtpPort}
                onChange={(e) => handleEmailConfigChange('smtpPort', parseInt(e.target.value))}
                placeholder="587"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_user">Usuario SMTP</Label>
              <Input
                id="smtp_user"
                value={emailConfig.smtpUser}
                onChange={(e) => handleEmailConfigChange('smtpUser', e.target.value)}
                placeholder="usuario@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_password">Contraseña SMTP</Label>
              <Input
                id="smtp_password"
                type="password"
                value={emailConfig.smtpPassword}
                onChange={(e) => handleEmailConfigChange('smtpPassword', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="from_email">Email Remitente</Label>
            <Input
              id="from_email"
              value={emailConfig.fromEmail}
              onChange={(e) => handleEmailConfigChange('fromEmail', e.target.value)}
              placeholder="noreply@tuapp.com"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button onClick={handleSaveEmailConfig} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Guardar Configuración SMTP
          </Button>
          
          <div className="flex gap-2 w-full">
            <Button onClick={handleTestEmailConfig} variant="outline" className="flex-1">
              <TestTube className="mr-2 h-4 w-4" />
              Probar Conexión
            </Button>
            <Button onClick={handleSendTestEmail} variant="outline" className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Enviar Email de Prueba
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailSettingsForm;
