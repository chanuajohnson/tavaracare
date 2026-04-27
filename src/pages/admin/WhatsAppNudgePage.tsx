
import React from 'react';
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { WhatsAppTemplateManager } from '@/components/admin/WhatsAppTemplateManager';

export default function WhatsAppNudgePage() {
  const breadcrumbItems = [
    { label: "Admin Dashboard", href: "/dashboard/admin" },
    { label: "WhatsApp Nudge System", href: "/admin/whatsapp-nudge" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />
        <h1 className="text-3xl font-bold mb-2">WhatsApp Nudge System</h1>
        <p className="text-muted-foreground">
          Create and manage contextual WhatsApp message templates for user engagement.
        </p>
      </div>
      
      <WhatsAppTemplateManager />
    </div>
  );
}
