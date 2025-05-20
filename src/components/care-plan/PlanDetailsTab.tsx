
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { CarePlan } from "@/types/carePlan";
import { useNavigate } from "react-router-dom";

interface PlanDetailsTabProps {
  carePlan: CarePlan;
}

export const PlanDetailsTab: React.FC<PlanDetailsTabProps> = ({ carePlan }) => {
  const navigate = useNavigate();
  
  const getPlanTypeDisplay = (plan: CarePlan) => {
    if (!plan.metadata?.planType) return "Not specified";
    
    switch (plan.metadata.planType) {
      case 'scheduled':
        return "Scheduled Care";
      case 'on-demand':
        return "On-demand Care";
      case 'both':
        return "Scheduled & On-demand";
      default:
        return "Not specified";
    }
  };

  const handleEdit = () => {
    navigate(`/family/care-management/create/${carePlan.id}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Care Plan Details</CardTitle>
          <CardDescription>
            Information about this care plan
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Plan Type</h3>
            <p className="font-medium">{getPlanTypeDisplay(carePlan)}</p>
          </div>
          
          {carePlan.metadata?.planType !== 'on-demand' && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekday Coverage</h3>
              <p className="font-medium">{carePlan.metadata?.weekdayCoverage || "None"}</p>
            </div>
          )}
          
          {carePlan.metadata?.planType !== 'on-demand' && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekend Coverage</h3>
              <p className="font-medium">{carePlan.metadata?.weekendCoverage === 'yes' ? "6AM-6PM" : "None"}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Created On</h3>
            <p className="font-medium">{new Date(carePlan.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Updated</h3>
            <p className="font-medium">{new Date(carePlan.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {carePlan.metadata?.additionalShifts && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Shifts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {carePlan.metadata.additionalShifts.weekdayEvening4pmTo6am && (
                <Badge variant="outline" className="justify-start">Weekday Evening (4PM-6AM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekdayEvening4pmTo8am && (
                <Badge variant="outline" className="justify-start">Weekday Evening (4PM-8AM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekdayEvening6pmTo6am && (
                <Badge variant="outline" className="justify-start">Weekday Evening (6PM-6AM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekdayEvening6pmTo8am && (
                <Badge variant="outline" className="justify-start">Weekday Evening (6PM-8AM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekday8amTo4pm && (
                <Badge variant="outline" className="justify-start">Weekday (8AM-4PM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekday8amTo6pm && (
                <Badge variant="outline" className="justify-start">Weekday (8AM-6PM)</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
