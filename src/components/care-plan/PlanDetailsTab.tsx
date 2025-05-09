
import { CarePlan } from "@/types/carePlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Info, Users, AlertCircle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

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

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500 mr-1" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />;
      default:
        return <Info className="h-4 w-4 text-gray-500 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{carePlan.title}</CardTitle>
            <div className="flex gap-2">
              {getPlanTypeBadge(carePlan.metadata?.planType)}
              <Badge variant={carePlan.status === 'active' ? 'default' : 'outline'} className="flex items-center">
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
              <h3 className="text-base font-medium mb-1">Plan Description</h3>
              <p className="text-gray-600">{carePlan.description || "No description provided."}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Schedule Information Card */}
      {carePlan.metadata?.planType !== 'on-demand' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Schedule Information
            </CardTitle>
            <CardDescription>Weekday and weekend coverage details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                {carePlan.metadata?.weekdayCoverage && carePlan.metadata.weekdayCoverage !== 'none' && (
                  <div className="bg-gray-50 border rounded-md p-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Weekday Schedule</h4>
                    <p className="text-gray-600">
                      {getScheduleDescription(carePlan.metadata.weekdayCoverage)}
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-50 border rounded-md p-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Weekend Schedule</h4>
                  <p className="text-gray-600">
                    {getWeekendScheduleDescription(
                      carePlan.metadata?.weekendCoverage,
                      carePlan.metadata?.weekendScheduleType
                    )}
                  </p>
                </div>
                
                {carePlan.metadata?.customShifts && carePlan.metadata.customShifts.length > 0 && (
                  <div className="bg-gray-50 border rounded-md p-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Custom Shifts</h4>
                    <ul className="space-y-2 divide-y divide-gray-200">
                      {carePlan.metadata.customShifts.map((shift, index) => (
                        <li key={index} className="pt-2 first:pt-0">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="font-medium">
                                {shift.days
                                  .map(d => d.charAt(0).toUpperCase() + d.slice(1))
                                  .join(', ')}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {shift.startTime} - {shift.endTime}
                              </span>
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
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Plan Metadata Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" /> 
            Plan Details
          </CardTitle>
          <CardDescription>Technical information about this care plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Plan ID</h4>
                <p className="text-xs text-gray-500 mt-1 font-mono">{carePlan.id}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Created</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(carePlan.createdAt).toLocaleDateString()} 
                  {" "}
                  {new Date(carePlan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Last Updated</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(carePlan.updatedAt).toLocaleDateString()}
                  {" "}
                  {new Date(carePlan.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Plan Type</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {carePlan.metadata?.planType ? carePlan.metadata.planType.charAt(0).toUpperCase() + carePlan.metadata.planType.slice(1) : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
