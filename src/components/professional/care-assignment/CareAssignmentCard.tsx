
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CareAssignmentStatus } from "./CareAssignmentStatus";
import { CareAssignmentBadges } from "./CareAssignmentBadges";
import { FamilyInfo } from "./FamilyInfo";

interface CareTeamMember {
  id: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id?: string;
  role?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  care_plan?: {
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    family_id?: string;
    created_at?: string;
    updated_at?: string;
    metadata?: any;
    family_profile?: {
      full_name?: string | null;
      avatar_url?: string | null;
      phone_number?: string | null;
    };
  };
  // For backward compatibility with existing code
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
  // Log for debugging
  console.log("Rendering CareAssignmentCard with assignment:", assignment);

  // Validation to ensure required data exists
  if (!assignment) {
    console.warn("Assignment is missing or null");
    return null;
  }
  
  // Support both care_plan and care_plans property (either could exist based on data structure)
  const carePlanData = assignment.care_plan || assignment.care_plans;
  
  if (!carePlanData) {
    console.warn("Both care_plan and care_plans data missing for assignment:", assignment.id);
    return null;
  }

  // Get family data from either nested profile structures with improved fallbacks
  const familyProfile = 
    (assignment.care_plan?.family_profile) || 
    (assignment.care_plans?.profiles) || 
    assignment.family || 
    {
      full_name: "Family",
      avatar_url: null,
      phone_number: null
    };

  // Ensure values exist and provide defaults
  const carePlanTitle = carePlanData.title || "Care Plan";
  const carePlanDescription = carePlanData.description || "No description provided";
  const carePlanId = assignment.care_plan_id || carePlanData.id || "";
  const assignmentRole = assignment.role || "Caregiver";
  const assignmentStatus = assignment.status || "pending";
  const carePlanStatus = carePlanData.status;
  const createdAt = assignment.created_at;
  const familyName = familyProfile?.full_name || "Family";
  const avatarUrl = familyProfile?.avatar_url || '';

  return (
    <Card key={assignment.id} className="overflow-hidden">
      <div className="flex">
        <CareAssignmentStatus status={assignmentStatus} />
        <CardContent className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium mb-1">{carePlanTitle}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {carePlanDescription}
              </p>
              <CareAssignmentBadges 
                role={assignmentRole}
                assignmentStatus={assignmentStatus}
                carePlanStatus={carePlanStatus}
              />
            </div>
            <div className="flex flex-col items-end">
              <FamilyInfo 
                familyName={familyName}
                avatarUrl={avatarUrl}
                createdAt={createdAt}
              />
              <Link to={`/professional/assignments/${carePlanId}`}>
                <Button size="sm" variant="outline" className="mt-2">
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
