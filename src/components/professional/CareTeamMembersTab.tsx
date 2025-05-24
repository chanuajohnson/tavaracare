
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
  familyId?: string;
  caregiverId: string;
  role: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  professionalDetails?: ProfessionalDetails;
}

interface CareTeamMembersTabProps {
  teamMembers: CareTeamMember[];
  loading: boolean;
  currentUserId?: string;
}

export function CareTeamMembersTab({ teamMembers = [], loading = false, currentUserId }: CareTeamMembersTabProps) {
  // Enhanced debug logging
  console.log("CareTeamMembersTab rendering with:", { 
    teamMembers, 
    loading, 
    teamMembersCount: teamMembers.length,
    teamMembersWithDetails: teamMembers.filter(m => m.professionalDetails).length,
    memberIds: teamMembers.map(m => m.id),
    memberRoles: teamMembers.map(m => m.role),
    currentUserId,
    caregiverIds: teamMembers.map(m => m.caregiverId)
  });

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
  
  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No team members found for this care plan
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {teamMembers.map(member => {
        if (!member) {
          console.warn("Found null or undefined team member in array");
          return null;
        }
        
        // Ensure we have professional details with safe fallbacks
        const professionalDetails = member.professionalDetails || {
          full_name: 'Unknown Professional', 
          professional_type: 'Care Professional', 
          avatar_url: null
        };

        // Check if this member is the current logged-in user
        const isCurrentUser = currentUserId && member.caregiverId === currentUserId;
        
        // Debug individual member rendering
        console.log("Rendering team member:", { 
          id: member.id, 
          role: member.role,
          status: member.status,
          caregiverId: member.caregiverId,
          professionalName: professionalDetails.full_name,
          isCurrentUser,
          currentUserId
        });
        
        return (
          <Card 
            key={member.id} 
            className={`overflow-hidden ${isCurrentUser ? 'border-primary border-2 bg-primary/5' : ''}`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={professionalDetails.avatar_url || ''} alt={professionalDetails.full_name} />
                    <AvatarFallback className={`${isCurrentUser ? 'bg-primary text-white' : 'bg-secondary'} text-white`}>
                      {getInitials(professionalDetails.full_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {professionalDetails.full_name || 'Unknown Professional'}
                      {isCurrentUser && <span className="ml-2 text-xs text-primary font-semibold">(You)</span>}
                    </p>
                    <p className="text-sm text-gray-500">{professionalDetails.professional_type || 'Care Professional'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={getStatusColor(member.status)}>
                    {member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'Unknown'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Unknown Role'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
