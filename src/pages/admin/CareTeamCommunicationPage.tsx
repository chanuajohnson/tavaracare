
import React from 'react';
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CareTeamCommunicationManager } from '@/components/admin/CareTeamCommunicationManager';

export default function CareTeamCommunicationPage() {
  const breadcrumbItems = [
    { label: "Admin Dashboard", href: "/dashboard/admin" },
    { label: "Care Team Communications", href: "/admin/care-team-communication" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />
        <h1 className="text-3xl font-bold mb-2">Care Team Communications</h1>
        <p className="text-muted-foreground">
          Manage schedule updates and emergency coverage alerts for care teams.
        </p>
      </div>
      
      <CareTeamCommunicationManager />
    </div>
  );
}
