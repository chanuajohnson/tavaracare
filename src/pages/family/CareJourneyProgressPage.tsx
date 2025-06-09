
import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { EnhancedFamilyNextStepsPanel } from "@/components/family/EnhancedFamilyNextStepsPanel";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function CareJourneyProgressPage() {
  const breadcrumbItems = [
    { label: "Family Dashboard", href: "/dashboard/family" },
    { label: "Care Journey Progress", href: "/family/care-journey-progress" }
  ];

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mobile-viewport-fix">
      <div className="mobile-container mobile-header-spacing mobile-footer-spacing py-4 sm:py-6 lg:py-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mobile-optimized"
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
