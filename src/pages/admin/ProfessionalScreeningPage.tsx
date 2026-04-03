
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfessionalScreeningPanel } from '@/components/admin/ProfessionalScreeningPanel';
import { ScreeningTemplateBuilder } from '@/components/admin/ScreeningTemplateBuilder';
import { ScreeningSessionManager } from '@/components/admin/ScreeningSessionManager';
import { toast } from 'sonner';

export default function ProfessionalScreeningPage() {
  const handleSendScreening = (candidateId: string, candidateName: string, link: string, phone: string, sessionPosition?: number, totalSessions?: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const positionLine = (sessionPosition && totalSessions)
      ? `\n📋 This is Template ${sessionPosition} of ${totalSessions} — each template covers a different area and will be sent separately.\n`
      : '';
    const message = encodeURIComponent(
      `Hi! It's the Tavara Team 💙\n\nWe'd like you to complete a brief screening questionnaire to help us finalize the evaluation for ${candidateName}.\n${positionLine}\nPlease tap the link below to answer a few quick questions (voice or text):\n${link}\n\nThank you! 🙏`
    );
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success(`WhatsApp opened for ${candidateName} screening`);
  };

  const handleResendScreening = (candidateId: string, candidateName: string, link: string, phone: string, sessionPosition?: number, totalSessions?: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const positionLine = (sessionPosition && totalSessions)
      ? `\n📋 This is Template ${sessionPosition} of ${totalSessions} — each template covers a different area and will be sent separately.\n`
      : '';
    const message = encodeURIComponent(
      `Hi ${candidateName}! It's the Tavara Team 💙\n\nWe'd like to kindly ask you to redo the screening questionnaire. We noticed a few areas we'd love more detail on before we proceed with the next steps.\n${positionLine}\nPlease tap the link below to complete a fresh set of questions (voice or text):\n${link}\n\nThank you for your patience and understanding! 🙏`
    );
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success(`Resubmission nudge sent to ${candidateName}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Admin Dashboard", path: "/dashboard/admin" },
          { label: "Caregiver Screening", path: "/admin/caregiver-screening" }
        ]}
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Caregiver Screening</h1>
          <p className="text-muted-foreground mb-8">
            Manage professional references, schedule head nurse interviews, send voice screening questionnaires, and record outcomes.
          </p>
        </div>

        {/* Voice Screening Sessions */}
        <ScreeningSessionManager onSendScreening={handleSendScreening} onResendScreening={handleResendScreening} />

        {/* Screening Templates */}
        <ScreeningTemplateBuilder />

        {/* Traditional Screening Panel */}
        <ProfessionalScreeningPanel />
      </div>
    </div>
  );
}
