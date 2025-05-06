
import { useState } from 'react';
import { Search, Filter, Dumbbell, Calendar, ArrowDownUp } from 'lucide-react';
import { gymEquipment, exercises, muscleGroups, equipmentCategories, Exercise, Equipment } from '../data/equipmentData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import EquipmentCard from '../components/EquipmentCard';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseDetailDialog from '../components/ExerciseDetailDialog';
import CreateWeeklyRoutineDialog from '../components/CreateWeeklyRoutineDialog';

const MaquinasEjercicios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('ejercicios');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showRoutineDialog, setShowRoutineDialog] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  
  // Funciones de filtrado
  const filterEquipment = () => {
    let filtered = [...gymEquipment];
    
    if (searchTerm) {
      filtered = filtered.filter(eq => 
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(eq => 
        selectedCategories.includes(eq.category)
      );
    }
    
    if (selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(eq => 
        eq.muscleGroups.some(mg => selectedMuscleGroups.includes(mg))
      );
    }
    
    return filtered;
  };
  
  const filterExercises = () => {
    let filtered = [...exercises];
    
    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ex.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(ex => 
        ex.muscleGroups.some(mg => selectedMuscleGroups.includes(mg))
      );
    }
    
    return filtered;
  };
  
  // Manejo de filtros
  const toggleMuscleGroup = (muscleGroup: string) => {
    setSelectedMuscleGroups(prev => 
      prev.includes(muscleGroup)
        ? prev.filter(mg => mg !== muscleGroup)
        : [...prev, muscleGroup]
    );
  };
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Manejo de ejercicios seleccionados
  const handleAddToRoutine = (exercise: Exercise) => {
    if (!selectedExercises.find(ex => ex.id === exercise.id)) {
      setSelectedExercises(prev => [...prev, exercise]);
    }
  };
  
  const handleRemoveFromRoutine = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };
  
  // Renderizar listas filtradas
  const filteredEquipment = filterEquipment();
  const filteredExercises = filterExercises();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold gradient-text flex items-center">
          <Dumbbell className="mr-3 h-7 w-7" />
          Máquinas y Ejercicios
        </h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="text-sm flex items-center"
            onClick={() => setShowRoutineDialog(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Crear rutina semanal
          </Button>
          {selectedExercises.length > 0 && (
            <Badge className="bg-purple-100 text-purple-800 px-2 py-1">
              {selectedExercises.length} ejercicios seleccionados
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Buscar máquinas o ejercicios..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {(selectedMuscleGroups.length > 0 || selectedCategories.length > 0) && (
                <Badge className="ml-1 bg-purple-100 text-purple-800 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {selectedMuscleGroups.length + selectedCategories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Grupos musculares</h4>
                <ScrollArea className="h-32">
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map(group => (
                      <Badge 
                        key={group}
                        variant={selectedMuscleGroups.includes(group) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleMuscleGroup(group)}
                      >
                        {group}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {selectedTab === 'maquinas' && (
                <div>
                  <h4 className="font-medium mb-2">Categorías de equipamiento</h4>
                  <ScrollArea className="h-32">
                    <div className="flex flex-wrap gap-2">
                      {equipmentCategories.map(category => (
                        <Badge 
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedMuscleGroups([]);
                  setSelectedCategories([]);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="ejercicios" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Ejercicios ({filteredExercises.length})
          </TabsTrigger>
          <TabsTrigger value="maquinas" className="flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4" />
            Máquinas ({filteredEquipment.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ejercicios" className="mt-0">
          {filteredExercises.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-gray-600">No se encontraron ejercicios con los filtros actuales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map(exercise => (
                <ExerciseCard 
                  key={exercise.id}
                  exercise={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="maquinas" className="mt-0">
          {filteredEquipment.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-gray-600">No se encontraron máquinas con los filtros actuales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map(equipment => (
                <EquipmentCard 
                  key={equipment.id}
                  equipment={equipment}
                  onClick={() => setSelectedEquipment(equipment)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Diálogos */}
      <ExerciseDetailDialog 
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onAddToRoutine={handleAddToRoutine}
      />
      
      <CreateWeeklyRoutineDialog 
        exercises={selectedExercises.length > 0 ? selectedExercises : exercises}
        open={showRoutineDialog}
        onClose={() => setShowRoutineDialog(false)}
      />
    </div>
  );
};

export default MaquinasEjercicios;
