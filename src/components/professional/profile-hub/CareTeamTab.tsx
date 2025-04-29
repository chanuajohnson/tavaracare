
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { CareTeamMembersTab } from "@/components/professional/CareTeamMembersTab";

interface CareTeamTabProps {
  loadingCareTeamMembers: boolean;
  careTeamMembers: any[];
}

export function CareTeamTab({ loadingCareTeamMembers, careTeamMembers }: CareTeamTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Teams</CardTitle>
        <CardDescription>
          Other professionals you're working with on care plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingCareTeamMembers ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : careTeamMembers.length > 0 ? (
          <CareTeamMembersTab teamMembers={careTeamMembers} loading={loadingCareTeamMembers} />
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No care teams yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You're not part of any care teams yet. 
              Team members will appear here once you're assigned to shared care plans.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
