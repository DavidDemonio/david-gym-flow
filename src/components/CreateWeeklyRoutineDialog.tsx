
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mysqlConnection, Routine } from '../utils/mysqlConnection';
import { adaptRoutine } from '../utils/typeAdapter';

interface CreateWeeklyRoutineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoutineCreated: (routine: Routine) => void;
}

// Define the routine creation interface
interface RoutineCreationData {
  name: string;
  objetivo: string;
  nivel: string;
  equipamiento: string;
  dias: number;
}

const CreateWeeklyRoutineDialog: React.FC<CreateWeeklyRoutineDialogProps> = ({ isOpen, onClose, onRoutineCreated }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RoutineCreationData>({
    name: '',
    objetivo: 'hipertrofia', // Default value
    nivel: 'intermedio', // Default value
    equipamiento: 'gimnasio', // Default value
    dias: 3, // Default value
  });
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la rutina",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Structure the data for a weekly routine
      const weeklyRoutine = {
        name: formData.name,
        objetivo: formData.objetivo,
        nivel: formData.nivel,
        equipamiento: formData.equipamiento,
        dias: Number(formData.dias), // Convert to number
        exercises: {},
        status: 'pending'
      };
      
      // Create the routine
      const result = await mysqlConnection.saveRoutine(weeklyRoutine);
      
      if (result) {
        toast({
          title: "¡Rutina creada!",
          description: "Tu rutina semanal ha sido creada con éxito",
        });
        
        // Pass the created routine back to the parent
        onRoutineCreated(result);
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Ocurrió un error al crear la rutina",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating weekly routine:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la rutina",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Rutina Semanal</DialogTitle>
          <DialogDescription>
            Configura los detalles básicos de tu rutina semanal
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Rutina</Label>
            <Input 
              id="name"
              name="name"
              placeholder="Ej: Mi rutina de hipertrofia"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo</Label>
              <Select 
                value={formData.objetivo} 
                onValueChange={(value) => handleSelectChange('objetivo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                    <SelectItem value="fuerza">Fuerza</SelectItem>
                    <SelectItem value="resistencia">Resistencia</SelectItem>
                    <SelectItem value="definicion">Definición</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel</Label>
              <Select 
                value={formData.nivel} 
                onValueChange={(value) => handleSelectChange('nivel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="principiante">Principiante</SelectItem>
                    <SelectItem value="intermedio">Intermedio</SelectItem>
                    <SelectItem value="avanzado">Avanzado</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipamiento">Equipamiento</Label>
              <Select 
                value={formData.equipamiento} 
                onValueChange={(value) => handleSelectChange('equipamiento', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona equipamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="gimnasio">Gimnasio completo</SelectItem>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="casa">En casa</SelectItem>
                    <SelectItem value="sin">Sin equipamiento</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dias">Días por semana</Label>
              <Select 
                value={String(formData.dias)} 
                onValueChange={(value) => handleSelectChange('dias', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona los días" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">1 día</SelectItem>
                    <SelectItem value="2">2 días</SelectItem>
                    <SelectItem value="3">3 días</SelectItem>
                    <SelectItem value="4">4 días</SelectItem>
                    <SelectItem value="5">5 días</SelectItem>
                    <SelectItem value="6">6 días</SelectItem>
                    <SelectItem value="7">7 días</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Rutina"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWeeklyRoutineDialog;
