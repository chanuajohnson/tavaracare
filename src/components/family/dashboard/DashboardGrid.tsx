
import React from "react";
import { motion } from "framer-motion";
import { MessageBoardSection } from "./MessageBoardSection";
import { FamilyPostCareNeedForm } from "@/components/family/FamilyPostCareNeedForm";

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MessageBoardSection 
          messages={messages} 
          loading={loading} 
          refreshing={refreshing}
          refreshData={refreshData}
          formatTimePosted={formatTimePosted}
        />
      </motion.div>

      <FamilyPostCareNeedForm />
    </div>
  );
};
