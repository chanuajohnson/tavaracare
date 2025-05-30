
import { useEffect } from "react";
import { CareNeedsAssessmentForm } from "@/components/family/CareNeedsAssessmentForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";

const CareNeedsAssessmentPage = () => {
  useEffect(() => {
    document.title = "Care Needs Assessment | Tavara";
    
    // Prevent auth redirection by setting skip flag
    sessionStorage.setItem('skipPostLoginRedirect', 'true');
    
    // Clean up on unmount
    return () => {
      sessionStorage.removeItem('skipPostLoginRedirect');
    };
  }, []);

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
      
      <CareNeedsAssessmentForm />
    </div>
  );
};

export default CareNeedsAssessmentPage;
