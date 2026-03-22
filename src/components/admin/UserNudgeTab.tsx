import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquare, ExternalLink, Plus, Send, Sparkles, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NudgeTemplate {
  id: string;
  name: string;
  stage: string;
  role: string;
  message_template: string;
  message_type: string;
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
    steps?: Array<{ completed: boolean }>;
    lastActivityAt?: string;
  };
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

  // Inactive 3+ days AND not nudged in 7+ days (or never)
  if (daysSinceActivity !== null && daysSinceActivity >= 3 && (daysSinceNudge === null || daysSinceNudge >= 7)) {
    return {
      variant: 'destructive',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: `Inactive ${daysSinceActivity} day${daysSinceActivity !== 1 ? 's' : ''}${daysSinceNudge === null ? ', never nudged' : `, last nudged ${daysSinceNudge} days ago`}`,
      description: 'Action recommended — consider sending a nudge to re-engage this user.',
    };
  }

  // Never nudged
  if (daysSinceNudge === null) {
    return {
      variant: 'destructive',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Never been nudged',
      description: 'This user has never received a nudge — consider sending a message.',
    };
  }

  // Last nudged 7+ days ago
  if (daysSinceNudge >= 7) {
    return {
      variant: 'warning' as 'destructive', // will style via className
      icon: <Clock className="h-4 w-4" />,
      title: `Last nudged ${daysSinceNudge} days ago`,
      description: 'It has been a while since this user was contacted.',
    };
  }

  // Recently nudged
  return {
    variant: 'success' as 'destructive', // will style via className
    icon: <CheckCircle className="h-4 w-4" />,
    title: `Last nudged ${daysSinceNudge} day${daysSinceNudge !== 1 ? 's' : ''} ago`,
    description: 'Recently contacted — no immediate action needed.',
  };
};

export const UserNudgeTab: React.FC<UserNudgeTabProps> = ({ user, journeyProgress }) => {
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

  const logNudgeSent = async (templateId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const adminId = sessionData?.session?.user?.id;
      if (!adminId) return;

      const { error } = await supabase.from('admin_communications').insert({
        admin_id: adminId,
        target_user_id: user.id,
        message_type: 'whatsapp_nudge',
        template_id: templateId,
        sent_at: new Date().toISOString(),
        delivery_status: 'sent',
      });

      if (error) {
        console.error('Error logging nudge:', error);
      } else {
        // Update local state so alert refreshes immediately
        setLastNudgedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error('Error logging nudge:', err);
    }
  };

  // Determine current step from journey progress
  const completedCount = journeyProgress.steps?.filter(s => s.completed).length || 0;
  const currentStepNum = journeyProgress.currentStep || completedCount + 1;

  // Split into recommended vs other
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

    // Log the nudge send
    logNudgeSent(template.id);
    toast.success('WhatsApp opened & nudge logged');
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

  // Smart alert
  const alertInfo = getNudgeAlertInfo(lastNudgedAt, journeyProgress.lastActivityAt);

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

  if (templates.length === 0) {
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

      {/* Recommended templates */}
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
