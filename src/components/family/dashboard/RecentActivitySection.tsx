
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CalendarCheck, FileText, Clock } from "lucide-react";

type ActivityItem = {
  id: string;
  type: 'care-plan' | 'report' | 'schedule';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
};

export const RecentActivitySection = () => {
  // Sample activity data - in a real implementation, this would come from an API or context
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'schedule',
      title: 'Morning Care Session',
      description: 'Care session scheduled with John Doe',
      date: '2 hours ago',
      icon: <Clock className="h-4 w-4 text-blue-500" />
    },
    {
      id: '2',
      type: 'report',
      title: 'Weekly Care Report',
      description: 'New care report available for review',
      date: 'Yesterday',
      icon: <FileText className="h-4 w-4 text-green-500" />
    },
    {
      id: '3',
      type: 'care-plan',
      title: 'Care Plan Updated',
      description: 'Updates to medication schedule',
      date: '3 days ago',
      icon: <CalendarCheck className="h-4 w-4 text-purple-500" />
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your care plans and meal activities</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex-shrink-0 mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-400">{activity.date}</p>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <button className="text-sm text-primary hover:underline">
                View all activity
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No recent activities</p>
        )}
      </CardContent>
    </Card>
  );
};
