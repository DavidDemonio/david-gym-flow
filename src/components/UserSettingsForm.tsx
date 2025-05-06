
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Bell } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { mysqlConnection } from "../utils/mysqlConnection";

export function UserSettingsForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    notificationsEnabled: true
  });

  // Load user profile on mount
  useEffect(() => {
    const profile = mysqlConnection.getUserProfile();
    if (profile) {
      setFormData({
        email: profile.email || '',
        name: profile.name || '',
        notificationsEnabled: profile.notificationsEnabled !== false
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNotificationsChange = (checked: boolean) => {
    setFormData({
      ...formData,
      notificationsEnabled: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await mysqlConnection.setUserProfile(formData);
      
      toast({
        title: "Perfil guardado",
        description: "La información de tu perfil ha sido actualizada.",
      });
    } catch (err) {
      console.error('Error saving user profile:', err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar la información del perfil."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" /> 
          Perfil de Usuario
        </CardTitle>
        <CardDescription>
          Administra la información de tu perfil y las preferencias de notificación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Se utilizará para enviar notificaciones y rutinas.</p>
          </div>
          
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="notifications" 
              checked={formData.notificationsEnabled} 
              onCheckedChange={handleNotificationsChange} 
            />
            <Label htmlFor="notifications" className="flex items-center cursor-pointer">
              <Bell className="mr-2 h-4 w-4" /> 
              Habilitar notificaciones por correo
            </Label>
          </div>
          
          <CardFooter className="px-0 flex justify-end pt-4">
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
                'Guardar Perfil'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

export default UserSettingsForm;
