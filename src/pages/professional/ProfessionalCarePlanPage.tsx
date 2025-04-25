
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { PlanDetailsTab } from "@/components/care-plan/PlanDetailsTab";
import { CareTeamTab } from "@/components/care-plan/CareTeamTab";
import { ScheduleTab } from "@/components/care-plan/ScheduleTab";
import { PayrollTab } from "@/components/care-plan/PayrollTab";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";

const ProfessionalCarePlanPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [carePlan, setCarePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!planId || !user) return;
    
    const fetchCarePlan = async () => {
      setLoading(true);
      try {
        // First check if user is a team member
        const { data: teamMember, error: teamError } = await supabase
          .from('care_team_members')
          .select('id')
          .eq('care_plan_id', planId)
          .eq('caregiver_id', user.id)
          .single();
          
        if (teamError && teamError.code !== 'PGRST116') {
          console.error("Error checking team membership:", teamError);
          setLoading(false);
          return;
        }
        
        setIsTeamMember(!!teamMember);
        
        if (!teamMember) {
          setLoading(false);
          return; // Not authorized to view this care plan
        }
        
        // Fetch care plan details
        const { data: planData, error: planError } = await supabase
          .from('care_plans')
          .select(`
            id,
            title,
            description,
            status,
            family:family_id (
              id, 
              full_name,
              contact_email,
              contact_phone
            ),
            care_recipient:care_recipient_id (
              id,
              name,
              age,
              needs
            ),
            created_at
          `)
          .eq('id', planId)
          .single();
          
        if (planError) {
          console.error("Error fetching care plan:", planError);
          setLoading(false);
          return;
        }
        
        setCarePlan(planData);
      } catch (error) {
        console.error("Error fetching care plan data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarePlan();
  }, [planId, user]);

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }
  
  if (!isTeamMember || !carePlan) {
    return (
      <Container className="py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Not Authorized</h2>
            <p className="text-muted-foreground text-center max-w-md">
              You don't have permission to view this care plan or the care plan doesn't exist.
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker
        actionType="professional_care_plan_view"
        additionalData={{ care_plan_id: planId }}
      />
      
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{carePlan.title}</h1>
          <p className="text-muted-foreground mt-1">
            {carePlan.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              carePlan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Care Professional
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Care Plan Details</TabsTrigger>
            <TabsTrigger value="team">Care Team</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="payroll">My Hours & Pay</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <PlanDetailsTab carePlan={carePlan} />
          </TabsContent>

          <TabsContent value="team">
            <CareTeamTab carePlanId={planId || ''} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab carePlanId={planId || ''} />
          </TabsContent>

          <TabsContent value="payroll">
            <PayrollTab carePlanId={planId || ''} />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default ProfessionalCarePlanPage;
