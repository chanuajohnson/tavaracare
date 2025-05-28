
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CareNeedsAssessmentForm } from "@/components/family/CareNeedsAssessmentForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CareNeedsAssessmentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Care Needs Assessment | Tavara";
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/auth");
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
