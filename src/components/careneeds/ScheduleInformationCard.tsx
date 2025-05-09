
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScheduleInformationCardProps {
  careSchedule?: string;
  weekendCoverage?: boolean;
}

const ScheduleInformationCard: React.FC<ScheduleInformationCardProps> = ({ 
  careSchedule, 
  weekendCoverage 
}) => {
  // Helper function to get a human-readable schedule description
  const getScheduleDescription = (schedule: string | undefined): string => {
    switch(schedule) {
      case '8am-4pm':
        return 'Monday - Friday, 8 AM - 4 PM (Standard daytime coverage)';
      case '8am-6pm':
        return 'Monday - Friday, 8 AM - 6 PM (Extended daytime coverage)';
      case '6am-6pm':
        return 'Monday - Friday, 6 AM - 6 PM (Full daytime coverage)';
      case '6pm-8am':
        return 'Monday - Friday, 6 PM - 8 AM (Overnight coverage)';
      default:
        return 'No specific schedule selected';
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
            {weekendCoverage ? 'Saturday - Sunday, 6 AM - 6 PM' : 'No weekend coverage selected'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleInformationCard;
