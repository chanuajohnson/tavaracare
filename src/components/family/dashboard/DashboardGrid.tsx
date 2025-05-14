
import React from "react";
import { MessageBoardSection } from "./MessageBoardSection";
import { FamilyPostCareNeedForm } from "@/components/family/FamilyPostCareNeedForm";
import { ScaleIn } from "@/components/framer";

interface DashboardGridProps {
  messages: any[];
  loading: boolean;
  refreshing: boolean;
  refreshData: () => Promise<void>;
  formatTimePosted: (timestamp: string) => string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  messages,
  loading,
  refreshing,
  refreshData,
  formatTimePosted
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <ScaleIn
        duration={0.5}
        delay={0}
        initialScale={0.95}
      >
        <MessageBoardSection 
          messages={messages} 
          loading={loading} 
          refreshing={refreshing}
          refreshData={refreshData}
          formatTimePosted={formatTimePosted}
        />
      </ScaleIn>

      <FamilyPostCareNeedForm />
    </div>
  );
};
