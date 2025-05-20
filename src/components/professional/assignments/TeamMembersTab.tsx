
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CareTeamMembersTab } from '../CareTeamMembersTab';

interface TeamMembersTabProps {
  teamMembers: any[];
  loading?: boolean;
  carePlanId?: string;
  currentUserId?: string; // Added the currentUserId prop
}

export function TeamMembersTab({ teamMembers, loading = false, carePlanId, currentUserId }: TeamMembersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <CareTeamMembersTab 
          teamMembers={teamMembers.filter(member => 
            !carePlanId || member.carePlanId === carePlanId || member.care_plan_id === carePlanId
          )}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
