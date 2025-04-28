
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CareTeamMemberWithProfile } from "@/types/careTypes";

interface CareTeamMembersViewProps {
  careTeamMembers: CareTeamMemberWithProfile[];
  selectedPlanId: string | null;
}

export const CareTeamMembersView: React.FC<CareTeamMembersViewProps> = ({ 
  careTeamMembers, 
  selectedPlanId 
}) => {
  const [filteredMembers, setFilteredMembers] = useState<CareTeamMemberWithProfile[]>([]);

  useEffect(() => {
    if (selectedPlanId) {
      setFilteredMembers(careTeamMembers.filter(member => member.carePlanId === selectedPlanId));
    } else {
      setFilteredMembers(careTeamMembers);
    }
  }, [careTeamMembers, selectedPlanId]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'caregiver':
        return 'bg-blue-100 text-blue-800';
      case 'nurse':
        return 'bg-green-100 text-green-800';
      case 'therapist':
        return 'bg-purple-100 text-purple-800';
      case 'doctor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'removed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!filteredMembers.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Team Members</CardTitle>
          <CardDescription>
            {selectedPlanId 
              ? "No team members found for this care plan" 
              : "Select a care plan to view team members"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Team Members</CardTitle>
        <CardDescription>
          {selectedPlanId 
            ? `Viewing team members for the selected care plan` 
            : `Viewing all team members across care plans`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-md bg-muted/40">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage 
                    src={member.professionalDetails?.avatar_url || ''} 
                    alt={member.professionalDetails?.full_name || 'Team member'} 
                  />
                  <AvatarFallback>{getInitials(member.professionalDetails?.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.professionalDetails?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{member.professionalDetails?.professional_type || "Professional"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getRoleBadgeColor(member.role)}>
                  {member.role}
                </Badge>
                <Badge className={getStatusBadgeColor(member.status)}>
                  {member.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
