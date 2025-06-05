
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CarePlanSelectorProps {
  carePlanAssignments: any[];
  selectedCarePlanId: string | null;
  onSelectCarePlan: (carePlanId: string) => void;
}

export const CarePlanSelector = ({ 
  carePlanAssignments, 
  selectedCarePlanId, 
  onSelectCarePlan 
}: CarePlanSelectorProps) => {
  if (carePlanAssignments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Care Plan</CardTitle>
        <CardDescription>Choose a care plan to manage its schedule, medications, and meal planning</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedCarePlanId || ''} onValueChange={onSelectCarePlan}>
          <SelectTrigger>
            <SelectValue placeholder="Select a care plan..." />
          </SelectTrigger>
          <SelectContent>
            {carePlanAssignments.map((assignment) => (
              <SelectItem key={assignment.id} value={assignment.carePlanId}>
                <div className="flex items-center gap-2">
                  <span>{assignment.carePlan?.title || 'Unnamed Care Plan'}</span>
                  <Badge variant="outline" className="text-xs">
                    {assignment.carePlan?.familyProfile?.fullName || 'Unknown Family'}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
