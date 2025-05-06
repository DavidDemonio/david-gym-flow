
import React, { useState, useEffect } from 'react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { mysqlConnection, Exercise, Equipment } from "../utils/mysqlConnection";
import { Dumbbell, Trash, Edit, Plus, Download, Loader2 } from "lucide-react";

export function ExerciseEquipmentManager() {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ejercicios");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string | number, type: string } | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Check if connected to MySQL
      if (mysqlConnection.isConnected()) {
        // Load exercises and equipment
        const exercisesResult = await mysqlConnection.getExercises();
        const equipmentResult = await mysqlConnection.getEquipment();
        
        setExercises(exercisesResult);
        setEquipment(equipmentResult);
      } else {
        toast({
          variant: "destructive",
          title: "No hay conexión a la base de datos",
          description: "Configura la conexión a MySQL para ver los ejercicios y equipos"
        });
      }
    } catch (err) {
      console.error("Error loading data:", err);
      toast({
        variant: "destructive",
        title: "Error al cargar datos",
        description: "No se pudieron cargar los ejercicios y equipos"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'exercise') {
        // Filter out the exercise to delete
        const updatedExercises = exercises.filter(ex => ex.id !== itemToDelete.id);
        await mysqlConnection.saveExercises(updatedExercises);
        setExercises(updatedExercises);
      } else {
        // Filter out the equipment to delete
        const updatedEquipment = equipment.filter(eq => eq.id !== itemToDelete.id);
        await mysqlConnection.saveEquipment(updatedEquipment);
        setEquipment(updatedEquipment);
      }
      
      toast({
        title: "Elemento eliminado",
        description: `El ${itemToDelete.type === 'exercise' ? 'ejercicio' : 'equipo'} ha sido eliminado correctamente`
      });
    } catch (err) {
      console.error("Error deleting item:", err);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el elemento seleccionado"
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  const confirmDelete = (id: string | number, type: string) => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Gestión de Ejercicios y Equipamiento
        </CardTitle>
        <CardDescription>
          Visualiza y gestiona todos los ejercicios y equipamiento disponibles
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="ejercicios" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
            <TabsTrigger value="equipamiento">Equipamiento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ejercicios">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">No hay ejercicios disponibles</p>
                <Button className="mt-4" onClick={loadData}>
                  Recargar datos
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border mb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Grupos Musculares</TableHead>
                        <TableHead>Equipamiento</TableHead>
                        <TableHead>Dificultad</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercises.map((exercise) => (
                        <TableRow key={exercise.id}>
                          <TableCell className="font-medium">
                            {exercise.emoji} {exercise.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups.map((group, i) => (
                                <Badge key={i} variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
                                  {group}
                                </Badge>
                              )) : <span>{exercise.muscleGroups}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(exercise.equipment) ? exercise.equipment.map((equip, i) => (
                                <Badge key={i} variant="secondary" className="bg-blue-50 dark:bg-blue-900/20">
                                  {equip}
                                </Badge>
                              )) : exercise.equipment ? <span>{exercise.equipment}</span> : "Sin equipo"}
                            </div>
                          </TableCell>
                          <TableCell>{exercise.difficulty}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(exercise.id!, 'exercise')}>
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="equipamiento">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : equipment.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">No hay equipamiento disponible</p>
                <Button className="mt-4" onClick={loadData}>
                  Recargar datos
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Grupos Musculares</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.emoji} {item.name}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(item.muscleGroups) ? item.muscleGroups.map((group, i) => (
                              <Badge key={i} variant="outline" className="bg-green-50 dark:bg-green-900/20">
                                {group}
                              </Badge>
                            )) : <span>{item.muscleGroups}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => confirmDelete(item.id!, 'equipment')}>
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            <>Recargar datos</>
          )}
        </Button>
        
        <Button className="gradient-btn">
          <Plus className="mr-2 h-4 w-4" />
          Añadir {activeTab === "ejercicios" ? "Ejercicio" : "Equipamiento"}
        </Button>
      </CardFooter>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este {itemToDelete?.type === 'exercise' ? 'ejercicio' : 'equipamiento'}?
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
    </Card>
  );
}

export default ExerciseEquipmentManager;
