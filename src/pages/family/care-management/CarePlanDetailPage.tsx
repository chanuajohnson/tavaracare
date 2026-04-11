
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCarePlanData } from "@/hooks/useCarePlanData";
import { CareTeamMemberWithProfile } from "@/types/careTypes";
import { ChefHat, FileText, ClipboardList, Info } from "lucide-react";
import DocumentGenerationMenu from "@/components/admin/care-plans/DocumentGenerationMenu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

import { CareTeamTab } from "@/components/care-plan/CareTeamTab";
import { PlanDetailsTab } from "@/components/care-plan/PlanDetailsTab";
import { EnhancedScheduleTab } from "@/components/care-plan/EnhancedScheduleTab";
import { PayrollTab } from "@/components/care-plan/PayrollTab";
import { MedicationsTab } from "@/components/care-plan/MedicationsTab";
import { MedicationReportsTab } from "@/components/medication/MedicationReportsTab";
import { CarePlanHeader } from "@/components/care-plan/CarePlanHeader";
import { CarePlanLoadingState } from "@/components/care-plan/CarePlanLoadingState";
import { CarePlanNotFound } from "@/components/care-plan/CarePlanNotFound";
import { RemoveTeamMemberDialog } from "@/components/care-plan/RemoveTeamMemberDialog";
import { MealPlanner } from "@/components/meal-planning/MealPlanner";
import { ShiftReportGenerator } from "@/components/care-plan/ShiftReportGenerator";
import { DailyCareLogsTab } from "@/components/care-plan/DailyCareLogsTab";

const CarePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CareTeamMemberWithProfile | null>(null);
  const [isAdminViewing, setIsAdminViewing] = useState(false);
  const [familyName, setFamilyName] = useState<string | null>(null);

  // Get the tab from URL parameters, default to 'details'
  const initialTab = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(initialTab);

  // ALL hooks must be called before any conditional returns
  const {
    loading,
    error,
    carePlan,
    careTeamMembers,
    careShifts,
    professionals,
    handleRemoveTeamMember,
    handleDeleteShift,
    reloadCareTeamMembers,
    reloadCareShifts,
  } = useCarePlanData({
    carePlanId: id || '',
    userId: user?.id || '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[CarePlanDetailPage] No authenticated user, redirecting to auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  // Check if admin is viewing on behalf of a family
  useEffect(() => {
    if (carePlan && user && carePlan.familyId !== user.id) {
      const checkAdmin = async () => {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (data) {
          setIsAdminViewing(true);
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', carePlan.familyId)
            .maybeSingle();
          setFamilyName(profile?.full_name || 'Family');
        }
      };
      checkAdmin();
    }
  }, [carePlan, user]);

  // Now safe to do conditional returns (all hooks above)
  if (authLoading) {
    return <CarePlanLoadingState />;
  }

  if (!user) {
    return <CarePlanLoadingState />;
  }

  if (!id) {
    return <CarePlanNotFound />;
  }

  if (loading) {
    return <CarePlanLoadingState />;
  }

  if (error) {
    console.error('[CarePlanDetailPage] Error loading care plan:', error);
    return <CarePlanNotFound />;
  }

  if (!carePlan) {
    return <CarePlanNotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_care_plan_view" additionalData={{ plan_id: id }} />
      
      <Container className="py-8">
        {isAdminViewing && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You are managing this care plan on behalf of <strong>{familyName}</strong>. 
              All changes are visible to the family in real-time.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <CarePlanHeader carePlan={carePlan} />
          <DocumentGenerationMenu
            familyName={user?.user_metadata?.full_name || familyName || 'Family'}
            familyEmail={user?.email}
            carePlanId={id}
            carePlanTitle={carePlan.title}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            <TabsTrigger value="team">Care Team</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="payroll">Payroll & Hours</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="meals">
              <ChefHat className="mr-2 h-4 w-4" />
              Meal Planning
            </TabsTrigger>
            <TabsTrigger value="shift-reports">
              <FileText className="mr-2 h-4 w-4" />
              Shift Reports
            </TabsTrigger>
            <TabsTrigger value="daily-logs">
              <ClipboardList className="mr-2 h-4 w-4" />
              Daily Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <PlanDetailsTab carePlan={carePlan} />
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

          <TabsContent value="medications">
            <MedicationsTab carePlanId={id} />
          </TabsContent>

          <TabsContent value="meals">
            <MealPlanner carePlanId={id} />
          </TabsContent>
          
          <TabsContent value="schedule">
            <EnhancedScheduleTab
              carePlanId={id!}
              carePlanTitle={carePlan?.title || 'Care Plan'}
              familyId={carePlan?.familyId || user.id}
              careShifts={careShifts}
              careTeamMembers={careTeamMembers}
              onShiftUpdated={reloadCareShifts}
              onDeleteShift={handleDeleteShift}
            />
          </TabsContent>

          <TabsContent value="shift-reports">
            <ShiftReportGenerator
              carePlanId={id}
              careShifts={careShifts}
              careTeamMembers={careTeamMembers}
              carePlanTitle={carePlan.title}
            />
          </TabsContent>

          <TabsContent value="reports">
            <MedicationReportsTab carePlanId={id} />
          </TabsContent>

          <TabsContent value="daily-logs">
            <DailyCareLogsTab carePlanId={id} />
          </TabsContent>
          
          <TabsContent value="payroll">
            <PayrollTab carePlanId={id} />
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
