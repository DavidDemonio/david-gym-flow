
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Calendar, CircleX, Dumbbell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Exercise, mysqlConnection, Routine } from '@/utils/mysqlConnection';
import { adaptRoutine } from '@/utils/typeAdapter';

interface CreateWeeklyRoutineDialogProps {
  exercises: Exercise[];
  open: boolean;
  onClose: () => void;
}

const CreateWeeklyRoutineDialog = ({ exercises, open, onClose }: CreateWeeklyRoutineDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [isCreating, setIsCreating] = useState(false);
  
  const [routineName, setRoutineName] = useState('');
  const [routineGoal, setRoutineGoal] = useState('');
  const [routineLevel, setRoutineLevel] = useState('');
  const [routineEquipment, setRoutineEquipment] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  
  const [selectedExercises, setSelectedExercises] = useState<Record<string, Exercise[]>>({
    '1': [],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
    '6': [],
    '7': [],
  });
  
  const resetForm = () => {
    setRoutineName('');
    setRoutineGoal('');
    setRoutineLevel('');
    setRoutineEquipment('');
    setDaysPerWeek(3);
    setSelectedExercises({
      '1': [],
      '2': [],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
    });
    setActiveTab('details');
  };
  
  const handleDaySelection = () => {
    setActiveTab('exercises');
  };
  
  const addExerciseToDay = (day: string, exercise: Exercise) => {
    setSelectedExercises(prev => ({
      ...prev,
      [day]: [...prev[day], exercise],
    }));
  };
  
  const removeExerciseFromDay = (day: string, exerciseId: number | string) => {
    setSelectedExercises(prev => ({
      ...prev,
      [day]: prev[day].filter(ex => ex.id !== exerciseId),
    }));
  };
  
  const handleCreateRoutine = async () => {
    if (routineName.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre de la rutina es obligatorio",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Filter out empty exercise days
      const exercisesForDb: Record<string, Exercise[]> = {};
      
      for (let i = 1; i <= daysPerWeek; i++) {
        const dayKey = i.toString();
        if (selectedExercises[dayKey] && selectedExercises[dayKey].length > 0) {
          exercisesForDb[dayKey] = selectedExercises[dayKey];
        }
      }
      
      // Create the routine object
      const newRoutine = {
        name: routineName,
        objetivo: routineGoal,
        nivel: routineLevel,
        equipamiento: routineEquipment,
        dias: daysPerWeek,
        exercises: exercisesForDb,
        status: 'active'
      };
      
      // Save the routine
      const routinesResponse = await mysqlConnection.saveRoutine(adaptRoutine(newRoutine));
      
      if (routinesResponse) {
        toast({
          title: "Rutina creada",
          description: "La rutina semanal ha sido creada con éxito",
        });
        
        // Get user profile
        const userProfileResponse = await mysqlConnection.getUserProfile();
        if (userProfileResponse?.data?.email) {
          // Send notification email
          await mysqlConnection.sendEmail(
            userProfileResponse.data.email,
            "Nueva Rutina de Entrenamiento Creada",
            `
            <h2>¡Tu nueva rutina está lista!</h2>
            <p>Has creado una nueva rutina de entrenamiento: <strong>${routineName}</strong></p>
            <p>Objetivo: ${routineGoal || 'No especificado'}</p>
            <p>Nivel: ${routineLevel || 'No especificado'}</p>
            <p>Días por semana: ${daysPerWeek}</p>
            <p>Inicia sesión en la aplicación para ver todos los detalles.</p>
            `
          );
        }
        
        // Close dialog and reset form
        resetForm();
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear la rutina",
        });
      }
    } catch (error) {
      console.error("Error creating routine:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al crear la rutina",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const days = ['1', '2', '3', '4', '5', '6', '7'];
  const daysNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Crear Rutina Semanal
          </DialogTitle>
          <DialogDescription>
            Diseña una rutina de entrenamiento personalizada con los ejercicios seleccionados.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalles de la Rutina</TabsTrigger>
              <TabsTrigger value="exercises">Ejercicios por Día</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="p-6 space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="routineName">Nombre de la Rutina</Label>
                <Input
                  id="routineName"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="Mi Rutina Semanal"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="routineGoal">Objetivo</Label>
                <Select value={routineGoal} onValueChange={setRoutineGoal}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perdida_peso">Pérdida de Peso</SelectItem>
                    <SelectItem value="ganancia_musculo">Ganancia de Músculo</SelectItem>
                    <SelectItem value="resistencia">Resistencia</SelectItem>
                    <SelectItem value="fuerza">Fuerza</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="routineLevel">Nivel</Label>
                <Select value={routineLevel} onValueChange={setRoutineLevel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principiante">Principiante</SelectItem>
                    <SelectItem value="intermedio">Intermedio</SelectItem>
                    <SelectItem value="avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="routineEquipment">Equipamiento</Label>
                <Select value={routineEquipment} onValueChange={setRoutineEquipment}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Equipamiento disponible" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin_equipo">Sin Equipo</SelectItem>
                    <SelectItem value="basico">Básico (Mancuernas, Bandas)</SelectItem>
                    <SelectItem value="completo">Completo (Gimnasio en Casa)</SelectItem>
                    <SelectItem value="gimnasio">Gimnasio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="daysPerWeek">Días por Semana</Label>
                <Select 
                  value={daysPerWeek.toString()} 
                  onValueChange={(value) => setDaysPerWeek(parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona los días" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 día</SelectItem>
                    <SelectItem value="2">2 días</SelectItem>
                    <SelectItem value="3">3 días</SelectItem>
                    <SelectItem value="4">4 días</SelectItem>
                    <SelectItem value="5">5 días</SelectItem>
                    <SelectItem value="6">6 días</SelectItem>
                    <SelectItem value="7">7 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleDaySelection} className="gradient-btn">
                Continuar a Ejercicios
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="exercises" className="space-y-4">
            <div className="px-6 pb-4 border-b">
              <div className="flex flex-wrap gap-2 mb-4">
                {days.slice(0, daysPerWeek).map((day, index) => (
                  <Button 
                    key={day} 
                    variant={selectedExercises[day]?.length > 0 ? "default" : "outline"} 
                    className={`${selectedExercises[day]?.length > 0 ? "bg-green-600 hover:bg-green-700" : ""}`}
                    onClick={() => document.getElementById(`day-${day}`)?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {daysNames[index]} 
                    {selectedExercises[day]?.length > 0 && (
                      <span className="ml-2 bg-white text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {selectedExercises[day].length}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="px-6 space-y-8">
              {days.slice(0, daysPerWeek).map((day, index) => (
                <div key={day} id={`day-${day}`} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      Día {day}: {daysNames[index]}
                    </h3>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedExercises[day]?.map((exercise, idx) => (
                        <div key={`${exercise.id}-${idx}`} className="flex items-center bg-secondary/30 rounded-lg p-2">
                          <span className="mr-1">{exercise.emoji}</span>
                          <span className="text-sm">{exercise.name}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 ml-1"
                            onClick={() => removeExerciseFromDay(day, exercise.id)}
                          >
                            <CircleX className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {(!selectedExercises[day] || selectedExercises[day].length === 0) && (
                        <p className="text-sm text-muted-foreground italic">No hay ejercicios seleccionados para este día.</p>
                      )}
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Dumbbell className="h-4 w-4 mr-1" />
                        Añadir Ejercicios
                      </h4>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pb-2">
                        {exercises && exercises.length > 0 ? exercises.map((exercise) => (
                          <Button
                            key={exercise.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addExerciseToDay(day, exercise)}
                            className="flex items-center gap-1 text-xs"
                          >
                            <span>{exercise.emoji}</span>
                            <span>{exercise.name}</span>
                          </Button>
                        )) : (
                          <p className="text-sm text-muted-foreground italic">No hay ejercicios disponibles.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="p-6 border-t flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => activeTab === 'exercises' ? setActiveTab('details') : onClose()} className="sm:w-auto w-full">
            {activeTab === 'exercises' ? 'Volver a Detalles' : 'Cancelar'}
          </Button>
          
          <Button 
            onClick={handleCreateRoutine} 
            disabled={isCreating || !routineName} 
            className="gradient-btn sm:w-auto w-full"
          >
            {isCreating ? (
              <>Creando Rutina...</>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Crear Rutina
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWeeklyRoutineDialog;
