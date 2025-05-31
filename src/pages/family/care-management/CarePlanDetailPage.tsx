
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { MedicationsTab } from "@/components/care-plan/MedicationsTab";
import { CarePlanHeader } from "@/components/care-plan/CarePlanHeader";
import { CarePlanLoadingState } from "@/components/care-plan/CarePlanLoadingState";
import { CarePlanNotFound } from "@/components/care-plan/CarePlanNotFound";
import { RemoveTeamMemberDialog } from "@/components/care-plan/RemoveTeamMemberDialog";

const CarePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CareTeamMemberWithProfile | null>(null);

  // Get the tab from URL parameters, default to 'details'
  const initialTab = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(initialTab);

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
    carePlanId: id!,
    userId: user!.id,
  });

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  if (loading) {
    return <CarePlanLoadingState />;
  }

  if (!carePlan) {
    return <CarePlanNotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_care_plan_view" additionalData={{ plan_id: id }} />
      
      <Container className="py-8">
        <CarePlanHeader carePlan={carePlan} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            <TabsTrigger value="team">Care Team</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="payroll">Payroll & Hours</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <PlanDetailsTab carePlan={carePlan} />
          </TabsContent>
          
          <TabsContent value="team">
            <CareTeamTab 
              carePlanId={id!}
              familyId={user!.id}
              careTeamMembers={careTeamMembers}
              professionals={professionals}
              onMemberAdded={reloadCareTeamMembers}
              onMemberRemoveRequest={(member) => {
                setMemberToRemove(member);
                setConfirmRemoveDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="medications">
            <MedicationsTab carePlanId={id!} />
          </TabsContent>
          
          <TabsContent value="schedule">
            <ScheduleTab
              carePlanId={id!}
              familyId={user!.id}
              careShifts={careShifts}
              careTeamMembers={careTeamMembers}
              onShiftUpdated={reloadCareShifts}
              onDeleteShift={handleDeleteShift}
            />
          </TabsContent>
          
          <TabsContent value="payroll">
            <PayrollTab carePlanId={id!} />
          </TabsContent>
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
