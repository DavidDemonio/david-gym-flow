
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "../hooks/use-toast";
import { mysqlConnection, Routine } from "../utils/mysqlConnection";
import { Calendar, Trash, Edit, Plus, Loader2, Check, Clock, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Routine status types
type RoutineStatus = "pending" | "in-progress" | "completed";

interface RoutineWithStatus extends Routine {
  status: RoutineStatus;
}

export function RoutineManager() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<RoutineWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<RoutineWithStatus | null>(null);
  
  useEffect(() => {
    loadRoutines();
  }, []);
  
  const loadRoutines = async () => {
    setIsLoading(true);
    try {
      // Check if connected to MySQL
      if (mysqlConnection.isConnected()) {
        // Load routines
        const routinesResult = await mysqlConnection.getRoutines();
        
        // Add status to routines (default to 'pending' if not set)
        const routinesWithStatus = routinesResult.map(routine => {
          const storedStatus = localStorage.getItem(`routine_status_${routine.id}`);
          return {
            ...routine,
            status: (storedStatus as RoutineStatus) || 'pending'
          };
        });
        
        setRoutines(routinesWithStatus);
      } else {
        toast({
          variant: "destructive",
          title: "No hay conexión a la base de datos",
          description: "Configura la conexión a MySQL para ver tus rutinas"
        });
      }
    } catch (err) {
      console.error("Error loading routines:", err);
      toast({
        variant: "destructive",
        title: "Error al cargar rutinas",
        description: "No se pudieron cargar las rutinas guardadas"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!routineToDelete) return;
    
    try {
      // Filter out the routine to delete
      const updatedRoutines = routines.filter(r => r.id !== routineToDelete);
      await mysqlConnection.saveRoutines(updatedRoutines);
      setRoutines(updatedRoutines);
      
      // Remove status from localStorage
      localStorage.removeItem(`routine_status_${routineToDelete}`);
      
      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada correctamente"
      });
      
      // Send email notification
      if (mysqlConnection.getUserProfile()?.email) {
        const emailResult = await mysqlConnection.sendEmail(
          mysqlConnection.getUserProfile()!.email!,
          "Rutina eliminada",
          `Has eliminado una rutina de entrenamiento.\n\nFecha: ${new Date().toLocaleDateString()}\n\nSigue entrenando con GymFlow!`
        );
        
        if (!emailResult.success) {
          console.error("Error sending email notification:", emailResult);
        }
      }
    } catch (err) {
      console.error("Error deleting routine:", err);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar la rutina seleccionada"
      });
    } finally {
      setDeleteDialogOpen(false);
      setRoutineToDelete(null);
    }
  };
  
  const confirmDelete = (routineId: number) => {
    setRoutineToDelete(routineId);
    setDeleteDialogOpen(true);
  };
  
  const openEditDialog = (routine: RoutineWithStatus) => {
    setRoutineToEdit({...routine});
    setEditDialogOpen(true);
  };
  
  const handleEditSave = async () => {
    if (!routineToEdit) return;
    
    try {
      // Update the routine in the list
      const updatedRoutines = routines.map(r => 
        r.id === routineToEdit.id ? routineToEdit : r
      );
      
      await mysqlConnection.saveRoutines(updatedRoutines);
      setRoutines(updatedRoutines);
      
      // Save status in localStorage
      localStorage.setItem(`routine_status_${routineToEdit.id}`, routineToEdit.status);
      
      toast({
        title: "Rutina actualizada",
        description: "Los cambios han sido guardados correctamente"
      });
      
      // Send email notification
      if (mysqlConnection.getUserProfile()?.email) {
        const emailResult = await mysqlConnection.sendEmail(
          mysqlConnection.getUserProfile()!.email!,
          "Rutina actualizada",
          `Has actualizado la rutina "${routineToEdit.name}".\n\nFecha: ${new Date().toLocaleDateString()}\n\nEstado: ${getStatusText(routineToEdit.status)}\n\nSigue entrenando con GymFlow!`
        );
        
        if (!emailResult.success) {
          console.error("Error sending email notification:", emailResult);
        }
      }
    } catch (err) {
      console.error("Error updating routine:", err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios en la rutina"
      });
    } finally {
      setEditDialogOpen(false);
      setRoutineToEdit(null);
    }
  };
  
  const handleChangeStatus = async (routineId: number, status: RoutineStatus) => {
    try {
      // Update status in the routine list
      const updatedRoutines = routines.map(r => 
        r.id === routineId ? {...r, status} : r
      );
      
      setRoutines(updatedRoutines);
      
      // Save status in localStorage
      localStorage.setItem(`routine_status_${routineId}`, status);
      
      toast({
        title: "Estado actualizado",
        description: `Rutina marcada como "${getStatusText(status)}"`
      });
      
      // Get routine name for the email
      const routine = routines.find(r => r.id === routineId);
      
      // Send email notification
      if (mysqlConnection.getUserProfile()?.email) {
        const emailResult = await mysqlConnection.sendEmail(
          mysqlConnection.getUserProfile()!.email!,
          `Estado de rutina actualizado`,
          `Has actualizado el estado de la rutina "${routine?.name}".\n\nNuevo estado: ${getStatusText(status)}\n\nFecha: ${new Date().toLocaleDateString()}\n\n¡Sigue entrenando con GymFlow!`
        );
        
        if (!emailResult.success) {
          console.error("Error sending email notification:", emailResult);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: "No se pudo actualizar el estado de la rutina"
      });
    }
  };
  
  const getStatusText = (status: RoutineStatus): string => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in-progress': return 'En progreso';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };
  
  const getStatusBadge = (status: RoutineStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">Pendiente</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">En progreso</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Completada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };
  
  const viewRoutine = (routineId: number) => {
    // Set the selected routine in localStorage to view it in MiRutina page
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
      const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      const selectedDays = weekDays.slice(0, routine.dias);
      
      // Create weekly routine data structure from the routine
      const weeklyRoutineData = {
        name: routine.name,
        days: routine.dias,
        dayNames: selectedDays,
        focusAreas: Object.fromEntries(
          selectedDays.map((_, index) => [(index + 1).toString(), `Día ${index + 1}`])
        ),
        exercises: routine.exercises
      };
      
      // Save to localStorage and navigate to the routine page
      localStorage.setItem('weeklyRoutine', JSON.stringify(weeklyRoutineData));
      navigate('/mi-rutina', { state: { weeklyRoutine: true } });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Mis Rutinas de Entrenamiento
        </CardTitle>
        <CardDescription>
          Gestiona todas tus rutinas guardadas y su estado de progreso
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : routines.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">No tienes rutinas guardadas</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Crea una nueva rutina para empezar a entrenar
            </p>
            <Button className="mt-4 gradient-btn" onClick={() => navigate('/crear-rutina')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Nueva Rutina
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.map((routine) => (
              <Card key={routine.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{routine.name}</CardTitle>
                    {getStatusBadge(routine.status)}
                  </div>
                  <CardDescription>
                    {routine.objetivo} • {routine.nivel} • {routine.dias} días
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{Object.keys(routine.exercises).length} días de entrenamiento</p>
                    <p>Equipamiento: {routine.equipamiento}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-2">
                  <div className="flex-1 flex gap-2">
                    <Select 
                      value={routine.status} 
                      onValueChange={(value) => handleChangeStatus(routine.id as number, value as RoutineStatus)}
                    >
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">🕒 Pendiente</SelectItem>
                        <SelectItem value="in-progress">🏃‍♂️ En progreso</SelectItem>
                        <SelectItem value="completed">✅ Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={() => confirmDelete(routine.id as number)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(routine)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="gradient-btn" onClick={() => viewRoutine(routine.id as number)}>
                    Ver Rutina
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={loadRoutines} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            <>Recargar rutinas</>
          )}
        </Button>
        
        <Button className="gradient-btn" onClick={() => navigate('/crear-rutina')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Rutina
        </Button>
      </CardFooter>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta rutina?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex sm:justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit routine dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rutina</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu rutina de entrenamiento
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={routineToEdit?.name || ''}
                onChange={(e) => setRoutineToEdit(prev => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Estado
              </Label>
              <Select 
                value={routineToEdit?.status || 'pending'} 
                onValueChange={(value) => setRoutineToEdit(prev => prev ? {...prev, status: value as RoutineStatus} : null)}
              >
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">🕒 Pendiente</SelectItem>
                  <SelectItem value="in-progress">🏃‍♂️ En progreso</SelectItem>
                  <SelectItem value="completed">✅ Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditSave}
              className="w-full sm:w-auto gradient-btn"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default RoutineManager;
