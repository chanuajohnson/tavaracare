
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CareNeedsAssessmentForm } from "@/components/family/CareNeedsAssessmentForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useIndependentAuth } from "@/hooks/auth/useIndependentAuth";

const CareNeedsAssessmentPage = () => {
  const navigate = useNavigate();
  
  const { user, isLoading, authChecked } = useIndependentAuth({
    redirectPath: '/auth',
    returnPath: '/family/care-assessment',
    requireAuthMessage: 'Please sign in to access the care assessment'
  });

  useEffect(() => {
    document.title = "Care Needs Assessment | Tavara";
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Verifying access..." />;
  }

  // If auth check completed but no user, the redirect is in progress
  if (authChecked && !user) {
    return <LoadingScreen message="Redirecting to sign in..." />;
  }

  // Only render the main content if we have an authenticated user
  if (!user) {
    return null;
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
