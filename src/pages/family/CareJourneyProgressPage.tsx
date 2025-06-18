
import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { EnhancedFamilyNextStepsPanel } from "@/components/family/EnhancedFamilyNextStepsPanel";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function CareJourneyProgressPage() {
  const breadcrumbItems = [
    { label: "Family Dashboard", href: "/dashboard/family" },
    { label: "Care Journey Progress", href: "/family/care-journey-progress" }
  ];

  // Handle hash navigation and scroll to section
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash) {
        // Remove the # from the hash
        const elementId = hash.substring(1);
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
      } else {
        // Scroll to top if no hash
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Handle initial load
    handleHashNavigation();

    // Handle hash changes (if user navigates using browser back/forward)
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
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
