
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FamilyProfileHeaderSection } from "./FamilyProfileHeaderSection";
import { EnhancedFamilyNextStepsPanel } from "./EnhancedFamilyNextStepsPanel";
import { DashboardCaregiverMatches } from "./DashboardCaregiverMatches";
import { FamilyShortcutMenuBar } from "./FamilyShortcutMenuBar";
import { TellTheirStoryCard } from "./TellTheirStoryCard";

export const FamilyDashboard = () => {
  return (
    <div className="mobile-container mobile-viewport-fix">
      <div className="mobile-card-spacing">
        {/* Profile Header */}
        <FamilyProfileHeaderSection />
        
        {/* Shortcut Menu Bar */}
        <FamilyShortcutMenuBar />
        
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
