import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, ExternalLink, Plus, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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

export const UserNudgeTab: React.FC<UserNudgeTabProps> = ({ user, journeyProgress }) => {
  const [templates, setTemplates] = useState<NudgeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [user.role]);

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

    // If user has a phone number, send directly to them; otherwise use Tavara number
    const url = user.phone_number
      ? getWhatsAppUrl(user.phone_number, populated)
      : getTavaraWhatsAppUrl(populated);

    window.open(url, '_blank');
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
