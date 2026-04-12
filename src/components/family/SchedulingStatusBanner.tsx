import { Calendar, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SchedulingStatusBannerProps {
  hasMatches: boolean;
  visitDetails: any;
  onScheduleClick: () => void;
  hasCaregiverAssigned?: boolean;
}

export function SchedulingStatusBanner({ hasMatches, visitDetails, onScheduleClick, hasCaregiverAssigned }: SchedulingStatusBannerProps) {
  if (!hasMatches || hasCaregiverAssigned) return null;

  const isScheduled = visitDetails && visitDetails.status !== 'cancelled';

  // Green confirmation banner when visit is scheduled
  if (isScheduled) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="flex items-center gap-4 py-4 px-5">
          <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-green-800 text-base">
              ✅ Care Visit Scheduled
            </h3>
            <p className="text-sm text-green-700 mt-0.5">
              Your care visit is confirmed. We'll assign your best-matched caregiver and send you the details shortly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Amber action banner when scheduling is the next step
  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5 px-5">
        <div className="flex-shrink-0 p-2.5 bg-amber-100 rounded-full">
          <Calendar className="h-7 w-7 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-amber-900 text-lg">
            📅 Next Step: Schedule Your Care
          </h3>
          <p className="text-sm text-amber-800 mt-1">
            You have matched caregivers ready! Schedule a visit with our care coordinators to get started.
          </p>
        </div>
        <Button
          onClick={onScheduleClick}
          className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg whitespace-nowrap"
          size="lg"
        >
          Get Started with Care
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
