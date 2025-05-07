
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Mail } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { mysqlConnection } from "../utils/mysqlConnection";

export function UserSettingsForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notificationsEnabled: true
  });

  // Load user profile data on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        const result = await mysqlConnection.getUserProfile();
        if (result && result.success && result.data) {
          setFormData({
            name: result.data.name || '',
            email: result.data.email || '',
            notificationsEnabled: result.data.notificationsEnabled !== false
          });
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el perfil de usuario"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleNotifications = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificationsEnabled: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Call API to update user profile
      const result = await mysqlConnection.updateUserProfile({
        name: formData.name,
        email: formData.email,
        notificationsEnabled: formData.notificationsEnabled
      });
      
      if (result && result.success) {
        toast({
          title: "Perfil actualizado",
          description: "La información del usuario ha sido actualizada correctamente"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error al guardar",
          description: result?.message || "No se pudo actualizar la información del usuario"
        });
      }
    } catch (err) {
      console.error('Error updating user profile:', err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo actualizar la información del usuario"
      });
    } finally {
      setIsSaving(false);
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
          Actualiza tu información personal y preferencias de notificación.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Se usará para enviar notificaciones y rutinas de entrenamiento.
                </p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="notifications"
                  checked={formData.notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                />
                <Label htmlFor="notifications" className="cursor-pointer">
                  Activar notificaciones
                </Label>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="gradient-btn w-full sm:w-auto" 
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : "Guardar cambios"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default UserSettingsForm;
