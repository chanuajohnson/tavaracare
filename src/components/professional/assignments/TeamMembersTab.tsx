
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  status: string;
  role?: string;
  caregiver_id: string;
  profiles?: {
    full_name?: string;
    professional_type?: string;
    avatar_url?: string;
  };
}

interface TeamMembersTabProps {
  teamMembers: TeamMember[];
  loading?: boolean;
  carePlanId?: string;
  currentUserId?: string;
}

export function TeamMembersTab({ teamMembers, loading = false, carePlanId, currentUserId }: TeamMembersTabProps) {
  // Filter team members if carePlanId is provided
  const filteredMembers = carePlanId 
    ? teamMembers.filter(member => 
        member.carePlanId === carePlanId || member.care_plan_id === carePlanId
      )
    : teamMembers;
  
  const getInitials = (name?: string): string => {
    if (!name) return "TM";
    
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profiles?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.profiles?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.full_name || 'Team Member'}
                      {member.caregiver_id === currentUserId && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.role ? 
                        member.role.charAt(0).toUpperCase() + member.role.slice(1) : 
                        member.profiles?.professional_type || 'Caregiver'}
                    </p>
                  </div>
                </div>
                
                <Badge
                  className={
                    member.status === 'active' ? 'bg-green-100 text-green-800' :
                    member.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {member.status?.charAt(0).toUpperCase() + member.status?.slice(1) || 'Unknown'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No team members have been assigned to this care plan yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
