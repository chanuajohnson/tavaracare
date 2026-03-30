
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfessionalScreeningPanel } from '@/components/admin/ProfessionalScreeningPanel';

export default function ProfessionalScreeningPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Admin Dashboard", path: "/dashboard/admin" },
          { label: "Caregiver Screening", path: "/admin/caregiver-screening" }
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Caregiver Screening</h1>
        <p className="text-muted-foreground mb-8">
          Manage professional references, schedule head nurse interviews, and record screening outcomes.
        </p>
        <ProfessionalScreeningPanel />
      </div>
    </div>
  );
}
