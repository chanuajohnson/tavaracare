
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Brain } from "lucide-react";
import { useCareAssessmentForm } from "./care-assessment/useCareAssessmentForm";
import { BasicInformationSection } from "./care-assessment/BasicInformationSection";
import { DailyLivingTasksSection } from "./care-assessment/DailyLivingTasksSection";
import { CognitiveSupportSection } from "./care-assessment/CognitiveSupportSection";
import { OtherSectionsComponent } from "./care-assessment/OtherSectionsComponent";

export const CareNeedsAssessmentForm = () => {
  const navigate = useNavigate();
  const {
    formData,
    loading,
    submitting,
    existingAssessment,
    dataLoadError,
    updateFormData,
    handleDayToggle,
    handleSubmit
  } = useCareAssessmentForm();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dataLoadError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Assessment</h2>
            <p className="text-gray-600 mb-4">{dataLoadError}</p>
            <Button onClick={() => navigate("/dashboard/family")} variant="outline">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-2 flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Client Care Needs Breakdown
            </h1>
            <p className="text-lg text-gray-600">
              {existingAssessment ? "Update your care requirements" : "Help us understand your loved one's specific care requirements to match you with the right caregiver."}
            </p>
            {existingAssessment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-blue-700 text-sm">✓ Existing assessment found and loaded</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <BasicInformationSection 
              formData={formData}
              updateFormData={updateFormData}
              handleDayToggle={handleDayToggle}
            />
            
            <DailyLivingTasksSection 
              formData={formData}
              updateFormData={updateFormData}
            />
            
            <CognitiveSupportSection 
              formData={formData}
              updateFormData={updateFormData}
            />
            
            <OtherSectionsComponent 
              formData={formData}
              updateFormData={updateFormData}
            />

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="px-8"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {existingAssessment ? "Updating..." : "Submitting..."}
                  </div>
                ) : (
                  existingAssessment ? "Update Assessment" : "Complete Assessment"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
