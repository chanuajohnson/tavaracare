
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, AlertCircle, UserCheck, UserX } from "lucide-react";
import { CareTeamMemberWithProfile } from "@/types/careTypes";

interface CareTeamMembersTabProps {
  careTeamMembers: any[];
  carePlans: any[];
  loading: boolean;
}

export function CareTeamMembersTab({ careTeamMembers, carePlans, loading }: CareTeamMembersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  console.log("CareTeamMembersTab received:", { 
    careTeamMembers: careTeamMembers.length, 
    carePlans: carePlans.length 
  });
  
  // Group team members by care plan
  const membersByPlan = careTeamMembers.reduce((acc, member) => {
    if (!acc[member.carePlanId]) {
      acc[member.carePlanId] = [];
    }
    acc[member.carePlanId].push(member);
    return acc;
  }, {} as Record<string, CareTeamMemberWithProfile[]>);
  
  // Get care plan lookup by ID
  const carePlanLookup = carePlans.reduce((acc, plan) => {
    if (plan.care_plans && plan.care_plans.id) {
      acc[plan.care_plans.id] = plan.care_plans.title;
    }
    return acc;
  }, {} as Record<string, string>);
  
  const filteredMembers = careTeamMembers.filter(member => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      member.professionalDetails?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by role
    const matchesRole = roleFilter === "all" || 
      member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'invited':
        return <Badge variant="outline">Invited</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'removed':
        return <Badge>Removed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Team Members</CardTitle>
          <CardDescription>Loading your care team members...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!careTeamMembers || careTeamMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Team Members</CardTitle>
          <CardDescription>Your care team members will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No care team members found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You're not part of any care teams yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Team Members</CardTitle>
        <CardDescription>
          {filteredMembers.length} team {filteredMembers.length === 1 ? "member" : "members"} across your care plans
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search team members..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(membersByPlan).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(membersByPlan).map(([planId, members]) => (
              <div key={planId} className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium text-lg mb-3">{carePlanLookup[planId] || 'Care Plan'}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {members.filter(member => {
                    return (!searchQuery || 
                      member.professionalDetails?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      member.role?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                      (roleFilter === "all" || member.role === roleFilter);
                  }).map((member) => (
                    <div key={member.id} className="bg-white p-3 rounded border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.professionalDetails?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary text-white">
                            {getInitials(member.professionalDetails?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.professionalDetails?.full_name || 'Unknown'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-gray-50">
                              {member.role || 'Team Member'}
                            </Badge>
                            {getStatusBadge(member.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.status === 'invited' && (
                          <Button size="sm" variant="ghost" className="text-green-600">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        )}
                        {member.status === 'invited' && (
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <UserX className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No matching team members found</p>
        )}
      </CardContent>
    </Card>
  );
}
