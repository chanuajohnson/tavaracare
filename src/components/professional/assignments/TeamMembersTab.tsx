
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

interface TeamMember {
  id: string;
  caregiver_id: string;
  role?: string;
  profiles?: {
    full_name?: string | null;
    professional_type?: string | null;
    avatar_url?: string | null;
  };
}

interface TeamMembersTabProps {
  teamMembers: TeamMember[];
  currentUserId: string;
}

export function TeamMembersTab({ teamMembers, currentUserId }: TeamMembersTabProps) {
  const otherMembers = teamMembers.filter(member => member.caregiver_id !== currentUserId);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Team Members</CardTitle>
        <CardDescription>
          Other professionals involved in this care plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {otherMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherMembers.map((member) => (
              <div key={member.id} className="border rounded-md p-4 flex items-center gap-3">
                <div className="rounded-full bg-primary-50 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{member.profiles?.full_name || 'Team Member'}</p>
                  <p className="text-sm text-gray-600">{member.profiles?.professional_type || member.role}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No other team members</h3>
            <p className="text-gray-500">
              You're currently the only professional assigned to this care plan
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
