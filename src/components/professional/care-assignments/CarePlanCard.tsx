
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  // Get badge color based on status
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-colors hover:bg-muted/60 ${
        isSelected ? 'bg-primary-100 border-primary' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{carePlan.title}</h3>
        <Badge variant="outline" className={getBadgeColor(carePlan.status)}>
          {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
        {carePlan.description || 'No description provided'}
      </p>
      
      <div className="mt-4 text-xs text-muted-foreground">
        Created: {formatDate(carePlan.createdAt)}
      </div>
    </Card>
  );
};
