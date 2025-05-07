
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, User, Bell, Mail } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { mysqlConnection } from "../utils/mysqlConnection";

interface UserProfile {
  email: string;
  name: string;
  notificationsEnabled: boolean;
}

export function UserSettingsForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    name: '',
    notificationsEnabled: true
  });
  
  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);
  
  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await mysqlConnection.getUserProfile();
      
      if (response.success && response.data) {
        setUserProfile({
          email: response.data.email || '',
          name: response.data.name || '',
          notificationsEnabled: response.data.notificationsEnabled !== false // Default to true if not specified
        });
      } else {
        // If no profile exists yet, try to get the current logged in user
        const currentUser = mysqlConnection.getCurrentUser?.();
        if (currentUser) {
          setUserProfile({
            email: currentUser.email || '',
            name: currentUser.name || '',
            notificationsEnabled: true
          });
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      toast({
        variant: "destructive",
        title: "Error al cargar perfil",
        description: "No se pudo cargar el perfil de usuario"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfile({
      ...userProfile,
      [e.target.name]: e.target.value
    });
  };
  
  const handleNotificationToggle = (checked: boolean) => {
    setUserProfile({
      ...userProfile,
      notificationsEnabled: checked
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await mysqlConnection.setUserProfile(userProfile);
      
      if (result) {
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil ha sido actualizado correctamente",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error al guardar",
          description: "No se pudo actualizar el perfil"
        });
      }
    } catch (err) {
      console.error('Error saving user profile:', err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "Ocurrió un error al guardar el perfil"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Perfil de Usuario
        </CardTitle>
        <CardDescription>
          Actualiza tu información personal y preferencias
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={userProfile.email}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                placeholder="Tu Nombre"
                value={userProfile.name}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="notifications"
                checked={userProfile.notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              />
              <Label htmlFor="notifications" className="flex items-center cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                Recibir notificaciones
              </Label>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            className="gradient-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default UserSettingsForm;
