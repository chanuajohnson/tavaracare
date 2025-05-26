
import React from "react";
import { ProfessionalCalendar } from "./ProfessionalCalendar";

interface ProfessionalScheduleViewProps {
  carePlanId?: string;
  loading?: boolean;
}

export function ProfessionalScheduleView({ carePlanId, loading }: ProfessionalScheduleViewProps) {
  return (
    <div className="space-y-6">
      <ProfessionalCalendar 
        carePlanId={carePlanId} 
        loading={loading}
      />
    </div>
  );
}
