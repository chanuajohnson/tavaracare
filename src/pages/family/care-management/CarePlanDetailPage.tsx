
import { useState, useEffect, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCarePlanData } from "@/hooks/useCarePlanData";
import { CareTeamMemberWithProfile } from "@/types/careTypes";

import { CareTeamTab } from "@/components/care-plan/CareTeamTab";
import { PlanDetailsTab } from "@/components/care-plan/PlanDetailsTab";
import { ScheduleTab } from "@/components/care-plan/ScheduleTab";
import { PayrollTab } from "@/components/care-plan/PayrollTab";
import { CarePlanHeader } from "@/components/care-plan/CarePlanHeader";
import { CarePlanLoadingState } from "@/components/care-plan/CarePlanLoadingState";
import { CarePlanNotFound } from "@/components/care-plan/CarePlanNotFound";
import { RemoveTeamMemberDialog } from "@/components/care-plan/RemoveTeamMemberDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { fetchFamilyCareNeeds } from "@/services/familyCareNeedsService";

const CarePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CareTeamMemberWithProfile | null>(null);
  const [careNeeds, setCareNeeds] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Ensure we have user and id before proceeding
  if (!user || !id) {
    console.error("Missing required data:", { user: !!user, id });
    return <CarePlanLoadingState />;
  }

  const {
    loading,
    carePlan,
    careTeamMembers,
    careShifts,
    professionals,
    handleRemoveTeamMember,
    handleDeleteShift,
    reloadCareTeamMembers,
    reloadCareShifts,
  } = useCarePlanData({
    carePlanId: id,
    userId: user.id,
  });

  useEffect(() => {
    // Load family care needs data if needed
    const loadCareNeeds = async () => {
      if (user?.id) {
        try {
          const needsData = await fetchFamilyCareNeeds(user.id);
          setCareNeeds(needsData);
        } catch (err) {
          console.error("Error fetching care needs:", err);
          setError("Failed to load care needs data");
        }
      }
    };
    
    loadCareNeeds();
  }, [user?.id]);

  if (loading) {
    return <CarePlanLoadingState />;
  }

  if (!carePlan) {
    return <CarePlanNotFound />;
  }

  // Add safety checks for required data before rendering
  if (!careTeamMembers) {
    console.error("Missing careTeamMembers data");
    return <div className="p-8 text-center">Error loading care team data. Please refresh the page.</div>;
  }

  if (!professionals) {
    console.error("Missing professionals data");
    return <div className="p-8 text-center">Error loading professionals data. Please refresh the page.</div>;
  }

  // Create safer version of care plan by ensuring metadata exists
  const safePlan = {
    ...carePlan,
    metadata: carePlan.metadata || {},
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_care_plan_view" additionalData={{ plan_id: id }} />
      
      <Container className="py-8">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/family/care-management")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Care Management
        </Button>
        
        <CarePlanHeader carePlan={safePlan} />

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            <TabsTrigger value="team">Care Team</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="payroll">Payroll & Hours</TabsTrigger>
          </TabsList>
          
          <Suspense fallback={<div className="p-8">Loading tab content...</div>}>
            <TabsContent value="details">
              <PlanDetailsTab carePlan={safePlan} />
            </TabsContent>
            
            <TabsContent value="team">
              <CareTeamTab 
                carePlanId={id}
                familyId={user.id}
                careTeamMembers={careTeamMembers}
                professionals={professionals}
                onMemberAdded={reloadCareTeamMembers}
                onMemberRemoveRequest={(member) => {
                  setMemberToRemove(member);
                  setConfirmRemoveDialogOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="schedule">
              <ScheduleTab
                carePlanId={id}
                familyId={user.id}
                careShifts={careShifts || []}
                careTeamMembers={careTeamMembers}
                onShiftUpdated={reloadCareShifts}
                onDeleteShift={handleDeleteShift}
              />
            </TabsContent>
            
            <TabsContent value="payroll">
              <PayrollTab carePlanId={id} />
            </TabsContent>
          </Suspense>
        </Tabs>
      </Container>

      <RemoveTeamMemberDialog
        open={confirmRemoveDialogOpen}
        onOpenChange={setConfirmRemoveDialogOpen}
        member={memberToRemove}
        onConfirm={() => {
          if (memberToRemove) {
            handleRemoveTeamMember(memberToRemove.id);
            setConfirmRemoveDialogOpen(false);
            setMemberToRemove(null);
          }
        }}
      />
    </div>
  );
};

export default CarePlanDetailPage;
