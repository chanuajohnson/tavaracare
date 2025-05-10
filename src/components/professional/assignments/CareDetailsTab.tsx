
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CarePlan {
  created_at?: string;
  description?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

interface CareDetailsTabProps {
  carePlan?: CarePlan;
  formatDate: (dateString: string) => string;
}

export function CareDetailsTab({ carePlan, formatDate }: CareDetailsTabProps) {
  // Helper function to get a human-readable schedule description
  const getScheduleDescription = (schedule?: string): string => {
    switch(schedule) {
      case '8am-4pm':
        return 'Monday - Friday, 8 AM - 4 PM (Standard)';
      case '8am-6pm':
        return 'Monday - Friday, 8 AM - 6 PM (Extended)';
      case '6am-6pm':
        return 'Monday - Friday, 6 AM - 6 PM (Full day)';
      case '6pm-8am':
        return 'Monday - Friday, 6 PM - 8 AM (Overnight)';
      case 'none':
      default:
        return 'Not specified';
    }
  };

  // Helper function to get a human-readable weekend schedule description
  const getWeekendDescription = (coverage?: string, scheduleType?: string): string => {
    if (coverage !== 'yes') {
      return 'No weekend coverage';
    }
    
    switch(scheduleType) {
      case '8am-6pm':
        return 'Saturday - Sunday, 8 AM - 6 PM';
      case '6am-6pm':
        return 'Saturday - Sunday, 6 AM - 6 PM';
      default:
        return 'Weekend coverage (details not specified)';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Plan Details</CardTitle>
        {carePlan?.created_at && (
          <CardDescription>
            Created on {formatDate(carePlan.created_at)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {carePlan?.description ? (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600">{carePlan.description}</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No detailed description available</p>
          </div>
        )}

        {carePlan?.metadata && (
          <div>
            <h3 className="font-medium mb-2">Care Requirements</h3>
            
            {/* If planType exists, show it in a nicely formatted way */}
            {carePlan.metadata.planType && (
              <div className="mb-3 border rounded-md p-3 bg-gray-50">
                <p className="text-sm font-medium">Plan Type</p>
                <p className="text-sm text-gray-600 capitalize">
                  {carePlan.metadata.planType === 'both' 
                    ? 'Both Scheduled & On-Demand' 
                    : carePlan.metadata.planType === 'scheduled'
                      ? 'Scheduled Care'
                      : 'On-Demand Care'
                  }
                </p>
              </div>
            )}
            
            {/* Group schedule information together if scheduled care */}
            {(carePlan.metadata.planType === 'scheduled' || carePlan.metadata.planType === 'both') && (
              <div className="mb-3 border rounded-md divide-y">
                {/* Weekday schedule */}
                {carePlan.metadata.weekdayCoverage && carePlan.metadata.weekdayCoverage !== 'none' && (
                  <div className="p-3 bg-gray-50">
                    <p className="text-sm font-medium">Weekday Schedule</p>
                    <p className="text-sm text-gray-600">
                      {getScheduleDescription(carePlan.metadata.weekdayCoverage)}
                    </p>
                  </div>
                )}
                
                {/* Only show weekend schedule when it's enabled */}
                {carePlan.metadata.weekendCoverage === 'yes' && (
                  <div className="p-3 bg-gray-50">
                    <p className="text-sm font-medium">Weekend Schedule</p>
                    <p className="text-sm text-gray-600">
                      {getWeekendDescription(
                        carePlan.metadata.weekendCoverage, 
                        carePlan.metadata.weekendScheduleType
                      )}
                    </p>
                  </div>
                )}
                
                {/* Custom shifts if available */}
                {carePlan.metadata.customShifts && carePlan.metadata.customShifts.length > 0 && (
                  <div className="p-3 bg-gray-50">
                    <p className="text-sm font-medium">Custom Schedules</p>
                    <ul className="text-sm text-gray-600 space-y-1 mt-1">
                      {carePlan.metadata.customShifts.map((shift: any, index: number) => (
                        <li key={index}>
                          {shift.title || `Custom schedule ${index + 1}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Display other metadata fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(carePlan.metadata)
                .filter(([key]) => 
                  !['planType', 'weekdayCoverage', 'weekendCoverage', 'weekendScheduleType', 'customShifts'].includes(key)
                )
                .map(([key, value]) => (
                  <div key={key} className="border rounded-md p-3 bg-gray-50">
                    <p className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-600">{String(value)}</p>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
