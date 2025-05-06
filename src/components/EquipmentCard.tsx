
import { Equipment } from "../data/equipmentData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EquipmentCardProps {
  equipment: Equipment;
  onClick: () => void;
}

const EquipmentCard = ({ equipment, onClick }: EquipmentCardProps) => {
  return (
    <Card 
      className="h-full card-hover cursor-pointer border border-purple-100 hover:border-purple-300"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <span className="text-2xl mr-2">{equipment.emoji}</span> 
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
        <div className="flex flex-wrap gap-1">
          {equipment.muscleGroups.map((group) => (
            <Badge key={group} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
              {group}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
