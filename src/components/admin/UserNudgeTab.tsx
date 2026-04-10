import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquare, ExternalLink, Plus, Send, Sparkles, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { ComprehensiveUserData } from '@/hooks/admin/useComprehensiveUserData';

interface NudgeTemplate {
  id: string;
  name: string;
  stage: string;
  role: string;
  message_template: string;
  message_type: string;
}

interface ProfessionalStepInfo {
  id: number;
  title: string;
  completed: boolean;
  link: string;
  stage: string;
}

interface UserNudgeTabProps {
  user: {
    id: string;
    full_name: string;
    role: string;
    phone_number?: string;
  };
  journeyProgress: {
    completionPercentage: number;
    currentStep?: number;
    steps?: Array<{ completed: boolean; id?: number | string; title?: string; link?: string; stage?: string }>;
    lastActivityAt?: string;
  };
  comprehensiveData?: ComprehensiveUserData | null;
}

interface IncompleteField {
  field: string;
  label: string;
  reason: string;
  source: 'profile' | 'assessment';
}

const populateTemplate = (
  template: string,
  userName: string,
  completionPercentage: number,
  role: string
): string => {
  const firstName = userName?.split(' ')[0] || 'there';
  return template
    .replace(/\[Name\]/g, firstName)
    .replace(/\[X\]/g, String(Math.round(completionPercentage)))
    .replace(/\[Role\]/g, role || 'user');
};

const getWhatsAppUrl = (phone: string, message: string): string => {
  let cleaned = (phone || '').replace(/[^\d]/g, '');
  if (cleaned.length === 7) cleaned = '1868' + cleaned;
  else if (cleaned.length === 10) cleaned = '1' + cleaned;
  else if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  return `https://api.whatsapp.com/send/?phone=${cleaned}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
};

const getTavaraWhatsAppUrl = (message: string): string => {
  return `https://api.whatsapp.com/send/?phone=18687865357&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
};

const getDaysBetween = (dateStr: string): number => {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

interface NudgeAlertInfo {
  variant: 'destructive' | 'warning' | 'success';
  icon: React.ReactNode;
  title: string;
  description: string;
}

const getNudgeAlertInfo = (
  lastNudgedAt: string | null,
  lastActivityAt: string | undefined
): NudgeAlertInfo => {
  const daysSinceNudge = lastNudgedAt ? getDaysBetween(lastNudgedAt) : null;
  const daysSinceActivity = lastActivityAt ? getDaysBetween(lastActivityAt) : null;

  if (daysSinceActivity !== null && daysSinceActivity >= 3 && (daysSinceNudge === null || daysSinceNudge >= 7)) {
    return {
      variant: 'destructive',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: `Inactive ${daysSinceActivity} day${daysSinceActivity !== 1 ? 's' : ''}${daysSinceNudge === null ? ', never nudged' : `, last nudged ${daysSinceNudge} days ago`}`,
      description: 'Action recommended — consider sending a nudge to re-engage this user.',
    };
  }

  if (daysSinceNudge === null) {
    return {
      variant: 'destructive',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Never been nudged',
      description: 'This user has never received a nudge — consider sending a message.',
    };
  }

  if (daysSinceNudge >= 7) {
    return {
      variant: 'warning' as 'destructive',
      icon: <Clock className="h-4 w-4" />,
      title: `Last nudged ${daysSinceNudge} days ago`,
      description: 'It has been a while since this user was contacted.',
    };
  }

  return {
    variant: 'success' as 'destructive',
    icon: <CheckCircle className="h-4 w-4" />,
    title: `Last nudged ${daysSinceNudge} day${daysSinceNudge !== 1 ? 's' : ''} ago`,
    description: 'Recently contacted — no immediate action needed.',
  };
};

// --- Smart Completion Nudge Logic ---

const getIncompleteFields = (
  profile: any,
  careNeeds: any,
  role: string
): IncompleteField[] => {
  const fields: IncompleteField[] = [];

  if (role !== 'family') return fields;

  // Profile fields
  if (!profile?.phone_number) {
    fields.push({ field: 'phone_number', label: 'Phone number', reason: 'so we can reach you quickly', source: 'profile' });
  }
  if (!profile?.address && !profile?.location) {
    fields.push({ field: 'address', label: 'Location/address', reason: 'to find caregivers near you', source: 'profile' });
  }
  if (!profile?.care_recipient_name) {
    fields.push({ field: 'care_recipient_name', label: "Care recipient's name", reason: 'essential for personalizing care', source: 'profile' });
  }
  if (!profile?.relationship) {
    fields.push({ field: 'relationship', label: 'Relationship to care recipient', reason: 'helps us understand your situation', source: 'profile' });
  }
  if (!profile?.care_types || (Array.isArray(profile.care_types) && profile.care_types.length === 0)) {
    fields.push({ field: 'care_types', label: 'Types of care needed', reason: 'critical for matching specializations', source: 'profile' });
  }
  if (!profile?.care_schedule) {
    fields.push({ field: 'care_schedule', label: 'Preferred care schedule', reason: 'helps us match caregiver availability', source: 'profile' });
  }
  if (!profile?.budget_preferences) {
    fields.push({ field: 'budget_preferences', label: 'Budget range', reason: 'ensures we recommend the right fit', source: 'profile' });
  }
  if (!profile?.care_schedule || (typeof profile.care_schedule === 'string' && profile.care_schedule.trim() === '')) {
    fields.push({ field: 'care_schedule', label: 'Preferred care schedule', reason: 'helps us match caregiver availability', source: 'profile' });
  }
  if (!profile?.care_urgency) {
    fields.push({ field: 'care_urgency', label: 'How soon you need care', reason: 'helps us prioritize your match', source: 'profile' });
  }
  if (!profile?.matching_requirements) {
    fields.push({ field: 'matching_requirements', label: 'Deal breakers / requirements', reason: 'prevents mismatches', source: 'profile' });
  }

  // Care assessment fields (only fields that actually exist on the care assessment form)
  if (careNeeds) {
    if (!careNeeds.chronic_illness_type) {
      fields.push({ field: 'chronic_illness_type', label: 'Chronic illness details', reason: 'critical for caregiver preparedness', source: 'assessment' });
    }
    if (!careNeeds.diagnosed_conditions) {
      fields.push({ field: 'diagnosed_conditions', label: 'Diagnosed conditions', reason: 'essential for safe and informed care', source: 'assessment' });
    }
    if (!careNeeds.known_allergies) {
      fields.push({ field: 'known_allergies', label: 'Known allergies', reason: 'critical for medication and meal safety', source: 'assessment' });
    }
    if (!careNeeds.emergency_plan) {
      fields.push({ field: 'emergency_plan', label: 'Emergency plan', reason: 'ensures caregiver knows what to do in an emergency', source: 'assessment' });
    }
    if (!careNeeds.triggers_soothing_techniques) {
      fields.push({ field: 'triggers_soothing_techniques', label: 'Triggers & soothing techniques', reason: 'helps caregiver manage difficult moments', source: 'assessment' });
    }
    if (!careNeeds.cultural_preferences) {
      fields.push({ field: 'cultural_preferences', label: 'Cultural preferences', reason: 'ensures a comfortable care environment', source: 'assessment' });
    }
    if (!careNeeds.additional_notes) {
      fields.push({ field: 'additional_notes', label: 'Additional care notes', reason: 'gives caregivers important context', source: 'assessment' });
    }
  } else {
    // No care assessment at all
    fields.push({ field: 'care_assessment', label: 'Care needs assessment', reason: 'essential for proper caregiver matching', source: 'assessment' });
  }

  return fields;
};

const buildSmartNudgeMessage = (
  userName: string,
  incompleteFields: IncompleteField[]
): string => {
  const firstName = userName?.split(' ')[0] || 'there';
  const profileFields = incompleteFields.filter(f => f.source === 'profile');
  const assessmentFields = incompleteFields.filter(f => f.source === 'assessment');

  let message = `Hi ${firstName}! 💙 Chan from Tavara Care.\n\n`;
  message += `We're actively working on finding the right caregiver match for you, but we noticed a few important details are still missing from your profile:\n\n`;

  for (const field of incompleteFields) {
    message += `❌ ${field.label} — ${field.reason}\n`;
  }

  message += `\nThese details are essential for us to source and match you with the best caregiver. The more complete your profile, the faster and more accurate your match will be!\n\n`;

  if (profileFields.length > 0) {
    message += `🔗 Update your profile: https://tavaracare.lovable.app/dashboard/family\n`;
  }
  if (assessmentFields.length > 0) {
    message += `🔗 Complete care assessment: https://tavaracare.lovable.app/family/care-assessment?mode=edit\n`;
  }

  message += `\nQuestions? Just reply here!\n— Chan, Tavara Care 💙`;

  return message;
};

// --- Professional Progress Nudge Logic ---

const STAGE_LABELS: Record<string, string> = {
  foundation: '🏗️ Foundation',
  qualification: '📜 Qualification',
  vetting: '🔍 Vetting',
  active: '🤝 Active',
  training: '📚 Training',
};

const getProfessionalProgressSummary = (
  steps: Array<{ completed: boolean; title?: string; link?: string; stage?: string }>
) => {
  const completedSteps = steps.filter(s => s.completed);
  const pendingSteps = steps.filter(s => !s.completed);
  const nextStep = pendingSteps[0] || null;
  return { completedSteps, pendingSteps, nextStep };
};

const buildProfessionalNudgeMessage = (
  userName: string,
  steps: Array<{ completed: boolean; title?: string; link?: string; stage?: string }>
): string => {
  const firstName = userName?.split(' ')[0] || 'there';
  const { completedSteps, pendingSteps, nextStep } = getProfessionalProgressSummary(steps);

  let message = `Hi ${firstName}! 💙 Chan from Tavara Care.\n\n`;
  message += `Great progress on your caregiver journey! Here's where you stand:\n\n`;

  for (const step of completedSteps) {
    message += `✅ ${step.title || 'Step complete'}\n`;
  }

  if (pendingSteps.length > 0) {
    message += `\n📋 What's next:\n`;
    for (const step of pendingSteps) {
      message += `❌ ${step.title || 'Pending step'}\n`;
    }
  }

  if (nextStep) {
    message += `\n👉 Your next step: ${nextStep.title}`;
    if (nextStep.link) {
      message += `\n🔗 https://tavara.care${nextStep.link}`;
    }
  }

  message += `\n\nQuestions? Just reply here!\n— Chan, Tavara Care 💙`;
  return message;
};

const buildScreeningCompleteNudge = (userName: string): string => {
  const firstName = userName?.split(' ')[0] || 'there';
  return `Hi ${firstName}! 💙 Chan from Tavara Care.

🎉 Congratulations! You've successfully completed your screening process!

We'd like to move forward and place you with a family who needs your skills. Here's what happens next:

✅ Your screening is complete
📋 We're matching you with a care team
📞 We'll schedule a brief call to confirm your availability and start date

Could you please confirm:
1. Are you still available to start?
2. Any schedule preferences or constraints?

We're excited to have you on board!
— Chan, Tavara Care 💙`;
};

const buildCaregiverFoundNudge = (userName: string): string => {
  const firstName = userName?.split(' ')[0] || 'there';
  return `Hi ${firstName}! 💙 Chan from Tavara Care.

Great news! 🎉 We've identified a nurse and care team for your loved one's home care.

Here's what happens next:
📞 We'd like to schedule a brief phone call or video conference with you
📋 We'll discuss the care team, confirm the care schedule, and agree on a start date
💙 Your input is essential to making sure everything is a perfect fit

Could you let us know:
1. Your preferred time for a call this week?
2. Would you prefer a phone call or video conference?

We're so close to getting your family the support they need!
— Chan, Tavara Care 💙`;
};

const buildOnboardingNudge = (userName: string): string => {
  const firstName = userName?.split(' ')[0] || 'there';
  return `Hi ${firstName}! 💙 Chan from Tavara Care.

📋 *Your Onboarding Package — Job Description & Requirements*

We're thrilled to welcome you to the Tavara Care team! Here's everything you need to know about your role:

💰 *Rate Tiers*
• Standard: $35/hr — GAPP-certified personal care, medication admin & logging, vitals monitoring, basic daily dietary meal prep, daily care documentation, specialized care (dementia, palliative, post-surgical)
• Full Service: $40/hr — Everything in Standard + specialist-directed meal prep (holidays & special occasions), complex medical needs (wound/catheter/oxygen), overnight/live-in, advanced certifications (RN, LPN), behavioral health
• Premium: $45+/hr — Everything in Full Service + care plan change management, disease progression support, multi-specialist coordination, 24/7 on-call, advanced palliative/end-of-life, family training & transition planning
Your tier will be confirmed based on experience, certifications, and assignment complexity.

👥 *Team Structure*
• You'll serve as the *main nurse* for an assigned home
• A team of fill-in nurses will support in case of emergencies, appointments, or personal needs
• Early rotation period: all team members will rotate to familiarize with the home and operations
• You remain the primary nurse until otherwise decided

📝 *Probationary Period*
• Performance review period before formalization as part of the Tavara Care nurse body
• We'll evaluate quality of care, communication, and reliability

📊 *Daily Log Requirements (Mandatory)*
• Written daily care log — not verbal only
• Completed via the Tavara platform (accessible to all team nurses)
• Covers: vitals, care tasks, meals, medications, observations, incidents

💬 *WhatsApp Care Group*
• A dedicated WhatsApp group will be created for each home
• Used for daily logs, shift handoff briefings, and team coordination
• Active participation is required

🩺 *Job Responsibilities (GAPP Standards)*
✅ Personal care: bathing, dressing, grooming, oral care, incontinence care
✅ Vital signs: blood pressure, temperature, pulse monitoring
✅ Mobility: transfers, walking assistance, prescribed exercises
✅ Nutrition: meal planning, preparation, feeding assistance
✅ Medication: filling trays under supervision, administration tracking
✅ Housekeeping: patient area sanitation, room tidying, laundry
✅ Medical appointments: accompaniment and rehab support
✅ Companionship: social support, mental stimulation, games
✅ Documentation: daily logs, incident reports, care plan updates

🌟 *Professional Standards*
Patience • Compassion • Confidentiality • Collaborative work with families and health professionals

📚 *Resources*
• Nurse Handbook & SOP: tavara.care/documents/Tavara_Nurse_Handbook.pdf
• Daily Care Checklist: tavara.care/documents/Tavara_Daily_Checklist.pdf

Please review everything and let me know if you have any questions!
— Chan, Tavara Care 💙`;
};

// --- Component ---

export const UserNudgeTab: React.FC<UserNudgeTabProps> = ({ user, journeyProgress, comprehensiveData }) => {
  const [templates, setTemplates] = useState<NudgeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastNudgedAt, setLastNudgedAt] = useState<string | null>(null);
  const [lastActivityAt, setLastActivityAt] = useState<string | undefined>(journeyProgress.lastActivityAt);
  const [nudgeLoading, setNudgeLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
    fetchLastNudged();
    if (!journeyProgress.lastActivityAt) {
      fetchLastActivity();
    }
  }, [user.id, user.role]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nudge_templates')
        .select('*')
        .eq('role', user.role)
        .order('stage', { ascending: true });

      if (error) throw error;
      setTemplates((data || []) as NudgeTemplate[]);
    } catch (err) {
      console.error('Error fetching nudge templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastNudged = async () => {
    setNudgeLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_communications')
        .select('sent_at')
        .eq('target_user_id', user.id)
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      setLastNudgedAt(data && data.length > 0 ? data[0].sent_at : null);
    } catch (err) {
      console.error('Error fetching last nudge:', err);
    } finally {
      setNudgeLoading(false);
    }
  };

  const fetchLastActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('user_journey_progress')
        .select('last_activity_at')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!error && data?.last_activity_at) {
        setLastActivityAt(data.last_activity_at);
      }
    } catch (err) {
      console.error('Error fetching last activity:', err);
    }
  };

  const logNudgeSent = async (templateId?: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const adminId = sessionData?.session?.user?.id;
      if (!adminId) {
        console.error('Cannot log nudge: admin session not found');
        toast.error('Nudge logging failed — admin session not found. Please re-login.');
        return;
      }

      const { error } = await supabase.from('admin_communications').insert({
        admin_id: adminId,
        target_user_id: user.id,
        message_type: 'whatsapp',
        template_id: templateId || null,
        sent_at: new Date().toISOString(),
        delivery_status: 'sent',
      });

      if (error) {
        console.error('Error logging nudge:', error);
        toast.error(`Nudge logging failed: ${error.message}`);
      } else {
        setLastNudgedAt(new Date().toISOString());
      }
    } catch (err: any) {
      console.error('Error logging nudge:', err);
      toast.error(`Nudge logging failed: ${err.message || 'Unknown error'}`);
    }
  };

  const completedCount = journeyProgress.steps?.filter(s => s.completed).length || 0;
  const currentStepNum = journeyProgress.currentStep || completedCount + 1;

  const currentStageKey = `step_${currentStepNum}`;
  const nextStageKey = `step_${currentStepNum + 1}`;

  const recommended = templates.filter(t =>
    t.stage === currentStageKey ||
    t.stage === nextStageKey ||
    t.stage === 'stalled' ||
    t.stage === 're_engagement' ||
    t.stage === 'budget_update'
  );

  const others = templates.filter(t => !recommended.includes(t));

  const handleSendWhatsApp = (template: NudgeTemplate) => {
    const populated = populateTemplate(
      template.message_template,
      user.full_name,
      journeyProgress.completionPercentage,
      user.role
    );

    const url = user.phone_number
      ? getWhatsAppUrl(user.phone_number, populated)
      : getTavaraWhatsAppUrl(populated);

    window.open(url, '_blank');
    logNudgeSent(template.id);
    toast.success('WhatsApp opened & nudge logged');
  };

  // Smart nudge logic
  const incompleteFields = comprehensiveData
    ? getIncompleteFields(comprehensiveData.profile, comprehensiveData.careNeeds, user.role)
    : [];

  const handleSendSmartNudge = () => {
    const message = buildSmartNudgeMessage(user.full_name, incompleteFields);

    const url = user.phone_number
      ? getWhatsAppUrl(user.phone_number, message)
      : getTavaraWhatsAppUrl(message);

    window.open(url, '_blank');
    logNudgeSent();
    toast.success('Smart nudge sent & logged');
  };

  // Professional progress nudge logic
  const professionalSteps = user.role === 'professional' ? (journeyProgress.steps || []) : [];
  const professionalSummary = user.role === 'professional' ? getProfessionalProgressSummary(professionalSteps) : null;

  const handleSendProfessionalProgressNudge = () => {
    const message = buildProfessionalNudgeMessage(user.full_name, professionalSteps);
    const url = user.phone_number
      ? getWhatsAppUrl(user.phone_number, message)
      : getTavaraWhatsAppUrl(message);
    window.open(url, '_blank');
    logNudgeSent();
    toast.success('Professional progress nudge sent & logged');
  };

  const handleSendScreeningCompleteNudge = () => {
    const message = buildScreeningCompleteNudge(user.full_name);
    const url = user.phone_number
      ? getWhatsAppUrl(user.phone_number, message)
      : getTavaraWhatsAppUrl(message);
    window.open(url, '_blank');
    logNudgeSent();
    toast.success('Screening complete nudge sent & logged');
  };

  const handleSendCaregiverFoundNudge = () => {
    const message = buildCaregiverFoundNudge(user.full_name);
    const url = user.phone_number
      ? getWhatsAppUrl(user.phone_number, message)
      : getTavaraWhatsAppUrl(message);
    window.open(url, '_blank');
    logNudgeSent();
    toast.success('Caregiver found nudge sent & logged');
  };

  const handleSendOnboardingNudge = () => {
    const message = buildOnboardingNudge(user.full_name);
    const url = user.phone_number
      ? getWhatsAppUrl(user.phone_number, message)
      : getTavaraWhatsAppUrl(message);
    window.open(url, '_blank');
    logNudgeSent();
    toast.success('Onboarding & job description nudge sent & logged');
  };

  const renderTemplateCard = (template: NudgeTemplate, isRecommended: boolean) => {
    const populated = populateTemplate(
      template.message_template,
      user.full_name,
      journeyProgress.completionPercentage,
      user.role
    );

    return (
      <Card key={template.id} className={isRecommended ? 'border-primary/30 bg-primary/5' : ''}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isRecommended && <Sparkles className="h-4 w-4 text-primary shrink-0" />}
              <span className="font-medium text-sm truncate">{template.name}</span>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {template.stage}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-4">
            {populated}
          </p>

          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleSendWhatsApp(template)}
          >
            <Send className="h-3.5 w-3.5" />
            Send via WhatsApp
          </Button>
        </CardContent>
      </Card>
    );
  };

  const alertInfo = getNudgeAlertInfo(lastNudgedAt, lastActivityAt);

  const getAlertClassName = () => {
    if (alertInfo.variant === 'destructive') return 'border-destructive/50 text-destructive [&>svg]:text-destructive';
    if ((alertInfo.variant as string) === 'warning') return 'border-amber-500/50 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 [&>svg]:text-amber-600';
    return 'border-green-500/50 bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-400 [&>svg]:text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Loading nudge templates...
      </div>
    );
  }

  if (templates.length === 0 && incompleteFields.length === 0 && professionalSteps.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No nudge templates found for <span className="font-medium capitalize">{user.role}</span> users.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/admin/whatsapp-nudge')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Smart nudge alert */}
      {!nudgeLoading && (
        <Alert className={getAlertClassName()}>
          {alertInfo.icon}
          <AlertTitle className="text-sm">{alertInfo.title}</AlertTitle>
          <AlertDescription className="text-xs">
            {alertInfo.description}
          </AlertDescription>
        </Alert>
      )}

      {/* User context */}
      <div className="text-xs text-muted-foreground">
        {user.full_name} is at step {currentStepNum} ({Math.round(journeyProgress.completionPercentage)}% complete)
        {user.phone_number ? ` • ${user.phone_number}` : ' • No phone number on file'}
      </div>

      {/* Smart Completion Nudge — only for family users */}
      {user.role === 'family' && (
        <>
          {!comprehensiveData ? (
            <Card className="border-muted">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground animate-pulse" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Analyzing profile completeness...
                  </span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ) : incompleteFields.length > 0 ? (
            <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-sm text-amber-800 dark:text-amber-300">
                      Smart Completion Nudge
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-700 dark:text-amber-400">
                    {incompleteFields.length} missing field{incompleteFields.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-1">
                  {incompleteFields.filter(f => f.source === 'profile').length > 0 && (
                    <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-1">Profile Registration:</div>
                  )}
                  {incompleteFields.filter(f => f.source === 'profile').map((field) => (
                    <div key={field.field} className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300 pl-2">
                      <span>❌</span>
                      <span>
                        <strong>{field.label}</strong> — {field.reason}
                      </span>
                    </div>
                  ))}
                  {incompleteFields.filter(f => f.source === 'assessment').length > 0 && (
                    <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-2">Care Assessment:</div>
                  )}
                  {incompleteFields.filter(f => f.source === 'assessment').map((field) => (
                    <div key={field.field} className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300 pl-2">
                      <span>❌</span>
                      <span>
                        <strong>{field.label}</strong> — {field.reason}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleSendSmartNudge}
                >
                  <Send className="h-3.5 w-3.5" />
                  Send Smart Completion Nudge via WhatsApp
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm text-green-800 dark:text-green-300">
                    Profile & assessment fully complete ✓
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Caregiver Found Nudge — for family users */}
      {user.role === 'family' && (
        <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm text-blue-800 dark:text-blue-300">
                🏥 Caregiver Found — Send Update
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Inform the family that a nurse/care team has been identified and propose a phone call or video conference to discuss next steps and start date.
            </p>
            <Button
              size="sm"
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSendCaregiverFoundNudge}
            >
              <Send className="h-3.5 w-3.5" />
              Send Caregiver Found Update via WhatsApp
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Smart Progress Nudge — professional users */}
      {user.role === 'professional' && professionalSummary && (
        <>
          {professionalSteps.length === 0 ? (
            <Card className="border-muted">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground animate-pulse" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Loading professional progress...
                  </span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ) : professionalSummary.pendingSteps.length > 0 ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      Professional Progress Nudge
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {professionalSummary.completedSteps.length}/{professionalSteps.length} steps
                  </Badge>
                </div>

                {/* Group by stage */}
                {Object.entries(STAGE_LABELS).map(([stageKey, stageLabel]) => {
                  const stageSteps = professionalSteps.filter(s => s.stage === stageKey);
                  if (stageSteps.length === 0) return null;
                  return (
                    <div key={stageKey}>
                      <div className="text-xs font-medium text-muted-foreground mt-1 mb-0.5">{stageLabel}</div>
                      {stageSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs pl-2">
                          <span>{step.completed ? '✅' : '❌'}</span>
                          <span className={step.completed ? 'text-muted-foreground' : ''}>
                            {step.title || `Step ${i + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {professionalSummary.nextStep && (
                  <div className="text-xs bg-muted/50 rounded p-2 mt-1">
                    👉 <strong>Next step:</strong> {professionalSummary.nextStep.title}
                    {professionalSummary.nextStep.link && (
                      <span className="text-muted-foreground ml-1">
                        → tavara.care{professionalSummary.nextStep.link}
                      </span>
                    )}
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleSendProfessionalProgressNudge}
                >
                  <Send className="h-3.5 w-3.5" />
                  Send Progress Nudge via WhatsApp
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm text-green-800 dark:text-green-300">
                      🎉 Screening Complete — Send Next Steps
                    </span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    All professional steps are complete. Send a congratulatory nudge with next steps about care team placement and availability confirmation.
                  </p>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSendScreeningCompleteNudge}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Screening Complete Nudge via WhatsApp
                  </Button>
                </CardContent>
              </Card>

              {/* Onboarding & Job Description Nudge */}
              <Card className="border-purple-500/50 bg-purple-50 dark:bg-purple-950/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm text-purple-800 dark:text-purple-300">
                      📋 Onboarding & Job Description
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-400">
                    Send starting rate, team structure, probationary period, daily log requirements, and full job responsibilities based on GAPP standards. Includes links to Nurse Handbook & Daily Checklist.
                  </p>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleSendOnboardingNudge}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Onboarding Package via WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}


      {recommended.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Recommended for this stage
          </h4>
          <div className="grid gap-2">
            {recommended.map(t => renderTemplateCard(t, true))}
          </div>
        </div>
      )}

      {/* Other templates */}
      {others.length > 0 && (
        <div className="space-y-2">
          {recommended.length > 0 && <Separator />}
          <h4 className="text-sm font-medium">All {user.role} templates</h4>
          <div className="grid gap-2">
            {others.map(t => renderTemplateCard(t, false))}
          </div>
        </div>
      )}

      {/* Footer links */}
      <Separator />
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs"
          onClick={() => navigate('/admin/whatsapp-nudge')}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Manage All Templates
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs"
          onClick={() => navigate('/admin/whatsapp-nudge')}
        >
          <Plus className="h-3.5 w-3.5" />
          Create Template
        </Button>
      </div>
    </div>
  );
};
