
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";
import { CareAssignmentCard } from "@/components/professional/CareAssignmentCard";

interface AssignmentsTabProps {
  loadingCarePlans: boolean;
  carePlans: any[];
}

export function AssignmentsTab({ loadingCarePlans, carePlans }: AssignmentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Assignments</CardTitle>
        <CardDescription>
          Families and care plans you're currently assigned to
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingCarePlans ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : carePlans.length > 0 ? (
          <div className="space-y-4">
            {carePlans.map((assignment) => (
              <CareAssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No care assignments yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You don't have any care assignments yet. 
              Assignments will appear here once families add you to their care team.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
