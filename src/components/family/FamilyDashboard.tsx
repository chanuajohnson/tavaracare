
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FamilyProfileHeaderSection } from "./FamilyProfileHeaderSection";
import { EnhancedFamilyNextStepsPanel } from "./EnhancedFamilyNextStepsPanel";
import { DashboardCaregiverMatches } from "./DashboardCaregiverMatches";
import { FamilyShortcutMenuBar } from "./FamilyShortcutMenuBar";
import { TellTheirStoryCard } from "./TellTheirStoryCard";
import { VisitAcceptanceCard } from "./VisitAcceptanceCard";
import { useFamilyProgress } from "@/components/tav/hooks/useFamilyProgress";

export const FamilyDashboard = () => {
  const { visitDetails, onVisitScheduled } = useFamilyProgress();
  
  // Check if there's a scheduled visit that needs user acceptance
  const hasScheduledVisit = visitDetails && visitDetails.is_admin_scheduled;

  return (
    <div className="mobile-container mobile-viewport-fix">
      <div className="mobile-card-spacing">
        {/* Profile Header */}
        <FamilyProfileHeaderSection />
        
        {/* Shortcut Menu Bar */}
        <FamilyShortcutMenuBar />
        
        {/* Visit Acceptance Card - Show prominently when admin has scheduled a visit */}
        {hasScheduledVisit && (
          <div className="mb-6">
            <VisitAcceptanceCard 
              visitDetails={visitDetails}
              onAcceptance={onVisitScheduled}
            />
          </div>
        )}
        
        {/* Enhanced Next Steps Panel - Dashboard Version (Limited Steps) */}
        <EnhancedFamilyNextStepsPanel showAllSteps={false} />
        
        {/* Tell Their Story Card */}
        <TellTheirStoryCard />
        
        {/* Caregiver Matches */}
        <DashboardCaregiverMatches />
      </div>
    </div>
  );
};
