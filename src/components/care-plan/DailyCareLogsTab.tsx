import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ClipboardCheck, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CHECKLIST_SECTIONS } from '@/components/professional/checklist/checklistSections';

interface DailyCareLogsTabProps {
  carePlanId: string;
}

interface CareLog {
  id: string;
  professional_id: string;
  client_name: string | null;
  shift_date: string;
  shift_type: string | null;
  checklist_data: Record<string, any>;
  notes: string | null;
  time_in: string | null;
  time_out: string | null;
  created_at: string;
  updated_at: string;
}

interface LogFeedback {
  id: string;
  log_id: string;
  family_id: string;
  comment: string;
  created_at: string;
}

export const DailyCareLogsTab = ({ carePlanId }: DailyCareLogsTabProps) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [feedback, setFeedback] = useState<Record<string, LogFeedback[]>>({});
  const [nurseNames, setNurseNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [carePlanId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_care_logs')
        .select('*')
        .eq('care_plan_id', carePlanId)
        .order('shift_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedLogs = (data || []).map(d => ({
        ...d,
        checklist_data: (d.checklist_data && typeof d.checklist_data === 'object' ? d.checklist_data : {}) as Record<string, any>,
      }));
      setLogs(typedLogs);

      // Fetch nurse names
      const professionalIds = [...new Set(typedLogs.map(l => l.professional_id))];
      if (professionalIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', professionalIds);
        if (profiles) {
          const nameMap: Record<string, string> = {};
          profiles.forEach(p => { nameMap[p.id] = p.full_name || 'Unknown'; });
          setNurseNames(nameMap);
        }
      }

      // Fetch feedback for all logs
      const logIds = typedLogs.map(l => l.id);
      if (logIds.length > 0) {
        const { data: fbData } = await supabase
          .from('daily_care_log_feedback')
          .select('*')
          .in('log_id', logIds)
          .order('created_at', { ascending: true });
        if (fbData) {
          const grouped: Record<string, LogFeedback[]> = {};
          fbData.forEach(fb => {
            if (!grouped[fb.log_id]) grouped[fb.log_id] = [];
            grouped[fb.log_id].push(fb);
          });
          setFeedback(grouped);
        }
      }
    } catch (err) {
      console.error('Error fetching daily care logs:', err);
      toast.error('Failed to load daily care logs');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) next.delete(logId);
      else next.add(logId);
      return next;
    });
  };

  const getCompletionStats = (checklistData: Record<string, any>) => {
    let total = 0;
    let completed = 0;
    CHECKLIST_SECTIONS.forEach(section => {
      const saved = checklistData[section.title];
      if (saved && Array.isArray(saved)) {
        saved.forEach((item: any) => {
          total++;
          if (item.completed) completed++;
        });
      } else {
        total += section.items.length;
      }
    });
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const handleSubmitFeedback = async (logId: string) => {
    const comment = feedbackText[logId]?.trim();
    if (!comment || !user) return;

    setSubmittingFeedback(logId);
    try {
      const { error } = await supabase
        .from('daily_care_log_feedback')
        .insert({
          log_id: logId,
          family_id: user.id,
          comment,
        });
      if (error) throw error;

      toast.success('Feedback submitted');
      setFeedbackText(prev => ({ ...prev, [logId]: '' }));
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading daily care logs...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No Daily Logs Yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Care logs will appear here once your assigned nurse completes their daily checklist.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Daily Care Logs</h2>
        <Badge variant="secondary">{logs.length} log{logs.length !== 1 ? 's' : ''}</Badge>
      </div>

      {logs.map(log => {
        const stats = getCompletionStats(log.checklist_data);
        const isExpanded = expandedLogs.has(log.id);
        const logFeedback = feedback[log.id] || [];

        return (
          <Card key={log.id} className="overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(log.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <div>
                        <CardTitle className="text-base">
                          {log.shift_date} — {nurseNames[log.professional_id] || 'Unknown Nurse'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {log.time_in && log.time_out ? `${log.time_in} – ${log.time_out}` : 'Time not recorded'}
                          {log.shift_type && ` • ${log.shift_type}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {logFeedback.length > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {logFeedback.length}
                        </Badge>
                      )}
                      <Badge variant={stats.percent === 100 ? 'default' : 'secondary'}>
                        {stats.completed}/{stats.total} ({stats.percent}%)
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {/* Checklist Details */}
                  {CHECKLIST_SECTIONS.map(section => {
                    const saved = log.checklist_data[section.title];
                    if (!saved || !Array.isArray(saved)) return null;
                    const sectionCompleted = saved.filter((i: any) => i.completed).length;

                    return (
                      <div key={section.title} className="space-y-1">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          {section.title}
                          <span className="text-xs text-muted-foreground">
                            ({sectionCompleted}/{saved.length})
                          </span>
                        </h4>
                        <div className="pl-4 space-y-0.5">
                          {saved.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span>{item.completed ? '✅' : '❌'}</span>
                              <span className={item.completed ? '' : 'text-muted-foreground'}>
                                {item.task}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Notes */}
                  {log.notes && (
                    <div className="bg-muted/50 rounded-md p-3">
                      <h4 className="text-sm font-medium mb-1">📝 Nurse Notes</h4>
                      <p className="text-sm text-muted-foreground">{log.notes}</p>
                    </div>
                  )}

                  {/* Existing Feedback */}
                  {logFeedback.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Family Feedback
                      </h4>
                      {logFeedback.map(fb => (
                        <div key={fb.id} className="bg-primary/5 border border-primary/10 rounded-md p-3">
                          <p className="text-sm">{fb.comment}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(fb.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Feedback */}
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">Leave Feedback</h4>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment or feedback for this log..."
                        value={feedbackText[log.id] || ''}
                        onChange={e => setFeedbackText(prev => ({ ...prev, [log.id]: e.target.value }))}
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSubmitFeedback(log.id)}
                        disabled={!feedbackText[log.id]?.trim() || submittingFeedback === log.id}
                        className="self-end"
                      >
                        {submittingFeedback === log.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};
