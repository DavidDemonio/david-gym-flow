
import { useState } from 'react';
import { Settings, Database, Plus, Dumbbell, Save, Activity } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { gymEquipment, exercises, equipmentCategories, muscleGroups } from '../data/equipmentData';

const Ajustes = () => {
  // Estados para manejar equipamiento
  const [newEquipment, setNewEquipment] = useState({
    id: '',
    name: '',
    emoji: '🏋️',
    category: '',
    description: '',
    muscleGroups: [] as string[],
    caloriesPerHour: 300
  });

  // Estados para manejar ejercicios
  const [newExercise, setNewExercise] = useState({
    id: '',
    name: '',
    emoji: '💪',
    equipment: [] as string[] | null,
    muscleGroups: [] as string[],
    difficulty: 'principiante' as 'principiante' | 'intermedio' | 'avanzado',
    description: '',
    requiresGym: true,
    caloriesPerRep: 5
  });

  // Estados para manejar la conexión a MySQL
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '3306',
    username: '',
    password: '',
    database: '',
    connected: false
  });

  // Gestión de grupos musculares seleccionados
  const toggleMuscleGroup = (muscleGroup: string, isEquipment: boolean) => {
    if (isEquipment) {
      setNewEquipment(prev => {
        const updatedGroups = prev.muscleGroups.includes(muscleGroup) 
          ? prev.muscleGroups.filter(group => group !== muscleGroup)
          : [...prev.muscleGroups, muscleGroup];
        return { ...prev, muscleGroups: updatedGroups };
      });
    } else {
      setNewExercise(prev => {
        const updatedGroups = prev.muscleGroups.includes(muscleGroup) 
          ? prev.muscleGroups.filter(group => group !== muscleGroup)
          : [...prev.muscleGroups, muscleGroup];
        return { ...prev, muscleGroups: updatedGroups };
      });
    }
  };

  // Gestión de equipos seleccionados para un ejercicio
  const toggleEquipment = (equipmentId: string) => {
    setNewExercise(prev => {
      if (!prev.equipment) {
        return { ...prev, equipment: [equipmentId] };
      }
      
      const updatedEquipment = prev.equipment.includes(equipmentId) 
        ? prev.equipment.filter(eq => eq !== equipmentId)
        : [...prev.equipment, equipmentId];
      return { ...prev, equipment: updatedEquipment };
    });
  };

  // Función para guardar un nuevo equipo
  const saveNewEquipment = () => {
    // Validación básica
    if (!newEquipment.id || !newEquipment.name || !newEquipment.category) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    // Aquí se implementaría la conexión con MySQL
    // Por ahora, simulamos el guardado
    console.log("Guardando equipo:", newEquipment);
    
    // En una aplicación real, aquí enviaríamos los datos a la BD
    if (dbConfig.connected) {
      // Simulación de éxito
      toast({
        title: "Equipo guardado",
        description: `"${newEquipment.name}" ha sido guardado en la base de datos.`,
      });

      // Reiniciar formulario
      setNewEquipment({
        id: '',
        name: '',
        emoji: '🏋️',
        category: '',
        description: '',
        muscleGroups: [],
        caloriesPerHour: 300
      });
    } else {
      toast({
        title: "Error de conexión",
        description: "No hay conexión a la base de datos. Configura la conexión primero.",
        variant: "destructive"
      });
    }
  };

  // Función para guardar un nuevo ejercicio
  const saveNewExercise = () => {
    // Validación básica
    if (!newExercise.id || !newExercise.name) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    // Aquí se implementaría la conexión con MySQL
    // Por ahora, simulamos el guardado
    console.log("Guardando ejercicio:", newExercise);
    
    // En una aplicación real, aquí enviaríamos los datos a la BD
    if (dbConfig.connected) {
      // Simulación de éxito
      toast({
        title: "Ejercicio guardado",
        description: `"${newExercise.name}" ha sido guardado en la base de datos.`,
      });

      // Reiniciar formulario
      setNewExercise({
        id: '',
        name: '',
        emoji: '💪',
        equipment: [],
        muscleGroups: [],
        difficulty: 'principiante',
        description: '',
        requiresGym: true,
        caloriesPerRep: 5
      });
    } else {
      toast({
        title: "Error de conexión",
        description: "No hay conexión a la base de datos. Configura la conexión primero.",
        variant: "destructive"
      });
    }
  };

  // Función para conectar a la base de datos
  const connectToDatabase = () => {
    // Validación básica
    if (!dbConfig.host || !dbConfig.username || !dbConfig.database) {
      toast({
        title: "Error de configuración",
        description: "Por favor completa todos los campos obligatorios de la conexión.",
        variant: "destructive"
      });
      return;
    }

    // Aquí se implementaría la conexión real con MySQL
    console.log("Conectando a la base de datos:", dbConfig);
    
    // Simulamos conexión exitosa para demostración
    setTimeout(() => {
      setDbConfig(prev => ({ ...prev, connected: true }));
      toast({
        title: "Conexión establecida",
        description: `Conectado a ${dbConfig.database} en ${dbConfig.host}`,
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold gradient-text flex items-center">
          <Settings className="mr-3 h-7 w-7" />
          Ajustes
        </h1>
        
        <div className="flex gap-2">
          <Badge 
            variant={dbConfig.connected ? "default" : "outline"} 
            className="px-3 py-1.5 text-sm flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {dbConfig.connected ? "Base de datos conectada" : "Base de datos desconectada"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de conexión a la base de datos */}
        <Card className="lg:col-span-3 border border-purple-100 dark:border-purple-900 neo-blur">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Conexión a MySQL
            </CardTitle>
            <CardDescription>
              Configura la conexión a tu base de datos MySQL para guardar tus máquinas y ejercicios personalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="host">Host</Label>
                <Input 
                  id="host" 
                  value={dbConfig.host} 
                  onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="localhost" 
                />
              </div>
              <div>
                <Label htmlFor="port">Puerto</Label>
                <Input 
                  id="port" 
                  value={dbConfig.port} 
                  onChange={(e) => setDbConfig(prev => ({ ...prev, port: e.target.value }))}
                  placeholder="3306" 
                />
              </div>
              <div>
                <Label htmlFor="database">Base de datos</Label>
                <Input 
                  id="database" 
                  value={dbConfig.database} 
                  onChange={(e) => setDbConfig(prev => ({ ...prev, database: e.target.value }))}
                  placeholder="gymflow" 
                />
              </div>
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input 
                  id="username" 
                  value={dbConfig.username} 
                  onChange={(e) => setDbConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="root" 
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={dbConfig.password} 
                  onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••" 
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={connectToDatabase}
                  className="w-full"
                  variant={dbConfig.connected ? "outline" : "default"}
                >
                  {dbConfig.connected ? "Reconectar" : "Conectar"} 
                  <Database className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="equipment" className="col-span-1 lg:col-span-3">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Añadir Máquinas
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Añadir Ejercicios
            </TabsTrigger>
          </TabsList>
          
          {/* Formulario para añadir nueva máquina */}
          <TabsContent value="equipment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-purple-100 dark:border-purple-900 neo-blur">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva Máquina
                  </CardTitle>
                  <CardDescription>
                    Añade una nueva máquina de gimnasio a tu colección personalizada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="equipment-id">ID (sin espacios)</Label>
                      <Input 
                        id="equipment-id" 
                        value={newEquipment.id} 
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                        placeholder="prensa-piernas" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment-name">Nombre</Label>
                      <Input 
                        id="equipment-name" 
                        value={newEquipment.name} 
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Prensa de Piernas" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="equipment-emoji">Emoji</Label>
                      <Input 
                        id="equipment-emoji" 
                        value={newEquipment.emoji} 
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, emoji: e.target.value }))}
                        placeholder="🏋️" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment-category">Categoría</Label>
                      <Select 
                        value={newEquipment.category}
                        onValueChange={(value) => setNewEquipment(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="equipment-category">
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="equipment-description">Descripción</Label>
                    <Textarea 
                      id="equipment-description" 
                      value={newEquipment.description} 
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe la máquina y su propósito" 
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="equipment-calories">Calorías por hora</Label>
                    <Input 
                      id="equipment-calories" 
                      type="number"
                      value={newEquipment.caloriesPerHour} 
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, caloriesPerHour: parseInt(e.target.value) || 0 }))}
                      placeholder="300" 
                    />
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Grupos musculares</Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <div className="flex flex-wrap gap-2 p-1">
                        {muscleGroups.map(group => (
                          <Badge 
                            key={group}
                            variant={newEquipment.muscleGroups.includes(group) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleMuscleGroup(group, true)}
                          >
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={saveNewEquipment} 
                    className="w-full"
                    disabled={!dbConfig.connected}
                  >
                    Guardar Máquina
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-6">
                <Card className="border border-purple-100 dark:border-purple-900 neo-blur">
                  <CardHeader>
                    <CardTitle>Máquinas existentes</CardTitle>
                    <CardDescription>
                      {gymEquipment.length} máquinas en la base de datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {gymEquipment.map(equipment => (
                          <div 
                            key={equipment.id} 
                            className="p-3 border rounded-lg flex items-center justify-between hover:bg-accent/50 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{equipment.emoji}</span>
                              <div>
                                <h4 className="font-medium">{equipment.name}</h4>
                                <p className="text-xs text-muted-foreground">{equipment.category}</p>
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Ver</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{equipment.name}</DialogTitle>
                                  <DialogDescription>Detalles de la máquina</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 py-4">
                                  <div>
                                    <h4 className="text-sm font-medium">Categoría</h4>
                                    <p>{equipment.category}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Descripción</h4>
                                    <p>{equipment.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Grupos musculares</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {equipment.muscleGroups.map(group => (
                                        <Badge key={group} variant="secondary">{group}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Calorías por hora</h4>
                                    <p>{equipment.caloriesPerHour}</p>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Cerrar</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Formulario para añadir nuevo ejercicio */}
          <TabsContent value="exercises">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-purple-100 dark:border-purple-900 neo-blur">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Nuevo Ejercicio
                  </CardTitle>
                  <CardDescription>
                    Añade un nuevo ejercicio personalizado a tu colección
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exercise-id">ID (sin espacios)</Label>
                      <Input 
                        id="exercise-id" 
                        value={newExercise.id} 
                        onChange={(e) => setNewExercise(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                        placeholder="press-banco" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="exercise-name">Nombre</Label>
                      <Input 
                        id="exercise-name" 
                        value={newExercise.name} 
                        onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Press de Banco" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exercise-emoji">Emoji</Label>
                      <Input 
                        id="exercise-emoji" 
                        value={newExercise.emoji} 
                        onChange={(e) => setNewExercise(prev => ({ ...prev, emoji: e.target.value }))}
                        placeholder="💪" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="exercise-difficulty">Dificultad</Label>
                      <Select 
                        value={newExercise.difficulty}
                        onValueChange={(value: 'principiante' | 'intermedio' | 'avanzado') => 
                          setNewExercise(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger id="exercise-difficulty">
                          <SelectValue placeholder="Selecciona dificultad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="principiante">Principiante</SelectItem>
                          <SelectItem value="intermedio">Intermedio</SelectItem>
                          <SelectItem value="avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="exercise-description">Descripción</Label>
                    <Textarea 
                      id="exercise-description" 
                      value={newExercise.description} 
                      onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe cómo realizar el ejercicio correctamente" 
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exercise-calories">Calorías por repetición</Label>
                      <Input 
                        id="exercise-calories" 
                        type="number"
                        value={newExercise.caloriesPerRep} 
                        onChange={(e) => setNewExercise(prev => ({ ...prev, caloriesPerRep: parseInt(e.target.value) || 0 }))}
                        placeholder="5" 
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <input
                        type="checkbox"
                        id="requires-gym"
                        checked={newExercise.requiresGym}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, requiresGym: e.target.checked }))}
                        className="rounded border-gray-300 h-4 w-4"
                      />
                      <Label htmlFor="requires-gym">Requiere gimnasio</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Grupos musculares</Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <div className="flex flex-wrap gap-2 p-1">
                        {muscleGroups.map(group => (
                          <Badge 
                            key={group}
                            variant={newExercise.muscleGroups.includes(group) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleMuscleGroup(group, false)}
                          >
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Equipamiento necesario</Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <div className="space-y-1">
                        {gymEquipment.map(equipment => (
                          <div 
                            key={equipment.id} 
                            className={`
                              p-2 rounded-md cursor-pointer flex items-center justify-between
                              ${newExercise.equipment?.includes(equipment.id) ? 'bg-primary/20' : 'hover:bg-accent/20'}
                            `}
                            onClick={() => toggleEquipment(equipment.id)}
                          >
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{equipment.emoji}</span>
                              <span>{equipment.name}</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {equipment.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={saveNewExercise} 
                    className="w-full"
                    disabled={!dbConfig.connected}
                  >
                    Guardar Ejercicio
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-6">
                <Card className="border border-purple-100 dark:border-purple-900 neo-blur">
                  <CardHeader>
                    <CardTitle>Ejercicios existentes</CardTitle>
                    <CardDescription>
                      {exercises.length} ejercicios en la base de datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {exercises.map(exercise => (
                          <div 
                            key={exercise.id} 
                            className="p-3 border rounded-lg flex items-center justify-between hover:bg-accent/50 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{exercise.emoji}</span>
                              <div>
                                <h4 className="font-medium">{exercise.name}</h4>
                                <p className="text-xs text-muted-foreground">{exercise.difficulty}</p>
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Ver</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{exercise.name}</DialogTitle>
                                  <DialogDescription>Detalles del ejercicio</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 py-4">
                                  <div>
                                    <h4 className="text-sm font-medium">Dificultad</h4>
                                    <p className="capitalize">{exercise.difficulty}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Descripción</h4>
                                    <p>{exercise.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Grupos musculares</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {exercise.muscleGroups.map(group => (
                                        <Badge key={group} variant="secondary">{group}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  {exercise.equipment && exercise.equipment.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium">Equipamiento</h4>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {exercise.equipment.map(eq => {
                                          const equipment = gymEquipment.find(e => e.id === eq);
                                          return equipment ? (
                                            <Badge key={eq} variant="outline">{equipment.name}</Badge>
                                          ) : null;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Cerrar</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Ajustes;
