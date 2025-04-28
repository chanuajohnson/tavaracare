
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Filter, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useCareAssignments } from "@/hooks/professional/useCareAssignments";
import { CareTeamMembersView } from "./care-assignments/CareTeamMembersView";
import { CareScheduleView } from "./care-assignments/CareScheduleView";
import { CarePlanCard } from "./care-assignments/CarePlanCard";

export const CareAssignmentsTab = () => {
  const { 
    carePlans, 
    careTeamMembers, 
    careShifts,
    loading, 
    error,
    selectedPlanId,
    setSelectedPlanId
  } = useCareAssignments();
  
  const [activeTab, setActiveTab] = useState<string>('assignments');

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Care Assignments</CardTitle>
          <CardDescription>
            We encountered an issue while loading your care assignments. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Your Care Assignments
          </CardTitle>
          <CardDescription>
            View care plans you are assigned to and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carePlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {carePlans.map((carePlan) => (
                <CarePlanCard 
                  key={carePlan.id} 
                  carePlan={carePlan}
                  isSelected={selectedPlanId === carePlan.id}
                  onSelect={() => setSelectedPlanId(carePlan.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                You are not currently assigned to any care plans.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {carePlans.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Care Team
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="team">
            <CareTeamMembersView 
              careTeamMembers={careTeamMembers}
              selectedPlanId={selectedPlanId} 
            />
          </TabsContent>
          
          <TabsContent value="schedule">
            <CareScheduleView 
              careShifts={careShifts}
              carePlans={carePlans}
              selectedPlanId={selectedPlanId}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
