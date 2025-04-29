
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfessionalDetails {
  full_name: string;
  professional_type: string;
  avatar_url: string | null;
}

interface CareTeamMember {
  id: string;
  carePlanId: string;
  familyId: string;
  caregiverId: string;
  role: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  professionalDetails: ProfessionalDetails;
}

interface CareTeamMembersTabProps {
  teamMembers: CareTeamMember[];
  loading: boolean;
}

export function CareTeamMembersTab({ teamMembers = [], loading = false }: CareTeamMembersTabProps) {
  // Add debug logging
  console.log("CareTeamMembersTab rendering with:", { teamMembers, loading });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'invited': 
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'declined':
      case 'removed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  
  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No team members found
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {teamMembers.map(member => (
        <Card key={member.id} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.professionalDetails.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(member.professionalDetails.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.professionalDetails.full_name}</p>
                  <p className="text-sm text-gray-500">{member.professionalDetails.professional_type}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className={getStatusColor(member.status)}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </Badge>
                <span className="text-xs text-gray-500 mt-1">
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
