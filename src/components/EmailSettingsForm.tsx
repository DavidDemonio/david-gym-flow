
import React, { useState, useEffect } from 'react';
import { mysqlConnection, EmailConfig, UserProfile } from '../utils/mysqlConnection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Send, TestTube, Save, User, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EmailSettingsForm: React.FC = () => {
  const { toast } = useToast();
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    secure: false,
    secureType: 'TLS'
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    name: '',
    notificationsEnabled: false
  });
  
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [saveProfileStatus, setSaveProfileStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveEmailStatus, setSaveEmailStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

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
  const handleEmailConfigChange = (field: keyof EmailConfig, value: string | number | boolean) => {
    setEmailConfig(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle user profile changes
  const handleUserProfileChange = (field: keyof UserProfile, value: string | boolean) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };
  
  // Save email configuration
  const handleSaveEmailConfig = async () => {
    // Basic validation
    if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.fromEmail) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor complete los campos requeridos de configuración SMTP.",
      });
      return;
    }
    
    setSaveEmailStatus('saving');
    try {
      await mysqlConnection.setEmailConfig(emailConfig);
      setSaveEmailStatus('success');
      toast({
        title: "Configuración guardada",
        description: "La configuración de correo ha sido guardada correctamente.",
      });
      
      // Reset status after delay
      setTimeout(() => setSaveEmailStatus('idle'), 2000);
    } catch (err) {
      setSaveEmailStatus('error');
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: `Error: ${err}`,
      });
      
      // Reset status after delay
      setTimeout(() => setSaveEmailStatus('idle'), 2000);
    }
  };
  
  // Save user profile
  const handleSaveUserProfile = async () => {
    // Basic validation
    if (!userProfile.email) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Por favor ingrese su dirección de correo electrónico.",
      });
      return;
    }
    
    setSaveProfileStatus('saving');
    try {
      await mysqlConnection.setUserProfile(userProfile);
      setSaveProfileStatus('success');
      toast({
        title: "Perfil guardado",
        description: "La información de usuario ha sido guardada correctamente.",
      });
      
      // Reset status after delay
      setTimeout(() => setSaveProfileStatus('idle'), 2000);
    } catch (err) {
      setSaveProfileStatus('error');
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: `Error: ${err}`,
      });
      
      // Reset status after delay
      setTimeout(() => setSaveProfileStatus('idle'), 2000);
    }
  };
  
  // Test SMTP connection
  const handleTestEmailConfig = async () => {
    setTestStatus('testing');
    try {
      const result = await mysqlConnection.testEmailConfig();
      
      if (result.success) {
        setTestStatus('success');
        toast({
          title: "Conexión exitosa",
          description: result.message,
        });
      } else {
        setTestStatus('error');
        toast({
          variant: "destructive",
          title: "Error de conexión",
          description: result.message,
        });
      }
      
      // Reset status after delay
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (err) {
      setTestStatus('error');
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: `Error inesperado: ${err}`,
      });
      
      // Reset status after delay
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };
  
  // Send test email
  const handleSendTestEmail = async () => {
    if (!userProfile.email) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Por favor ingrese su dirección de correo electrónico primero.",
      });
      return;
    }
    
    setSendStatus('sending');
    try {
      const result = await mysqlConnection.sendEmail(
        userProfile.email,
        "Prueba de correo GymFlow",
        `Hola ${userProfile.name || 'usuario'},\n\nEste es un correo de prueba desde la aplicación GymFlow.\n\nSaludos!`
      );
      
      if (result.success) {
        setSendStatus('success');
        toast({
          title: "Correo enviado",
          description: result.message,
        });
      } else {
        setSendStatus('error');
        toast({
          variant: "destructive",
          title: "Error al enviar",
          description: result.message,
        });
      }
      
      // Reset status after delay
      setTimeout(() => setSendStatus('idle'), 3000);
    } catch (err) {
      setSendStatus('error');
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: `Error inesperado: ${err}`,
      });
      
      // Reset status after delay
      setTimeout(() => setSendStatus('idle'), 3000);
    }
  };
  
  const renderTestButton = () => {
    switch (testStatus) {
      case 'testing':
        return (
          <Button disabled variant="outline" className="flex-1">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Probando...
          </Button>
        );
      case 'success':
        return (
          <Button variant="outline" className="flex-1 bg-green-50 border-green-200 text-green-600">
            <Check className="mr-2 h-4 w-4" />
            Conexión exitosa
          </Button>
        );
      case 'error':
        return (
          <Button variant="destructive" className="flex-1">
            <AlertCircle className="mr-2 h-4 w-4" />
            Error de conexión
          </Button>
        );
      default:
        return (
          <Button onClick={handleTestEmailConfig} variant="outline" className="flex-1">
            <TestTube className="mr-2 h-4 w-4" />
            Probar Conexión
          </Button>
        );
    }
  };
  
  const renderSendButton = () => {
    switch (sendStatus) {
      case 'sending':
        return (
          <Button disabled variant="outline" className="flex-1">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </Button>
        );
      case 'success':
        return (
          <Button variant="outline" className="flex-1 bg-green-50 border-green-200 text-green-600">
            <Check className="mr-2 h-4 w-4" />
            Correo enviado
          </Button>
        );
      case 'error':
        return (
          <Button variant="destructive" className="flex-1">
            <AlertCircle className="mr-2 h-4 w-4" />
            Error de envío
          </Button>
        );
      default:
        return (
          <Button onClick={handleSendTestEmail} variant="outline" className="flex-1">
            <Send className="mr-2 h-4 w-4" />
            Enviar Email de Prueba
          </Button>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil de Usuario
              </CardTitle>
              <CardDescription>
                Configure su perfil para recibir notificaciones y rutinas por correo
              </CardDescription>
            </div>
            {saveProfileStatus === 'success' && (
              <Badge variant="success">Guardado</Badge>
            )}
          </div>
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
          <Button 
            onClick={handleSaveUserProfile} 
            className="w-full"
            disabled={saveProfileStatus === 'saving'}
          >
            {saveProfileStatus === 'saving' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Perfil
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuración SMTP</CardTitle>
              <CardDescription>
                Configure el servidor de correo electrónico para enviar notificaciones
              </CardDescription>
            </div>
            {saveEmailStatus === 'success' && (
              <Badge variant="success">Guardado</Badge>
            )}
          </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="secure_connection"
                checked={emailConfig.secure}
                onCheckedChange={(checked) => handleEmailConfigChange('secure', checked)}
              />
              <Label htmlFor="secure_connection">Conexión Segura (SSL/TLS)</Label>
            </div>
            
            {emailConfig.secure && (
              <div className="space-y-2">
                <Label htmlFor="secure_type">Tipo de Seguridad</Label>
                <Select
                  value={emailConfig.secureType}
                  onValueChange={(value) => handleEmailConfigChange('secureType', value)}
                >
                  <SelectTrigger id="secure_type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SSL">SSL</SelectItem>
                    <SelectItem value="TLS">TLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={handleSaveEmailConfig} 
            className="w-full"
            disabled={saveEmailStatus === 'saving'}
          >
            {saveEmailStatus === 'saving' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración SMTP
              </>
            )}
          </Button>
          
          <div className="flex gap-2 w-full">
            {renderTestButton()}
            {renderSendButton()}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailSettingsForm;
