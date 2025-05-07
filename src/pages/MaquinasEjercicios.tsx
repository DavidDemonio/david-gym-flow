import { useState, useEffect } from 'react';
import { Search, Filter, Dumbbell, Calendar, ArrowDownUp, X } from 'lucide-react';
import { gymEquipment, exercises, muscleGroups, equipmentCategories } from '../data/equipmentData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '../hooks/use-mobile';
import { motion } from 'framer-motion';
import EquipmentCard from '../components/EquipmentCard';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseDetailDialog from '../components/ExerciseDetailDialog';
import CreateWeeklyRoutineDialog from '../components/CreateWeeklyRoutineDialog';

import {
  adaptExercise,
  adaptEquipment,
  convertMySQLToDataExercise,
  convertMySQLToDataEquipment,
  DataExercise,
  DataEquipment,
  ExerciseCardProps,
  EquipmentCardProps,
  CreateWeeklyRoutineDialogProps
} from '../utils/typeAdapter';

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const MaquinasEjercicios = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('ejercicios');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showRoutineDialog, setShowRoutineDialog] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Convert exercise data to our Exercise type with proper adaptation - ensure string IDs
  const adaptedExercises = (exercises as unknown as DataExercise[]).map(ex => {
    const adapted = adaptExercise(ex);
    adapted.id = String(adapted.id); // Ensure id is a string
    return adapted;
  });
  
  // Convert equipment data to our Equipment type with proper adaptation - ensure string IDs
  const adaptedEquipment = (gymEquipment as unknown as DataEquipment[]).map(eq => {
    const adapted = adaptEquipment(eq);
    adapted.id = String(adapted.id); // Ensure id is a string
    return adapted;
  });
  
  // Function to clear search when tab changes
  useEffect(() => {
    setSearchTerm('');
  }, [selectedTab]);
  
  // Filtering functions for adapted data
  const filterEquipment = () => {
    let filtered = [...adaptedEquipment];
    
    if (searchTerm) {
      filtered = filtered.filter(eq => 
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(eq => 
        eq.category && selectedCategories.includes(eq.category)
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
    let filtered = [...adaptedExercises];
    
    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ex.difficulty && ex.difficulty.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(ex => 
        ex.muscleGroups.some(mg => selectedMuscleGroups.includes(mg))
      );
    }
    
    return filtered;
  };
  
  // Filter management
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
  
  // Handle exercise selection for routines
  const handleAddToRoutine = (exercise: any) => {
    if (!selectedExercises.find(ex => ex.id === exercise.id)) {
      setSelectedExercises(prev => [...prev, exercise]);
    }
  };
  
  const handleRemoveFromRoutine = (exerciseId: string | number) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };
  
  // Get filtered data
  const filteredEquipment = filterEquipment();
  const filteredExercises = filterExercises();
  
  // Convert exercises to data format for compatible types
  const convertedExercises = filteredExercises.map(ex => convertMySQLToDataExercise(ex));
  const convertedEquipment = filteredEquipment.map(eq => convertMySQLToDataEquipment(eq));
  
  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent flex items-center">
          <Dumbbell className="mr-3 h-7 w-7 text-purple-500" />
          Máquinas y Ejercicios
        </h1>
        
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            className="text-sm flex items-center hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-300 transition-all"
            onClick={() => setShowRoutineDialog(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {isMobile ? "Crear rutina" : "Crear rutina semanal"}
          </Button>
          {selectedExercises.length > 0 && (
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-1 animate-pulse">
              {selectedExercises.length} seleccionados
            </Badge>
          )}
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder={isMobile ? "Buscar..." : "Buscar máquinas o ejercicios..." }
            className="pl-10 pr-4 focus-within:ring-2 focus-within:ring-purple-500 dark:focus-within:ring-purple-700 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-300 transition-all">
              <Filter className="h-4 w-4" />
              Filtros
              {(selectedMuscleGroups.length > 0 || selectedCategories.length > 0) && (
                <Badge className="ml-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {selectedMuscleGroups.length + selectedCategories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 bg-white dark:bg-gray-900/95 backdrop-blur-lg border border-purple-100 dark:border-purple-900/30 shadow-lg rounded-lg animate-in fade-in-80 zoom-in-95">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm text-gray-500 dark:text-gray-400">Grupos musculares</h4>
                <ScrollArea className="h-32 pr-4">
                  <div className="flex flex-wrap gap-1.5">
                    {muscleGroups.map(group => (
                      <Badge 
                        key={group}
                        variant={selectedMuscleGroups.includes(group) ? "default" : "outline"}
                        className={`cursor-pointer text-xs transition-all ${
                          selectedMuscleGroups.includes(group) 
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 dark:text-purple-300' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
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
                  <h4 className="font-medium mb-2 text-sm text-gray-500 dark:text-gray-400">Categorías de equipamiento</h4>
                  <ScrollArea className="h-32 pr-4">
                    <div className="flex flex-wrap gap-1.5">
                      {equipmentCategories.map(category => (
                        <Badge 
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className={`cursor-pointer text-xs transition-all ${
                            selectedCategories.includes(category) 
                              ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
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
                className="w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
                onClick={() => {
                  setSelectedMuscleGroups([]);
                  setSelectedCategories([]);
                }}
                disabled={selectedMuscleGroups.length === 0 && selectedCategories.length === 0}
              >
                Limpiar filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList className="grid grid-cols-2 mb-6 bg-gray-100/80 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden rounded-lg">
          <TabsTrigger 
            value="ejercicios" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm transition-all"
          >
            <Dumbbell className="h-4 w-4" />
            Ejercicios ({filteredExercises.length})
          </TabsTrigger>
          <TabsTrigger 
            value="maquinas" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm transition-all"
          >
            <ArrowDownUp className="h-4 w-4" />
            Máquinas ({filteredEquipment.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ejercicios" className="mt-0 focus-visible:outline-none">
          {filteredExercises.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-6 text-center rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50"
            >
              <p className="text-gray-600 dark:text-gray-400">No se encontraron ejercicios con los filtros actuales.</p>
              <Button className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white" onClick={() => {
                setSearchTerm('');
                setSelectedMuscleGroups([]);
                setSelectedCategories([]);
              }}>
                Limpiar filtros
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredExercises.map(exercise => (
                <motion.div key={exercise.id} variants={itemVariants}>
                  <ExerciseCard 
                    exercise={exercise}
                    onClick={() => setSelectedExercise(exercise)}
                    className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="maquinas" className="mt-0 focus-visible:outline-none">
          {filteredEquipment.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-6 text-center rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50"
            >
              <p className="text-gray-600 dark:text-gray-400">No se encontraron máquinas con los filtros actuales.</p>
              <Button className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white" onClick={() => {
                setSearchTerm('');
                setSelectedMuscleGroups([]);
                setSelectedCategories([]);
              }}>
                Limpiar filtros
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredEquipment.map(equipment => (
                <motion.div key={equipment.id} variants={itemVariants}>
                  <EquipmentCard 
                    equipment={equipment}
                    onClick={() => setSelectedEquipment(equipment)}
                    className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
      
      <ExerciseDetailDialog 
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onAddToRoutine={handleAddToRoutine}
      />
      
      <CreateWeeklyRoutineDialog 
        exercises={adaptedExercises} 
        open={showRoutineDialog}
        onClose={() => setShowRoutineDialog(false)}
      />
    </div>
  );
};

export default MaquinasEjercicios;
