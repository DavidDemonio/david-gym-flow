
import { Equipment } from "../data/equipmentData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, BarChart3, Weight, MoveHorizontal, ArrowDownUp, Infinity, Bike, ChevronUp, ChevronDown } from "lucide-react";

interface EquipmentCardProps {
  equipment: Equipment;
  onClick: () => void;
}

// Map equipment IDs to appropriate icons
const equipmentIcons = {
  "press-banca": <Weight className="h-7 w-7" />,
  "smith-machine": <ArrowDownUp className="h-7 w-7" />,
  "prensa-piernas": <ChevronDown className="h-7 w-7" />,
  "polea-alta": <ChevronDown className="h-7 w-7" />,
  "polea-baja": <ChevronUp className="h-7 w-7" />,
  "extension-pierna": <Dumbbell className="h-7 w-7 transform rotate-90" />,
  "curl-femoral": <Dumbbell className="h-7 w-7 transform rotate-180" />,
  "aductor": <MoveHorizontal className="h-7 w-7" />,
  "abductor": <MoveHorizontal className="h-7 w-7 transform rotate-180" />,
  "press-hombro": <Weight className="h-7 w-7 transform rotate-90" />,
  "press-pecho": <Weight className="h-7 w-7" />,
  "remo-sentado": <ChevronUp className="h-7 w-7 transform -rotate-45" />,
  "maquina-dominadas": <ChevronUp className="h-7 w-7" />,
  "barra-dominadas": <Infinity className="h-7 w-7 transform rotate-90" />,
  "barra-paralelas": <Infinity className="h-7 w-7" />
};

const EquipmentCard = ({ equipment, onClick }: EquipmentCardProps) => {
  // Get the appropriate icon or use a default
  const equipmentIcon = equipment.id in equipmentIcons 
    ? equipmentIcons[equipment.id as keyof typeof equipmentIcons]
    : <Dumbbell className="h-7 w-7" />;

  return (
    <Card 
      className="h-full card-hover cursor-pointer border border-purple-100 hover:border-purple-300 transform transition-all hover:-translate-y-1 hover:shadow-lg dark:border-purple-900 dark:hover:border-purple-700 dark:bg-gray-800/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <div className="mr-3 p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              {equipmentIcon}
            </div>
            {equipment.name}
          </CardTitle>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
            {equipment.category}
          </Badge>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {equipment.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-2">
          {equipment.muscleGroups.map((group) => (
            <Badge key={group} variant="secondary" className="bg-blue-50 text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-300">
              {group}
            </Badge>
          ))}
        </div>
        <div className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
          <Activity className="h-4 w-4 mr-1" />
          <span>Est. quema: {equipment.caloriesPerHour || "250-350"} kcal/hora</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
