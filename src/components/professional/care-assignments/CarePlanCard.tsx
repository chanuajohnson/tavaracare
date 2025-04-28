
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { CarePlan } from "@/types/carePlan";

interface CarePlanCardProps {
  carePlan: CarePlan;
  isSelected: boolean;
  onSelect: () => void;
}

export const CarePlanCard: React.FC<CarePlanCardProps> = ({ 
  carePlan, 
  isSelected,
  onSelect 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`cursor-pointer transition-all ${
      isSelected ? 'border-primary shadow-md' : 'hover:border-primary/50'
    }`} onClick={onSelect}>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-lg truncate">{carePlan.title}</h3>
            <Badge className={getStatusColor(carePlan.status)}>
              {carePlan.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {carePlan.description || "No description available"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" className="text-xs">
          View Details
        </Button>
        {isSelected && (
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Check className="h-3 w-3 mr-1" /> Selected
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};
