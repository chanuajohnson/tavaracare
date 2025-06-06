
import React from 'react';
import { motion } from "framer-motion";
import { EnhancedFamilyNextStepsPanel } from "@/components/family/EnhancedFamilyNextStepsPanel";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function CareJourneyProgressPage() {
  const breadcrumbItems = [
    { label: "Family Dashboard", href: "/dashboard/family" },
    { label: "Care Journey Progress", href: "/family/care-journey-progress" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Enhanced Journey Progress Panel - Full Version */}
          <EnhancedFamilyNextStepsPanel showAllSteps={true} />
        </motion.div>
      </div>
    </div>
  );
}
