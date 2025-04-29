
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfessionalCalendar } from "@/components/professional/ProfessionalCalendar";

interface CalendarTabProps {
  loadingShifts: boolean;
  shifts: any[];
}

export function CalendarTab({ loadingShifts, shifts }: CalendarTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Calendar</CardTitle>
        <CardDescription>
          Your upcoming shifts and care appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingShifts ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <ProfessionalCalendar shifts={shifts} />
        )}
      </CardContent>
    </Card>
  );
}
