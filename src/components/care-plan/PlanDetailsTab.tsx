import { CarePlan } from "@/types/carePlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Info, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PlanDetailsTabProps {
  carePlan: CarePlan;
}

export function PlanDetailsTab({ carePlan }: PlanDetailsTabProps) {
  // Normalize metadata fields to handle both camelCase and snake_case
  const metadata = {
    planType: carePlan.metadata?.plan_type || carePlan.metadata?.planType,
    weekdayCoverage: carePlan.metadata?.weekday_coverage || carePlan.metadata?.weekdayCoverage,
    weekendCoverage: carePlan.metadata?.weekend_coverage || carePlan.metadata?.weekendCoverage,
    weekendScheduleType:
      carePlan.metadata?.weekend_schedule_type || carePlan.metadata?.weekendScheduleType,
    customShifts:
      carePlan.metadata?.custom_shifts?.length > 0
        ? carePlan.metadata.custom_shifts
        : carePlan.metadata?.customShifts || [],
  };

  const getScheduleDescription = (schedule?: string): string => {
    switch (schedule) {
      case "8am-4pm":
        return "Monday - Friday, 8 AM - 4 PM";
      case "8am-6pm":
        return "Monday - Friday, 8 AM - 6 PM";
      case "6am-6pm":
        return "Monday - Friday, 6 AM - 6 PM";
      case "6pm-8am":
        return "Monday - Friday, 6 PM - 8 AM";
      case "none":
      case undefined:
        return "No weekday coverage";
      default:
        return "Custom weekday schedule";
    }
  };

  const getWeekendDescription = (type?: string): string => {
    switch (type) {
      case "8am-6pm":
        return "Saturday - Sunday, 8 AM - 6 PM";
      case "6am-6pm":
        return "Saturday - Sunday, 6 AM - 6 PM";
      case "none":
      case undefined:
        return "No weekend coverage";
      default:
        return "Custom weekend schedule";
    }
  };

  const getPlanTypeBadge = (type?: string) => {
    switch (type) {
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled Care</Badge>;
      case "on-demand":
        return <Badge className="bg-purple-500">On-Demand Care</Badge>;
      case "both":
        return <Badge className="bg-teal-500">Scheduled + On-Demand</Badge>;
      default:
        return <Badge>Care Plan</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500 mr-1" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />;
      default:
        return <Info className="h-4 w-4 text-gray-500 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{carePlan.title}</CardTitle>
            <div className="flex gap-2">
              {getPlanTypeBadge(metadata.planType)}
              <Badge variant={carePlan.status === "active" ? "default" : "outline"} className="flex items-center">
                {getStatusIcon(carePlan.status)}
                {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
              </Badge>
            </div>
          </div>
          <CardDescription>
            Created {formatDistanceToNow(new Date(carePlan.createdAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">Plan Description</h3>
              {carePlan.description ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 italic">"{carePlan.description}"</p>
                </div>
              ) : (
                <p className="text-gray-500">No description provided.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            Schedule Information
          </CardTitle>
          <CardDescription>Weekday and weekend coverage details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {metadata.weekdayCoverage && metadata.weekdayCoverage !== "none" && (
              <div className="bg-gray-50 border rounded-md p-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Weekday Schedule</h4>
                <p className="text-gray-600">{getScheduleDescription(metadata.weekdayCoverage)}</p>
              </div>
            )}

            {metadata.weekendCoverage === "yes" && (
              <div className="bg-gray-50 border rounded-md p-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Weekend Schedule</h4>
                <p className="text-gray-600">{getWeekendDescription(metadata.weekendScheduleType)}</p>
              </div>
            )}

            {metadata.customShifts.length > 0 && (
              <div className="bg-gray-50 border rounded-md p-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Custom Schedules</h4>
                <ul className="space-y-2 divide-y divide-gray-200">
                  {metadata.customShifts.map((shift: any, index: number) => (
                    <li key={index} className="pt-2 first:pt-0">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {Array.isArray(shift.days)
                              ? shift.days
                                  .map((d: string) => d.charAt(0).toUpperCase() + d.slice(1))
                                  .join(", ")
                              : "Custom days"}
                          </span>
                          {shift.startTime && shift.endTime && (
                            <span className="text-gray-600">
                              {shift.startTime} – {shift.endTime}
                            </span>
                          )}
                        </div>
                        {shift.title && (
                          <span className="text-xs text-gray-500 mt-1">{shift.title}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
/*
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
          
          //{carePlan.metadata?.planType !== 'on-demand' && (
          //  <div>
            //  <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekend Coverage</h3>
              //<p className="font-medium">{carePlan.metadata?.weekendCoverage === 'yes' ? "6AM-6PM" : "None"}</p>
            //</div>
         // )}*/
          {carePlan.metadata?.weekendCoverage === 'yes' && (
  <div className="bg-gray-50 border rounded-md p-4">
    <h4 className="font-medium text-sm text-gray-700 mb-2">Weekend Schedule</h4>
    <p className="text-gray-600">
      {getWeekendScheduleDescription(
        carePlan.metadata?.weekendCoverage,
        carePlan.metadata?.weekendScheduleType
      )}
    </p>
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
    </Card>*/
  );
};
