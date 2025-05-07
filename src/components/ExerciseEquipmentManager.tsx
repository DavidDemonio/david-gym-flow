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
import { 
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem 
} from "@/components/ui/select";
import { useToast } from "../hooks/use-toast";
import { useIsMobile } from "../hooks/use-mobile";
import { exercises, muscleGroups, equipmentCategories } from "../data/equipmentData";
import { 
  Dumbbell, Trash, Edit, Plus, Download, Loader2,
  Save, X, ChevronDown, Filter, CheckCircle2 
} from "lucide-react";

import { Exercise, Equipment } from "../utils/mysqlConnection";
import { adaptExerciseData, adaptEquipmentData } from "../utils/typeFixAdapter";

// Define extended types that include type property
interface ExerciseWithType extends Exercise {
  type: string;
}

interface EquipmentWithType extends Equipment {
  type: string;
}

export function ExerciseEquipmentManager() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [exercisesList, setExercisesList] = useState<ExerciseWithType[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentWithType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ejercicios");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string | number, type: string } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExerciseWithType | EquipmentWithType | null>(null);
  const [newItem, setNewItem] = useState<ExerciseWithType | EquipmentWithType | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Adapt exercises from data to match Exercise type with type property
      const adaptedExercises = exercises.map(ex => adaptExerciseData({...ex, type: 'exercise'}));
      setExercisesList(adaptedExercises as ExerciseWithType[]);
      
      // Create some equipment from the exercise equipment fields
      const uniqueEquipmentMap = new Map();
      
      exercises.forEach(ex => {
        if (typeof ex.equipment === 'string' && ex.equipment) {
          if (!uniqueEquipmentMap.has(ex.equipment)) {
            const category = equipmentCategories.includes(ex.equipment) 
              ? ex.equipment 
              : 'Otro';
              
            uniqueEquipmentMap.set(ex.equipment, adaptEquipmentData({
              id: `eq-${uniqueEquipmentMap.size + 1}`,
              name: ex.equipment,
              category,
              muscleGroups: ex.muscleGroups,
              emoji: '🏋️‍♀️',
              type: 'equipment'
            }));
          }
        } else if (Array.isArray(ex.equipment)) {
          ex.equipment.forEach(eq => {
            if (eq && !uniqueEquipmentMap.has(eq)) {
              const category = equipmentCategories.includes(eq) 
                ? eq 
                : 'Otro';
                
              uniqueEquipmentMap.set(eq, adaptEquipmentData({
                id: `eq-${uniqueEquipmentMap.size + 1}`,
                name: eq,
                category,
                muscleGroups: ex.muscleGroups,
                emoji: '🏋️‍♀️',
                type: 'equipment'
              }));
            }
          });
        }
      });
      
      setEquipmentList(Array.from(uniqueEquipmentMap.values()) as EquipmentWithType[]);
      
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
        const updatedExercises = exercisesList.filter(ex => ex.id !== itemToDelete.id);
        setExercisesList(updatedExercises);
        // In a real app, we'd call an API to save the changes
      } else {
        // Filter out the equipment to delete
        const updatedEquipment = equipmentList.filter(eq => eq.id !== itemToDelete.id);
        setEquipmentList(updatedEquipment);
        // In a real app, we'd call an API to save the changes
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
  
  const openEditDialog = (item: Exercise | Equipment, type: string) => {
    setEditItem({ ...item, type } as ExerciseWithType | EquipmentWithType);
    setEditDialogOpen(true);
  };

  const openAddDialog = (type: string) => {
    if (type === 'exercise') {
      setNewItem({
        id: `ex-${Date.now()}`,
        name: '',
        description: '',
        muscleGroups: [],
        equipment: [],
        emoji: '💪',
        sets: 3,
        reps: '12',
        rest: '60s',
        difficulty: 'Intermedio',
        calories: 0,
        type: 'exercise'
      } as ExerciseWithType);
    } else {
      setNewItem({
        id: `eq-${Date.now()}`,
        name: '',
        category: 'Máquinas',
        muscleGroups: [],
        emoji: '🏋️‍♀️',
        description: '',
        type: 'equipment'
      } as EquipmentWithType);
    }
    setAddDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (!editItem) return;
    
    try {
      if (editItem.type === 'exercise') {
        const updatedExercises = exercisesList.map(ex => 
          ex.id === editItem.id ? { ...editItem as Exercise } : ex
        );
        setExercisesList(updatedExercises);
        // In a real app, we'd save to API/DB
      } else {
        const updatedEquipment = equipmentList.map(eq => 
          eq.id === editItem.id ? { ...editItem as Equipment } : eq
        );
        setEquipmentList(updatedEquipment);
        // In a real app, we'd save to API/DB
      }
      
      toast({
        title: "Cambios guardados",
        description: `Los cambios han sido guardados correctamente`,
      });
      
      setEditDialogOpen(false);
      setEditItem(null);
    } catch (err) {
      console.error("Error saving changes:", err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios"
      });
    }
  };
  
  const handleAddItem = () => {
    if (!newItem) return;
    
    try {
      if (newItem.type === 'exercise') {
        setExercisesList(prev => [...prev, newItem as Exercise]);
        // In a real app, we'd save to API/DB
      } else {
        setEquipmentList(prev => [...prev, newItem as Equipment]);
        // In a real app, we'd save to API/DB
      }
      
      toast({
        title: `${newItem.type === 'exercise' ? 'Ejercicio' : 'Equipo'} añadido`,
        description: `Se ha añadido correctamente a la base de datos`,
      });
      
      setAddDialogOpen(false);
      setNewItem(null);
    } catch (err) {
      console.error("Error adding item:", err);
      toast({
        variant: "destructive",
        title: "Error al añadir",
        description: "No se pudo añadir el elemento"
      });
    }
  };

  const handleUpdateEditItem = (field: string, value: any) => {
    if (!editItem) return;
    setEditItem({ ...editItem, [field]: value });
  };
  
  const handleUpdateNewItem = (field: string, value: any) => {
    if (!newItem) return;
    setNewItem({ ...newItem, [field]: value });
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
          
          <TabsContent value="ejercicios" className="animate-fade-in">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : exercisesList.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">No hay ejercicios disponibles</p>
                <Button className="mt-4" onClick={loadData}>
                  Recargar datos
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
                  <Button 
                    onClick={() => openAddDialog('exercise')} 
                    className="gradient-btn"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isMobile ? "Añadir" : "Añadir ejercicio"}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size={isMobile ? "sm" : "default"}>
                      <Filter className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
                      {!isMobile && "Filtrar"}
                    </Button>
                    
                    <Button variant="outline" size={isMobile ? "sm" : "default"}>
                      <Download className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
                      {!isMobile && "Exportar"}
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        {!isMobile && <TableHead>Grupos Musculares</TableHead>}
                        {!isMobile && <TableHead>Equipamiento</TableHead>}
                        <TableHead>Dificultad</TableHead>
                        <TableHead className="w-[80px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercisesList.map((exercise) => (
                        <TableRow key={exercise.id} className="hover:bg-muted/50 transition-all">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{exercise.emoji}</span>
                              <span>{exercise.name}</span>
                            </div>
                          </TableCell>
                          
                          {!isMobile && (
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups.map((group, i) => (
                                  <Badge key={i} variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
                                    {group}
                                  </Badge>
                                )) : <span>{exercise.muscleGroups}</span>}
                              </div>
                            </TableCell>
                          )}
                          
                          {!isMobile && (
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(exercise.equipment) ? exercise.equipment.map((equip, i) => (
                                  <Badge key={i} variant="secondary" className="bg-blue-50 dark:bg-blue-900/20">
                                    {equip}
                                  </Badge>
                                )) : exercise.equipment ? <span>{exercise.equipment}</span> : "Sin equipo"}
                              </div>
                            </TableCell>
                          )}
                          
                          <TableCell className={isMobile ? "text-xs" : ""}>
                            {exercise.difficulty || "Intermedio"}
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(exercise, 'exercise')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => confirmDelete(exercise.id, 'exercise')}
                              >
                                <Trash className="h-4 w-4" />
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
          
          <TabsContent value="equipamiento" className="animate-fade-in">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : equipmentList.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">No hay equipamiento disponible</p>
                <Button className="mt-4" onClick={loadData}>
                  Recargar datos
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
                  <Button 
                    onClick={() => openAddDialog('equipment')} 
                    className="gradient-btn"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isMobile ? "Añadir" : "Añadir equipamiento"}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size={isMobile ? "sm" : "default"}>
                      <Filter className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
                      {!isMobile && "Filtrar"}
                    </Button>
                    
                    <Button variant="outline" size={isMobile ? "sm" : "default"}>
                      <Download className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
                      {!isMobile && "Exportar"}
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        {!isMobile && <TableHead>Grupos Musculares</TableHead>}
                        <TableHead className="w-[80px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipmentList.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50 transition-all">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{item.emoji}</span>
                              <span>{item.name}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>{item.category}</TableCell>
                          
                          {!isMobile && (
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(item.muscleGroups) ? item.muscleGroups.map((group, i) => (
                                  <Badge key={i} variant="outline" className="bg-green-50 dark:bg-green-900/20">
                                    {group}
                                  </Badge>
                                )) : <span>{item.muscleGroups}</span>}
                              </div>
                            </TableCell>
                          )}
                          
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(item, 'equipment')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => confirmDelete(item.id, 'equipment')}
                              >
                                <Trash className="h-4 w-4" />
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
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between flex-wrap gap-3">
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
          <Save className="mr-2 h-4 w-4" />
          Guardar cambios
        </Button>
      </CardFooter>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este {itemToDelete?.type === 'exercise' ? 'ejercicio' : 'equipamiento'}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-sm">
              Al eliminar este elemento, también podrías estar afectando a las rutinas de entrenamiento que lo utilizan.
            </p>
          </div>
          
          <DialogFooter className="flex sm:justify-between gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar {editItem?.type === 'exercise' ? 'ejercicio' : 'equipamiento'}</DialogTitle>
            <DialogDescription>
              Modifica los detalles y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
          
          {editItem?.type === 'exercise' ? (
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={(editItem as Exercise).name}
                    onChange={(e) => handleUpdateEditItem('name', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    value={(editItem as Exercise).emoji}
                    onChange={(e) => handleUpdateEditItem('emoji', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="sets">Series</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={(editItem as Exercise).sets}
                    onChange={(e) => handleUpdateEditItem('sets', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="reps">Repeticiones</Label>
                  <Input
                    id="reps"
                    value={(editItem as Exercise).reps}
                    onChange={(e) => handleUpdateEditItem('reps', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="rest">Descanso</Label>
                  <Input
                    id="rest"
                    value={(editItem as Exercise).rest}
                    onChange={(e) => handleUpdateEditItem('rest', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select 
                    value={(editItem as Exercise).difficulty} 
                    onValueChange={(value) => handleUpdateEditItem('difficulty', value)}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Seleccionar dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Principiante">Principiante</SelectItem>
                      <SelectItem value="Intermedio">Intermedio</SelectItem>
                      <SelectItem value="Avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={(editItem as Exercise).description}
                    onChange={(e) => handleUpdateEditItem('description', e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                
                {/* Muscle groups and equipment would be multiselect in a real implementation */}
                
              </div>
            </div>
          ) : (
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={(editItem as Equipment).name}
                    onChange={(e) => handleUpdateEditItem('name', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    value={(editItem as Equipment).emoji}
                    onChange={(e) => handleUpdateEditItem('emoji', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    value={(editItem as Equipment).category} 
                    onValueChange={(value) => handleUpdateEditItem('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={(editItem as Equipment).description || ''}
                    onChange={(e) => handleUpdateEditItem('description', e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                
                {/* Muscle groups would be multiselect in a real implementation */}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex sm:justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="w-full sm:w-auto gradient-btn"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir nuevo {newItem?.type === 'exercise' ? 'ejercicio' : 'equipamiento'}</DialogTitle>
            <DialogDescription>
              Completa todos los campos requeridos.
            </DialogDescription>
          </DialogHeader>
          
          {newItem?.type === 'exercise' ? (
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={(newItem as Exercise).name}
                    onChange={(e) => handleUpdateNewItem('name', e.target.value)}
                    className="w-full"
                    placeholder="Nombre del ejercicio"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    value={(newItem as Exercise).emoji}
                    onChange={(e) => handleUpdateNewItem('emoji', e.target.value)}
                    className="w-full"
                    placeholder="💪"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="sets">Series *</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={(newItem as Exercise).sets}
                    onChange={(e) => handleUpdateNewItem('sets', parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="reps">Repeticiones *</Label>
                  <Input
                    id="reps"
                    value={(newItem as Exercise).reps}
                    onChange={(e) => handleUpdateNewItem('reps', e.target.value)}
                    className="w-full"
                    placeholder="12-15, 8, etc."
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="rest">Descanso</Label>
                  <Input
                    id="rest"
                    value={(newItem as Exercise).rest}
                    onChange={(e) => handleUpdateNewItem('rest', e.target.value)}
                    className="w-full"
                    placeholder="60s, 90s, etc."
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select 
                    value={(newItem as Exercise).difficulty} 
                    onValueChange={(value) => handleUpdateNewItem('difficulty', value)}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Seleccionar dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Principiante">Principiante</SelectItem>
                      <SelectItem value="Intermedio">Intermedio</SelectItem>
                      <SelectItem value="Avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={(newItem as Exercise).description}
                    onChange={(e) => handleUpdateNewItem('description', e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe cómo realizar este ejercicio"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={(newItem as Equipment).name}
                    onChange={(e) => handleUpdateNewItem('name', e.target.value)}
                    className="w-full"
                    placeholder="Nombre del equipamiento"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    value={(newItem as Equipment).emoji}
                    onChange={(e) => handleUpdateNewItem('emoji', e.target.value)}
                    className="w-full"
                    placeholder="🏋️‍♀️"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select 
                    value={(newItem as Equipment).category} 
                    onValueChange={(value) => handleUpdateNewItem('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={(newItem as Equipment).description || ''}
                    onChange={(e) => handleUpdateNewItem('description', e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe este equipamiento"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex sm:justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => setAddDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              onClick={handleAddItem}
              disabled={newItem?.type === 'exercise' 
                ? !(newItem as Exercise).name || !(newItem as Exercise).sets || !(newItem as Exercise).reps
                : !(newItem as Equipment).name || !(newItem as Equipment).category
              }
              className="w-full sm:w-auto gradient-btn"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Añadir {newItem?.type === 'exercise' ? 'ejercicio' : 'equipamiento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ExerciseEquipmentManager;
