
import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ShiftManagementDashboard } from "@/components/admin/ShiftManagementDashboard";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";

export default function ShiftManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="admin_shift_management_page_view" 
        journeyStage="admin"
      />
      
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Admin Dashboard", path: "/dashboard/admin" },
          { label: "Shift Configuration Management", path: "/admin/shift-management" }
        ]} 
      />
      
      <div className="container max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shift Configuration Management</h1>
          <p className="text-muted-foreground">
            Manage standardized shift options across the entire platform. Changes will automatically update family registration, professional registration, and care plan shift creation.
          </p>
        </div>

        <ShiftManagementDashboard />
      </div>
    </div>
  );
}
