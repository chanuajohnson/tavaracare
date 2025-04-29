
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Phone, 
  Mail,
  AlertCircle
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CareTeamMemberWithProfile } from '@/types/careTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamMembersByPlan {
  [planId: string]: {
    planTitle: string;
    planStatus: string;
    members: CareTeamMemberWithProfile[];
  }
}

interface CareTeamMembersTabProps {
  teamMembers: CareTeamMemberWithProfile[];
  loading: boolean;
}

export const CareTeamMembersTab: React.FC<CareTeamMembersTabProps> = ({ 
  teamMembers,
  loading
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Group team members by care plan
  const groupByCarePlan = (members: CareTeamMemberWithProfile[]): TeamMembersByPlan => {
    if (!members || !Array.isArray(members)) {
      return {};
    }
    
    return members.reduce((acc: TeamMembersByPlan, member) => {
      // Skip if member doesn't have professionalDetails (probably incomplete data)
      if (!member.professionalDetails) {
        return acc;
      }
      
      // Apply filters
      if (roleFilter !== 'all' && member.role !== roleFilter) {
        return acc;
      }
      
      if (statusFilter !== 'all' && member.status !== statusFilter) {
        return acc;
      }
      
      if (!acc[member.carePlanId]) {
        acc[member.carePlanId] = {
          planTitle: member.carePlan?.title || 'Unknown Plan',
          planStatus: member.carePlan?.status || 'active',
          members: []
        };
      }
      
      acc[member.carePlanId].members.push(member);
      return acc;
    }, {});
  };

  const membersByPlan = groupByCarePlan(teamMembers);
  const planIds = Object.keys(membersByPlan);
  const hasTeamMembers = planIds.length > 0;

  // Helper for status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'invited':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'removed':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };
  
  // Helper for role color
  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'caregiver':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'nurse':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'therapist':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'doctor':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-medium">Team Members Across All Care Plans</h3>
        
        {hasTeamMembers && (
          <div className="flex flex-wrap gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="caregiver">Caregiver</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {hasTeamMembers ? (
        <div className="space-y-6">
          {planIds.map((planId) => (
            <Card key={planId} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">
                    {membersByPlan[planId].planTitle}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(membersByPlan[planId].planStatus)}
                  >
                    {membersByPlan[planId].planStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {membersByPlan[planId].members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex gap-3 p-3 rounded-md border bg-card"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={member.professionalDetails?.avatar_url || ''} 
                          alt={member.professionalDetails?.full_name || 'Team member'} 
                        />
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(member.professionalDetails?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {member.professionalDetails?.full_name || 'Unknown Professional'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {member.professionalDetails?.professional_type || 'Care Professional'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={getRoleColor(member.role)}>
                              {member.role || 'Caregiver'}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(member.status)}>
                              {member.status || 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        
                        {member.notes && (
                          <p className="text-sm mt-2 bg-muted/40 p-2 rounded">
                            {member.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/50">
          <div className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-semibold mb-2">No Team Members Found</h3>
            <p className="mb-4 text-muted-foreground">
              {teamMembers.length > 0
                ? "No team members match the selected filters."
                : "You haven't been assigned to any care teams yet."}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
