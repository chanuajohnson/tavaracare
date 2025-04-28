
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Users, Phone, Mail } from "lucide-react";
import { CareTeamMemberWithProfile } from "@/types/careTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface CareTeamMembersTabProps {
  careTeamMembers: CareTeamMemberWithProfile[];
  carePlans: any[];
  loading: boolean;
}

export function CareTeamMembersTab({ careTeamMembers, carePlans, loading }: CareTeamMembersTabProps) {
  const [selectedCarePlan, setSelectedCarePlan] = useState<string>("all");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (planId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  // Group team members by care plan
  const teamMembersByPlan = careTeamMembers.reduce((acc: Record<string, CareTeamMemberWithProfile[]>, member) => {
    if (!acc[member.carePlanId]) {
      acc[member.carePlanId] = [];
    }
    acc[member.carePlanId].push(member);
    return acc;
  }, {});

  // Filter based on selected care plan
  const filteredPlans = selectedCarePlan === "all" 
    ? Object.keys(teamMembersByPlan) 
    : [selectedCarePlan];

  // Get care plan details for display
  const getCarePlanDetails = (planId: string) => {
    const plan = carePlans.find(plan => 
      plan.care_plans?.id === planId || plan.care_plan_id === planId
    );
    return plan?.care_plans || { title: "Unknown Care Plan" };
  };

  // Format role label
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Care Team Members
          </CardTitle>
          <CardDescription>
            View all team members across your care plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Care Team Members
        </CardTitle>
        <CardDescription>
          View all team members across your care plans
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {carePlans.length > 0 && (
          <div className="mb-4">
            <Select 
              value={selectedCarePlan} 
              onValueChange={setSelectedCarePlan}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filter by care plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Care Plans</SelectItem>
                {carePlans.map(plan => (
                  <SelectItem 
                    key={plan.care_plans?.id} 
                    value={plan.care_plans?.id}
                  >
                    {plan.care_plans?.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filteredPlans.length > 0 ? (
          <div className="space-y-4">
            {filteredPlans.map(planId => {
              const planDetails = getCarePlanDetails(planId);
              const members = teamMembersByPlan[planId] || [];
              const isExpanded = expandedGroups[planId] !== false; // Default to expanded

              return (
                <Collapsible 
                  key={planId} 
                  open={isExpanded}
                  className="border rounded-md overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex justify-between items-center p-4 bg-muted/50 cursor-pointer hover:bg-muted/70"
                      onClick={() => toggleGroup(planId)}
                    >
                      <div>
                        <h3 className="font-medium text-md">{planDetails.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {members.length} team member{members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="divide-y">
                      {members.map(member => (
                        <div key={member.id} className="p-4 flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={member.professionalDetails?.avatar_url || undefined} 
                              alt={member.professionalDetails?.full_name || 'Team member'} 
                            />
                            <AvatarFallback>
                              {getInitials(member.professionalDetails?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-medium">
                                  {member.professionalDetails?.full_name || 'Team member'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {member.professionalDetails?.professional_type || 'Caregiver'}
                                </p>
                              </div>
                              <div className="mt-1 md:mt-0">
                                <Badge 
                                  variant={member.role === 'caregiver' ? 'default' : 'secondary'}
                                  className="mr-1"
                                >
                                  {formatRole(member.role)}
                                </Badge>
                                <Badge 
                                  variant={member.status === 'active' ? 'success' : 'outline'}
                                >
                                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border rounded-md bg-muted/20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-medium">No team members found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You are not part of any care teams yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
