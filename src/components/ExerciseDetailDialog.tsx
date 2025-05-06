
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Exercise, gymEquipment } from "../data/equipmentData";
import { Dumbbell, Check } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface ExerciseDetailDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onAddToRoutine: (exercise: Exercise) => void;
}

export function ExerciseDetailDialog({ 
  exercise, 
  open, 
  onClose, 
  onAddToRoutine 
}: ExerciseDetailDialogProps) {
  const { toast } = useToast();

  if (!exercise) return null;

  const handleAddToRoutine = () => {
    onAddToRoutine(exercise);
    toast({
      title: "Ejercicio añadido",
      description: `${exercise.name} ha sido añadido a tu rutina`,
      action: <Check className="h-4 w-4 text-green-500" />,
    });
  };

  const getEquipmentNames = () => {
    if (!exercise.equipment) return "Sin equipamiento";
    return exercise.equipment.map(eqId => {
      const eq = gymEquipment.find(e => e.id === eqId);
      return eq ? eq.name : eqId;
    }).join(", ");
  };

  const difficultyColors = {
    principiante: "bg-green-100 text-green-800",
    intermedio: "bg-yellow-100 text-yellow-800",
    avanzado: "bg-red-100 text-red-800",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <span className="text-3xl mr-2">{exercise.emoji}</span>
            {exercise.name}
          </DialogTitle>
          <DialogDescription className="pt-2">
            <Badge 
              className={`${difficultyColors[exercise.difficulty]} mr-2`}
            >
              {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
            </Badge>
            <Badge className={exercise.requiresGym 
              ? "bg-purple-100 text-purple-800" 
              : "bg-green-100 text-green-800"
            }>
              {exercise.requiresGym ? "🏋️ Requiere gimnasio" : "🏠 Se puede hacer en casa"}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-medium mb-1 text-gray-700">Descripción</h3>
            <p>{exercise.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <h3 className="font-medium mb-1 text-gray-700">Grupos musculares</h3>
              <div className="flex flex-wrap gap-1">
                {exercise.muscleGroups.map((group) => (
                  <Badge key={group} variant="secondary" className="bg-blue-50 text-blue-700">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="glass-card p-4 rounded-lg">
              <h3 className="font-medium mb-1 text-gray-700">Equipamiento</h3>
              <p>{getEquipmentNames()}</p>
            </div>
          </div>
          
          {exercise.videoUrl && (
            <div className="glass-card p-4 rounded-lg">
              <h3 className="font-medium mb-1 text-gray-700">Video demostrativo</h3>
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Video no disponible en vista previa</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button 
            onClick={handleAddToRoutine}
            className="gradient-btn"
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            Añadir a mi rutina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExerciseDetailDialog;
