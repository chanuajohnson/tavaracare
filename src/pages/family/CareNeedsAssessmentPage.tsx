
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CareNeedsAssessmentForm } from "@/components/family/CareNeedsAssessmentForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const CareNeedsAssessmentPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    document.title = "Care Needs Assessment | Tavara";
    
    // Set skip flag to prevent AuthProvider redirection
    sessionStorage.setItem('skipPostLoginRedirect', 'true');
    
    // Clean up the flag when component unmounts
    return () => {
      sessionStorage.removeItem('skipPostLoginRedirect');
    };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        setAuthLoading(true);
        
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Authentication error. Please sign in again.');
          navigate('/auth');
          return;
        }
        
        if (!sessionData.session) {
          toast.error('Please sign in to access the care assessment.');
          navigate('/auth');
          return;
        }

        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('User error:', userError);
          toast.error('Authentication error. Please sign in again.');
          navigate('/auth');
          return;
        }

        if (!userData.user) {
          toast.error('Please sign in to access the care assessment.');
          navigate('/auth');
          return;
        }

        setUser(userData.user);
      } catch (error) {
        console.error('Authentication check failed:', error);
        toast.error('Authentication error. Please sign in again.');
        navigate('/auth');
      } finally {
        setAuthLoading(false);
      }
    };

    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          toast.error('You have been signed out.');
          navigate('/auth');
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading screen while checking authentication
  if (authLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Only render if user is authenticated
  if (!user) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="care_assessment_page_view" 
        journeyStage="onboarding"
      />
      
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Family Dashboard", path: "/dashboard/family" },
          { label: "Care Needs Assessment", path: "/family/care-assessment" }
        ]} 
      />
      
      {/* Back button */}
      <div className="container mx-auto px-4 pt-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard/family")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <CareNeedsAssessmentForm />
    </div>
  );
};

export default CareNeedsAssessmentPage;
