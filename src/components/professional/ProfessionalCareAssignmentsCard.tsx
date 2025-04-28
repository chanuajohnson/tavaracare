
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCareAssignments } from "@/hooks/professional/useCareAssignments";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfessionalCareAssignmentsCard = () => {
  const { user } = useAuth();
  const { carePlans, loading, error } = useCareAssignments();

  if (!user) {
    return null;
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Care Assignments
        </CardTitle>
        <CardDescription>
          View care plans and teams you're assigned to
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="text-sm text-muted-foreground">
            Error loading your care assignments.
          </div>
        ) : carePlans.length > 0 ? (
          <div className="space-y-2 mb-4">
            <p className="text-sm">You have {carePlans.length} active care plan assignments.</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              {carePlans.slice(0, 3).map(plan => (
                <li key={plan.id} className="truncate">{plan.title}</li>
              ))}
              {carePlans.length > 3 && <li>...and {carePlans.length - 3} more</li>}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            You are not currently assigned to any care plans.
          </p>
        )}
        
        <Link to="/professional/care-assignments">
          <Button variant="default" className="w-full">
            View Assignments
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
