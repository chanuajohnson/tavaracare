
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { 
  AssignmentHeader, 
  FamilyDetailsCard, 
  AssignmentTabs 
} from "@/components/professional/assignments";

const ProfessionalAssignmentPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [carePlan, setCarePlan] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  // Journey tracking
  useJourneyTracking({
    journeyStage: 'assignment_management',
    additionalData: { page: 'professional_assignment', plan_id: planId },
    trackOnce: true
  });

  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Profile",
      path: "/professional/profile",
    },
    {
      label: "Assignment Details",
      path: `/professional/assignments/${planId}`,
    },
  ];

  useEffect(() => {
    if (!user) {
      toast.info("Authentication Required", {
        description: "Please log in to view assignment details.",
      });
      navigate("/auth", { state: { returnPath: `/professional/assignments/${planId}` } });
      return;
    }

    const loadCarePlan = async () => {
      try {
        setLoading(true);

        // First, check if this caregiver is actually assigned to this care plan
        const { data: memberCheck, error: memberCheckError } = await supabase
          .from('care_team_members')
          .select('id')
          .eq('care_plan_id', planId)
          .eq('caregiver_id', user.id)
          .maybeSingle();

        if (memberCheckError) throw memberCheckError;

        if (!memberCheck) {
          toast.error("Unauthorized Access", {
            description: "You are not authorized to view this care plan.",
          });
          navigate("/professional/profile");
          return;
        }

        // Fetch care plan details with standardized naming
        const { data: planData, error: planError } = await supabase
          .from('care_plans')
          .select(`
            id,
            title,
            description,
            status,
            family_id,
            created_at,
            metadata,
            profiles:family_id (
              full_name,
              phone_number,
              email,
              address,
              avatar_url
            )
          `)
          .eq('id', planId)
          .maybeSingle();

        if (planError) throw planError;
        if (!planData) {
          toast.error("Care Plan Not Found", {
            description: "The requested care plan could not be found.",
          });
          navigate("/professional/profile");
          return;
        }

        // Rename profiles to family_profile for consistency
        const formattedPlan = {
          ...planData,
          family_profile: planData.profiles
        };
        
        console.log("Formatted care plan with standardized naming:", formattedPlan);
        setCarePlan(formattedPlan);

        // Fetch team members for this care plan
        const { data: teamData, error: teamError } = await supabase
          .from('care_team_members')
          .select(`
            id,
            status,
            role,
            caregiver_id,
            profiles:caregiver_id (
              full_name,
              professional_type,
              avatar_url
            )
          `)
          .eq('care_plan_id', planId);

        if (teamError) throw teamError;
        setTeamMembers(teamData || []);

        // Fetch upcoming shifts for this care plan
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('care_shifts')
          .select('*')
          .eq('care_plan_id', planId)
          .eq('caregiver_id', user.id)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);

        if (shiftsError) throw shiftsError;
        setShifts(shiftsData || []);

        setLoading(false);
      } catch (error) {
        console.error("Error loading care plan:", error);
        toast.error("Failed to load assignment details");
        setLoading(false);
      }
    };

    loadCarePlan();
  }, [user, planId, navigate]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for shift display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <Skeleton className="h-10 w-32 mb-4" /> {/* Back button */}
          <Skeleton className="h-12 w-2/3 mb-4" /> {/* Title */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <Skeleton className="h-64 w-full" /> {/* Family details card */}
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" /> {/* Tabs content */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <AssignmentHeader title={carePlan?.title} status={carePlan?.status} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <FamilyDetailsCard familyProfile={carePlan?.family_profile} />
          </div>

          <div className="lg:col-span-2">
            <AssignmentTabs
              carePlan={carePlan}
              shifts={shifts}
              teamMembers={teamMembers}
              userId={user?.id}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalAssignmentPage;
