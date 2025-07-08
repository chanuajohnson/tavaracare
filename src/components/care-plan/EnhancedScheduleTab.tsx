
import React from 'react';
import { ScheduleTab } from './ScheduleTab';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";

interface EnhancedScheduleTabProps {
  carePlanId: string;
  carePlanTitle: string;
  familyId: string;
  careShifts: CareShift[];
  careTeamMembers: CareTeamMemberWithProfile[];
  onShiftUpdated: () => void;
  onDeleteShift: (shiftId: string) => void;
}

export const EnhancedScheduleTab: React.FC<EnhancedScheduleTabProps> = (props) => {
  return <ScheduleTab {...props} />;
};
