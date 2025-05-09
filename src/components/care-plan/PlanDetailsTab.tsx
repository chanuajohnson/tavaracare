
import { CarePlan } from "@/types/carePlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Info, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PlanDetailsTabProps {
  carePlan: CarePlan;
}

export function PlanDetailsTab({ carePlan }: PlanDetailsTabProps) {
  // Helper function to get a human-readable schedule description
  const getScheduleDescription = (schedule?: string): string => {
    switch(schedule) {
      case '8am-4pm':
        return 'Monday - Friday, 8 AM - 4 PM (Standard daytime coverage)';
      case '8am-6pm':
        return 'Monday - Friday, 8 AM - 6 PM (Extended evening coverage)';
      case '6am-6pm':
        return 'Monday - Friday, 6 AM - 6 PM (Full daytime coverage)';
      case '6pm-8am':
        return 'Monday - Friday, 6 PM - 8 AM (Overnight coverage)';
      case 'none':
        return 'No weekday coverage selected';
      default:
        return 'Custom schedule (see details)';
    }
  };

  // Helper function to get a human-readable weekend schedule description
  const getWeekendScheduleDescription = (coverage?: string, scheduleType?: string): string => {
    if (coverage !== 'yes') {
      return 'No weekend coverage';
    }
    
    // Handle specific weekend schedule types
    switch(scheduleType) {
      case '8am-6pm':
        return 'Saturday - Sunday, 8 AM - 6 PM (Standard weekend coverage)';
      case '6am-6pm':
        return 'Saturday - Sunday, 6 AM - 6 PM (Full daytime weekend coverage)';
      default:
        return 'Saturday - Sunday, 6 AM - 6 PM (Default weekend coverage)';
    }
  };

  const getPlanTypeBadge = (type?: string) => {
    switch(type) {
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled Care</Badge>;
      case 'on-demand':
        return <Badge className="bg-purple-500">On-Demand Care</Badge>;
      case 'both':
        return <Badge className="bg-teal-500">Scheduled + On-Demand</Badge>;
      default:
        return <Badge>Care Plan</Badge>;
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{carePlan.title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>Created {formatDistanceToNow(new Date(carePlan.createdAt), { addSuffix: true })}</span>
            {getPlanTypeBadge(carePlan.metadata?.planType)}
            <Badge variant={carePlan.status === 'active' ? 'default' : 'outline'}>
              {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Plan Description</h3>
              <p className="text-gray-600 mt-1">{carePlan.description || "No description provided."}</p>
            </div>
            
            {carePlan.metadata?.planType !== 'on-demand' && (
              <div className="grid gap-4">
                <h3 className="text-base font-semibold flex items-center">
                  <Clock className="mr-2 h-4 w-4" /> Schedule Information
                </h3>
                {carePlan.metadata?.weekdayCoverage && carePlan.metadata.weekdayCoverage !== 'none' && (
                  <Card className="bg-gray-50 border">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">Weekday Schedule:</h4>
                      <p className="text-gray-600 text-sm">
                        {getScheduleDescription(carePlan.metadata.weekdayCoverage)}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="bg-gray-50 border">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-1">Weekend Schedule:</h4>
                    <p className="text-gray-600 text-sm">
                      {getWeekendScheduleDescription(
                        carePlan.metadata?.weekendCoverage,
                        carePlan.metadata?.weekendScheduleType
                      )}
                    </p>
                  </CardContent>
                </Card>
                
                {carePlan.metadata?.customShifts && carePlan.metadata.customShifts.length > 0 && (
                  <Card className="bg-gray-50 border">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Custom Shifts:</h4>
                      <ul className="space-y-2 text-sm">
                        {carePlan.metadata.customShifts.map((shift, index) => (
                          <li key={index} className="border-b pb-2 last:border-0 last:pb-0">
                            <span className="font-medium">
                              {shift.days
                                .map(d => d.charAt(0).toUpperCase() + d.slice(1))
                                .join(', ')}
                            </span>
                            <span className="text-gray-600 ml-2">
                              {shift.startTime} - {shift.endTime}
                            </span>
                            {shift.title && (
                              <span className="block text-xs text-gray-500 mt-1">{shift.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Care Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-medium">Plan ID</h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">{carePlan.id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Last Updated</h3>
              <p className="text-sm text-gray-600 mt-1">
                {formatDistanceToNow(new Date(carePlan.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
