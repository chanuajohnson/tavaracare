
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CareTeamMember {
  id: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id: string;
  role: string;
  status: string;
  notes?: string;
  created_at: string;
  care_plans?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    family_id: string;
    created_at: string;
    updated_at: string;
    metadata?: any;
    profiles?: {
      full_name?: string | null;
      avatar_url?: string | null;
      phone_number?: string | null;
    };
  };
  family?: {
    full_name?: string | null;
    avatar_url?: string | null;
    phone_number?: string | null;
  };
}

interface CareAssignmentCardProps {
  assignment: CareTeamMember;
}

export function CareAssignmentCard({ assignment }: CareAssignmentCardProps) {
  // Add debug logging
  console.log("Rendering CareAssignmentCard with assignment:", assignment);

  // Check for required data
  if (!assignment.care_plans) {
    console.warn("Assignment missing care_plans data:", assignment.id);
    return null;
  }

  // Get family data from either nested profiles or family property
  const familyProfile = assignment.care_plans.profiles || assignment.family || {
    full_name: "Family",
    avatar_url: null,
    phone_number: null
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "F";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'invited':
      case 'pending': 
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAssignmentStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'border-l-green-500';
      case 'invited':
        return 'border-l-amber-500';
      case 'declined':
        return 'border-l-red-500';
      case 'removed':
        return 'border-l-gray-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <Card key={assignment.id} className="overflow-hidden">
      <div className={`border-l-4 ${getAssignmentStatusColor(assignment.status)}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium mb-1">{assignment.care_plans.title || "Care Plan"}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {assignment.care_plans.description || "No description provided"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-gray-50">
                  {assignment.role || "Caregiver"}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`
                    ${assignment.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                      assignment.status === 'invited' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                      'bg-gray-50 text-gray-700 border-gray-200'}
                  `}
                >
                  {assignment.status === 'active' ? 'Active' :
                    assignment.status === 'invited' ? 'Invitation Pending' : 
                    assignment.status || "Pending"}
                </Badge>
                {assignment.care_plans.status && (
                  <Badge variant="outline" className={getStatusColor(assignment.care_plans.status)}>
                    Plan: {assignment.care_plans.status}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className="mb-1">
                    {familyProfile?.full_name || "Family"}
                  </Badge>
                  {assignment.created_at && (
                    <span className="text-xs text-gray-500">
                      Assigned: {new Date(assignment.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={familyProfile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {getInitials(familyProfile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Link to={`/professional/assignments/${assignment.care_plan_id}`}>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
          
          {assignment.notes && (
            <div className="mt-3 text-sm bg-gray-50 p-2 rounded border">
              <span className="font-medium">Notes: </span>
              {assignment.notes}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
