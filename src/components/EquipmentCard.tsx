
import { Equipment } from "../data/equipmentData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface EquipmentCardProps {
  equipment: Equipment;
  onClick: () => void;
}

const EquipmentCard = ({ equipment, onClick }: EquipmentCardProps) => {
  return (
    <Card 
      className="h-full card-hover cursor-pointer border border-purple-100 hover:border-purple-300 transform transition-all hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <span className="text-2xl mr-2 animate-scale-in">{equipment.emoji}</span> 
            {equipment.name}
          </CardTitle>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {equipment.category}
          </Badge>
        </div>
        <CardDescription className="text-gray-600">
          {equipment.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-2">
          {equipment.muscleGroups.map((group) => (
            <Badge key={group} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
              {group}
            </Badge>
          ))}
        </div>
        <div className="text-sm text-green-600 flex items-center mt-2">
          <Activity className="h-4 w-4 mr-1" />
          <span>Est. quema: {equipment.caloriesPerHour || "250-350"} kcal/hora</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
