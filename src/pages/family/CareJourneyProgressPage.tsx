
import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { EnhancedFamilyNextStepsPanel } from "@/components/family/EnhancedFamilyNextStepsPanel";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function CareJourneyProgressPage() {
  const breadcrumbItems = [
    { label: "Family Dashboard", href: "/dashboard/family" },
    { label: "Care Journey Progress", href: "/family/care-journey-progress" }
  ];

  // Enhanced hash navigation with multiple retry attempts
  useEffect(() => {
    const scrollToElement = (elementId: string, attempt: number = 1) => {
      console.log(`[CareJourneyProgress] Scroll attempt ${attempt} for element: ${elementId}`);
      
      const element = document.getElementById(elementId);
      if (element) {
        console.log(`[CareJourneyProgress] Element found on attempt ${attempt}, scrolling...`);
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        return true; // Success
      } else {
        console.log(`[CareJourneyProgress] Element not found on attempt ${attempt}`);
        return false; // Element not found
      }
    };

    const handleHashNavigation = () => {
      const hash = window.location.hash;
      console.log(`[CareJourneyProgress] Hash navigation triggered: ${hash}`);
      
      if (hash) {
        const elementId = hash.substring(1);
        console.log(`[CareJourneyProgress] Looking for element with ID: ${elementId}`);
        
        // Multiple retry attempts with increasing delays
        const retryAttempts = [100, 300, 500, 1000, 1500];
        
        retryAttempts.forEach((delay, index) => {
          setTimeout(() => {
            const success = scrollToElement(elementId, index + 1);
            if (success) {
              console.log(`[CareJourneyProgress] Successfully scrolled to ${elementId} on attempt ${index + 1}`);
            } else if (index === retryAttempts.length - 1) {
              console.warn(`[CareJourneyProgress] Failed to find element ${elementId} after all attempts`);
              // Log all available elements with IDs for debugging
              const allElementsWithIds = document.querySelectorAll('[id]');
              console.log('[CareJourneyProgress] Available elements with IDs:', 
                Array.from(allElementsWithIds).map(el => el.id));
            }
          }, delay);
        });
      } else {
        console.log('[CareJourneyProgress] No hash, scrolling to top');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Handle initial load with a small delay to ensure component is mounted
    setTimeout(handleHashNavigation, 50);

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
