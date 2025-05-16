
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Calendar, Users, Pill } from "lucide-react";
import { CareDetailsTab } from "./CareDetailsTab";
import { ShiftsTab } from "./ShiftsTab";
import { TeamMembersTab } from "./TeamMembersTab";
import { MedicationsTab } from "./MedicationsTab";

interface AssignmentTabsProps {
  carePlan: any;
  shifts: any[];
  teamMembers: any[];
  userId: string;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

export function AssignmentTabs({ 
  carePlan,
  shifts,
  teamMembers,
  userId,
  formatDate,
  formatTime
}: AssignmentTabsProps) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full justify-start mb-6">
        <TabsTrigger value="details" className="flex items-center gap-1">
          <ClipboardList className="h-4 w-4" />
          <span>Care Details</span>
        </TabsTrigger>
        <TabsTrigger value="shifts" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Upcoming Shifts</span>
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>Care Team</span>
        </TabsTrigger>
        <TabsTrigger value="medications" className="flex items-center gap-1">
          <Pill className="h-4 w-4" />
          <span>Medications</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <CareDetailsTab carePlan={carePlan} formatDate={formatDate} />
      </TabsContent>

      <TabsContent value="shifts" className="space-y-4">
        <ShiftsTab shifts={shifts} formatDate={formatDate} formatTime={formatTime} />
      </TabsContent>

      <TabsContent value="team" className="space-y-4">
        <TeamMembersTab 
          teamMembers={teamMembers} 
          carePlanId={carePlan?.id}
          currentUserId={userId} 
        />
      </TabsContent>

      <TabsContent value="medications" className="space-y-4">
        <MedicationsTab 
          carePlanId={carePlan?.id}
          userId={userId}
        />
      </TabsContent>
    </Tabs>
  );
}
