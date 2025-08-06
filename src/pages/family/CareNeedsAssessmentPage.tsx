
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CareNeedsAssessmentForm } from "@/components/family/CareNeedsAssessmentForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { setAuthFlowFlag, AUTH_FLOW_FLAGS } from "@/utils/authFlowUtils";

const CareNeedsAssessmentPage = () => {
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';

  useEffect(() => {
    document.title = isEditMode ? "Edit Care Assessment | Tavara" : "Care Needs Assessment | Tavara";
    
    // Prevent auth redirection by setting specific flag for care assessment
    setAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_CARE_ASSESSMENT_REDIRECT);
    
    // Clean up on unmount
    return () => {
      sessionStorage.removeItem(AUTH_FLOW_FLAGS.SKIP_CARE_ASSESSMENT_REDIRECT);
    };
  }, [isEditMode]);

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="care_assessment_page_view" 
        journeyStage="onboarding"
      />
      
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Family Dashboard", path: "/dashboard/family" },
          { 
            label: isEditMode ? "Edit Care Assessment" : "Care Needs Assessment", 
            path: `/family/care-assessment${isEditMode ? '?mode=edit' : ''}` 
          }
        ]} 
      />
      
      <CareNeedsAssessmentForm />
    </div>
  );
};

export default CareNeedsAssessmentPage;
