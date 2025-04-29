
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { getRegistrationFlowByRole } from "@/data/chatRegistrationFlows";
import { getTotalSectionsForRole } from "@/services/chat/responseUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatProgressIndicatorProps {
  role: string | null;
  sectionIndex: number;
  questionIndex: number;
  conversationStage: "intro" | "questions" | "completion";
}

export const ChatProgressIndicator: React.FC<ChatProgressIndicatorProps> = ({
  role,
  sectionIndex,
  questionIndex,
  conversationStage
}) => {
  const isMobile = useIsMobile();

  // Only show progress during questions stage with a valid role
  if (conversationStage !== "questions" || !role) {
    return null;
  }

  // Calculate progress percentage
  const totalSections = getTotalSectionsForRole(role);
  const flow = getRegistrationFlowByRole(role);
  
  // Get current section
  const currentSection = flow.sections[sectionIndex];
  const totalQuestionsInSection = currentSection ? currentSection.questions.length : 0;
  
  // Calculate overall progress (section-based)
  const sectionProgress = ((sectionIndex / totalSections) * 100);
  
  // Add question progress within section
  const questionProgressValue = totalQuestionsInSection > 0 
    ? (questionIndex / totalQuestionsInSection) * (100 / totalSections)
    : 0;
    
  const totalProgress = Math.min(Math.round(sectionProgress + questionProgressValue), 99);
  
  // Get section name for display
  const sectionName = currentSection ? currentSection.title : "";

  return (
    <div className={`w-full px-4 py-2 border-b border-gray-200 bg-white/80 sticky top-0 z-10`}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>
            Section {sectionIndex + 1} of {totalSections}
          </span>
          <span className={`text-gray-500 ml-2 ${isMobile ? "text-xs" : "text-sm"}`}>
            • {sectionName}
          </span>
        </div>
        <span className={`text-gray-500 ${isMobile ? "text-xs" : "text-sm"}`}>{totalProgress}%</span>
      </div>
      <Progress value={totalProgress} className={`h-1.5 ${isMobile ? "w-full" : "w-full"}`} />
    </div>
  );
};
