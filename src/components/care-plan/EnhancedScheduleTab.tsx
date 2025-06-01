
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Pill } from "lucide-react";
import { ScheduleTab } from "./ScheduleTab";
import { MedicationScheduleView } from "../medication/MedicationScheduleView";
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";

interface EnhancedScheduleTabProps {
  carePlanId: string;
  familyId: string;
  careShifts: CareShift[];
  careTeamMembers: CareTeamMemberWithProfile[];
  onShiftUpdated: () => void;
  onDeleteShift: (shiftId: string) => void;
}

export const EnhancedScheduleTab: React.FC<EnhancedScheduleTabProps> = ({
  carePlanId,
  familyId,
  careShifts,
  careTeamMembers,
  onShiftUpdated,
  onDeleteShift
}) => {
  const [activeSubTab, setActiveSubTab] = useState("medications");

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="medications" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Medication Schedule
          </TabsTrigger>
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Care Shifts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medications" className="space-y-6">
          <MedicationScheduleView 
            carePlanId={carePlanId}
            onAdministrationUpdate={onShiftUpdated}
          />
        </TabsContent>

        <TabsContent value="shifts" className="space-y-6">
          <ScheduleTab
            carePlanId={carePlanId}
            familyId={familyId}
            careShifts={careShifts}
            careTeamMembers={careTeamMembers}
            onShiftUpdated={onShiftUpdated}
            onDeleteShift={onDeleteShift}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
