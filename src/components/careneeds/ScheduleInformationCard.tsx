
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the valid care schedule types
type CareScheduleType = "8am-4pm" | "8am-6pm" | "6am-6pm" | "6pm-8am" | "none";

// Define the valid weekend schedule types
type WeekendScheduleType = "8am-6pm" | "6am-6pm" | "none";

interface ScheduleInformationCardProps {
  careSchedule?: CareScheduleType;
  weekendCoverage?: WeekendScheduleType | boolean; // Support both boolean for backward compatibility and specific types
}

const ScheduleInformationCard: React.FC<ScheduleInformationCardProps> = ({ 
  careSchedule, 
  weekendCoverage 
}) => {
  console.log("ScheduleInformationCard props:", { careSchedule, weekendCoverage });
  
  // Helper function to get a human-readable schedule description
  const getScheduleDescription = (schedule: CareScheduleType | undefined): string => {
    switch(schedule) {
      case '8am-4pm':
        return 'Monday - Friday, 8 AM - 4 PM (Standard daytime coverage)';
      case '8am-6pm':
        return 'Monday - Friday, 8 AM - 6 PM (Extended evening coverage)';
      case '6am-6pm':
        return 'Monday - Friday, 6 AM - 6 PM (Full daytime coverage)';
      case '6pm-8am':
        return 'Monday - Friday, 6 PM - 8 AM (Overnight coverage)';
      default:
        return 'No specific schedule selected';
    }
  };

  // Helper function to get a human-readable weekend schedule description
  const getWeekendScheduleDescription = (schedule: WeekendScheduleType | boolean | undefined): string => {
    console.log("Getting weekend schedule description for:", schedule);
    
    // Handle boolean for backward compatibility
    if (typeof schedule === 'boolean') {
      return schedule ? 'Saturday - Sunday, 6 AM - 6 PM (Daytime weekend coverage)' : 'No weekend coverage selected';
    }
    
    // Handle specific weekend schedule types
    switch(schedule) {
      case '8am-6pm':
        return 'Saturday - Sunday, 8 AM - 6 PM (Daytime weekend coverage)';
      case '6am-6pm':
        return 'Saturday - Sunday, 6 AM - 6 PM (Full daytime weekend coverage)';
      case 'none':
        return 'No weekend coverage selected';
      default:
        return 'No specific weekend schedule selected';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Care Schedule Preferences
        </CardTitle>
        <CardDescription>
          Your schedule preferences from registration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These schedule preferences will be used to create your care plan. 
            You can customize your schedule further after the care plan is created.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Weekday Coverage:</h4>
          <p className="text-sm rounded-md bg-gray-50 p-3 border">
            {getScheduleDescription(careSchedule)}
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Weekend Coverage:</h4>
          <p className="text-sm rounded-md bg-gray-50 p-3 border">
            {getWeekendScheduleDescription(weekendCoverage)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleInformationCard;
