
import { Exercise } from "../data/equipmentData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

const difficultyColors = {
  principiante: "bg-green-50 text-green-700 border-green-200",
  intermedio: "bg-yellow-50 text-yellow-700 border-yellow-200",
  avanzado: "bg-red-50 text-red-700 border-red-200",
};

const ExerciseCard = ({ exercise, onClick }: ExerciseCardProps) => {
  return (
    <Card 
      className="h-full card-hover cursor-pointer border border-indigo-100 hover:border-indigo-300 transform transition-all hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <span className="text-2xl mr-2 animate-scale-in">{exercise.emoji}</span> 
            {exercise.name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={difficultyColors[exercise.difficulty]}
          >
            {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
          </Badge>
        </div>
        <CardDescription className="text-gray-600">
          {exercise.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.muscleGroups.map((group) => (
            <Badge key={group} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
              {group}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Badge className={exercise.requiresGym 
            ? "bg-purple-50 text-purple-700 border-purple-200" 
            : "bg-green-50 text-green-700 border-green-200"
          }>
            {exercise.requiresGym ? "🏋️ Requiere gimnasio" : "🏠 Se puede hacer en casa"}
          </Badge>
          
          <div className="text-sm text-green-600 flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            <span>{exercise.caloriesPerRep || "5-8"} kcal/rep</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
