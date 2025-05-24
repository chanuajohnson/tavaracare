
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CareTeamMembersTab } from '../CareTeamMembersTab';

interface TeamMembersTabProps {
  teamMembers: any[];
  loading?: boolean;
  carePlanId?: string;
  currentUserId?: string;
}

export function TeamMembersTab({ teamMembers, loading = false, carePlanId, currentUserId }: TeamMembersTabProps) {
  console.log("TeamMembersTab rendering with:", { 
    teamMembersCount: teamMembers.length, 
    carePlanId: carePlanId,
    currentUserId: currentUserId,
    teamMembers: teamMembers
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <CareTeamMembersTab 
          teamMembers={teamMembers}
          loading={loading}
          currentUserId={currentUserId}
        />
      </CardContent>
    </Card>
  );
}
