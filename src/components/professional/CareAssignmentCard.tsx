
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
  caregiver_id?: string;
  role?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  care_plans?: {
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    family_id?: string;
    created_at?: string;
    updated_at?: string;
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

  // Enhanced validation to ensure required data exists
  if (!assignment || !assignment.care_plans) {
    console.warn("Assignment missing or care_plans data missing:", assignment?.id);
    return null;
  }

  // Get family data from either nested profiles or family property with improved fallbacks
  const familyProfile = assignment?.care_plans?.profiles || assignment?.family || {
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

  // Ensure values exist and provide defaults
  const carePlanTitle = assignment.care_plans?.title || "Care Plan";
  const carePlanDescription = assignment.care_plans?.description || "No description provided";
  const carePlanId = assignment.care_plan_id || assignment.care_plans?.id || "";
  const assignmentRole = assignment.role || "Caregiver";
  const assignmentStatus = assignment.status || "pending";
  const carePlanStatus = assignment.care_plans?.status;
  const createdAt = assignment.created_at;
  const familyName = familyProfile?.full_name || "Family";
  const avatarUrl = familyProfile?.avatar_url || '';

  return (
    <Card key={assignment.id} className="overflow-hidden">
      <div className={`border-l-4 ${getAssignmentStatusColor(assignmentStatus)}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium mb-1">{carePlanTitle}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {carePlanDescription}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-gray-50">
                  {assignmentRole}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`
                    ${assignmentStatus === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                      assignmentStatus === 'invited' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                      'bg-gray-50 text-gray-700 border-gray-200'}
                  `}
                >
                  {assignmentStatus === 'active' ? 'Active' :
                    assignmentStatus === 'invited' ? 'Invitation Pending' : 
                    assignmentStatus || "Pending"}
                </Badge>
                {carePlanStatus && (
                  <Badge variant="outline" className={getStatusColor(carePlanStatus)}>
                    Plan: {carePlanStatus}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className="mb-1">
                    {familyName}
                  </Badge>
                  {createdAt && (
                    <span className="text-xs text-gray-500">
                      Assigned: {new Date(createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {getInitials(familyName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Link to={`/professional/assignments/${carePlanId}`}>
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
