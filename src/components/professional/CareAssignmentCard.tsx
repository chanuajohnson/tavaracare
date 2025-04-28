
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CareAssignmentCardProps {
  assignment: any;
  className?: string;
}

export function CareAssignmentCard({ assignment, className = "" }: CareAssignmentCardProps) {
  // Add debug logging
  console.log("Rendering CareAssignmentCard with assignment:", assignment);

  if (!assignment.care_plans) {
    console.warn("Assignment missing care_plans data:", assignment.id);
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return "F";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'invited':
      case 'pending': 
        return 'outline';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
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
    <Card key={assignment.id} className={`overflow-hidden ${className}`}>
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
                  variant={getStatusColor(assignment.status)}
                >
                  {assignment.status === 'active' ? 'Active' :
                    assignment.status === 'invited' ? 'Invitation Pending' : 
                    assignment.status || "Pending"}
                </Badge>
                {assignment.care_plans.status && (
                  <Badge variant="outline">
                    Plan: {assignment.care_plans.status}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className="mb-1">
                    {assignment.care_plans.profiles?.full_name || "Family"}
                  </Badge>
                  {assignment.created_at && (
                    <span className="text-xs text-gray-500">
                      Assigned: {new Date(assignment.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={assignment.care_plans.profiles?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {assignment.care_plans.profiles?.full_name ? 
                      getInitials(assignment.care_plans.profiles.full_name) : 'F'}
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
