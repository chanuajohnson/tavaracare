
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlarmClock, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CareShift {
  id: string;
  title: string;
  description?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  caregiverId?: string;
}

interface ShiftsTabProps {
  shifts: CareShift[];
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

export function ShiftsTab({ shifts, formatDate, formatTime }: ShiftsTabProps) {
  const navigate = useNavigate();
  
  console.log("ShiftsTab rendering with shifts:", shifts);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Care Shifts</CardTitle>
        <CardDescription>
          Upcoming shifts for this care plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {shifts.length > 0 ? (
          <div className="space-y-4">
            {shifts.map((shift) => {
              // Handle both snake_case and camelCase field names
              const startTime = shift.startTime || shift.start_time;
              const endTime = shift.endTime || shift.end_time;
              
              if (!startTime || !endTime) {
                console.warn("Shift missing time data:", shift);
                return null;
              }

              return (
                <div key={shift.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{shift.title}</h3>
                      {shift.description && (
                        <p className="text-sm text-gray-600 mt-1">{shift.description}</p>
                      )}
                    </div>
                    <Badge className={`
                      ${shift.status === 'assigned' ? 'bg-green-100 text-green-800' :
                        shift.status === 'open' ? 'bg-amber-100 text-amber-800' :
                          shift.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'}
                    `}>
                      {shift.status === 'assigned' ? 'Assigned' :
                        shift.status === 'open' ? 'Open' :
                          shift.status === 'cancelled' ? 'Cancelled' :
                            shift.status || 'Scheduled'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <AlarmClock className="h-4 w-4 text-gray-500" />
                    <span>
                      {formatDate(startTime)}, {formatTime(startTime)} - {formatTime(endTime)}
                    </span>
                  </div>

                  {shift.caregiverId && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-green-600">
                        {shift.caregiverId ? 'Assigned' : 'Unassigned'}
                      </span>
                    </div>
                  )}

                  {shift.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{shift.location}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No upcoming shifts</h3>
            <p className="text-gray-500 mb-6">
              There are no shifts scheduled for this care plan yet
            </p>
            <Button variant="outline" onClick={() => navigate("/professional/schedule")}>
              View Full Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
