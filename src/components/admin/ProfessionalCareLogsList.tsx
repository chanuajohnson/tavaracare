import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  MessageSquare,
  Clock,
  Check,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CHECKLIST_SECTIONS } from '@/components/professional/checklist/checklistSections';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { PRODUCTION_BASE_URL } from '@/utils/urlConstants';

interface ProfessionalCareLogsListProps {
  professionalId: string;
  professionalName?: string | null;
}

interface AckRecord {
  id: string;
  log_id: string;
  comment: string;
  author_role: 'family' | 'professional' | 'admin';
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  created_at: string;
}

interface ProfCareLog {
  id: string;
  family_id: string | null;
  care_plan_id: string | null;
  client_name: string | null;
  family_name: string;
  shift_date: string;
  shift_type: string | null;
  time_in: string | null;
  time_out: string | null;
  started_at: string | null;
  last_activity_at: string | null;
  notes: string | null;
  checklist_data: Record<string, any>;
  created_at: string;
  // ack metadata for the caregiver-note itself (mirrored as a synthetic 'professional' feedback row)
  noteAck?: AckRecord | null;
  // related thread (family replies, etc.)
  feedback: AckRecord[];
}

const formatTime = (iso: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return null;
  }
};

const formatDate = (d: string) => {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d;
  }
};

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
};

export const ProfessionalCareLogsList: React.FC<ProfessionalCareLogsListProps> = ({
  professionalId,
  professionalName,
}) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ProfCareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [nudgeDialog, setNudgeDialog] = useState<ProfCareLog | null>(null);
  const [nudgeSending, setNudgeSending] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const sinceStr = since.toISOString().slice(0, 10);

      const { data, error: logsErr } = await supabase
        .from('daily_care_logs')
        .select(
          'id, family_id, care_plan_id, client_name, shift_date, shift_type, time_in, time_out, started_at, last_activity_at, notes, checklist_data, created_at'
        )
        .eq('professional_id', professionalId)
        .gte('shift_date', sinceStr)
        .order('shift_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsErr) throw logsErr;

      const logIds = (data || []).map((l) => l.id);
      const familyIds = [
        ...new Set((data || []).map((l) => l.family_id).filter(Boolean) as string[]),
      ];

      const [profilesRes, feedbackRes] = await Promise.all([
        familyIds.length > 0
          ? supabase.from('profiles').select('id, full_name').in('id', familyIds)
          : Promise.resolve({ data: [] as any[] }),
        logIds.length > 0
          ? supabase
              .from('daily_care_log_feedback')
              .select('id, log_id, comment, author_role, acknowledged_at, acknowledged_by, created_at')
              .in('log_id', logIds)
              .order('created_at', { ascending: true })
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const nameMap: Record<string, string> = {};
      (profilesRes.data || []).forEach((p: any) => {
        nameMap[p.id] = p.full_name || 'Unknown family';
      });

      const feedbackByLog: Record<string, AckRecord[]> = {};
      (feedbackRes.data || []).forEach((fb: any) => {
        if (!feedbackByLog[fb.log_id]) feedbackByLog[fb.log_id] = [];
        feedbackByLog[fb.log_id].push(fb as AckRecord);
      });

      setLogs(
        (data || []).map((l) => {
          const fbList = feedbackByLog[l.id] || [];
          // The "note ack" is the synthetic professional-authored feedback row that mirrors the log note
          const noteAck =
            fbList.find((fb) => fb.author_role === 'professional' && fb.comment === '__note_ack__') ||
            null;
          return {
            id: l.id,
            family_id: l.family_id,
            care_plan_id: l.care_plan_id,
            client_name: l.client_name,
            family_name: l.family_id ? nameMap[l.family_id] || 'Unknown family' : 'Unknown family',
            shift_date: l.shift_date,
            shift_type: l.shift_type,
            time_in: l.time_in,
            time_out: l.time_out,
            started_at: l.started_at,
            last_activity_at: l.last_activity_at,
            notes: l.notes,
            checklist_data:
              l.checklist_data && typeof l.checklist_data === 'object'
                ? (l.checklist_data as Record<string, any>)
                : {},
            created_at: l.created_at || '',
            noteAck,
            feedback: fbList.filter((fb) => fb.comment !== '__note_ack__'),
          };
        })
      );
    } catch (e: any) {
      setError(e.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    if (!professionalId) return;
    fetchLogs();
  }, [professionalId, fetchLogs]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStats = (data: Record<string, any>) => {
    let total = 0;
    let completed = 0;
    CHECKLIST_SECTIONS.forEach((section) => {
      const saved = data[section.title];
      if (saved && Array.isArray(saved)) {
        saved.forEach((item: any) => {
          total++;
          if (item.completed) completed++;
        });
      } else {
        total += section.items.length;
      }
    });
    return { total, completed };
  };

  // Admin marks family as informed (writes a synthetic acknowledged feedback row tagged as professional/__note_ack__)
  const handleAdminAck = async (log: ProfCareLog) => {
    if (!user) return;
    setActionLoading(`ack-${log.id}`);
    try {
      const nowIso = new Date().toISOString();
      if (log.noteAck) {
        // Update existing row
        const { error } = await supabase
          .from('daily_care_log_feedback')
          .update({ acknowledged_at: nowIso, acknowledged_by: user.id })
          .eq('id', log.noteAck.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('daily_care_log_feedback').insert({
          log_id: log.id,
          family_id: log.family_id || user.id, // satisfy NOT NULL — will be admin's id when no family
          comment: '__note_ack__',
          author_role: 'admin' as const,
          acknowledged_at: nowIso,
          acknowledged_by: user.id,
        });
        if (error) throw error;
      }
      toast.success('Family marked as informed');
      await fetchLogs();
    } catch (e: any) {
      toast.error(e.message || 'Failed to acknowledge');
    } finally {
      setActionLoading(null);
    }
  };

  const buildNudgeMessage = (log: ProfCareLog) => {
    const noteSnippet = (log.notes || '').slice(0, 200);
    const ellipsis = log.notes && log.notes.length > 200 ? '…' : '';
    const link = log.care_plan_id
      ? `${PRODUCTION_BASE_URL}/family/care-management/${log.care_plan_id}`
      : `${PRODUCTION_BASE_URL}/dashboard/family`;
    const caregiver = professionalName?.trim() || 'your caregiver';
    return `Hi ${log.family_name.split(' ')[0]} — your caregiver ${caregiver} left a note on ${formatDate(log.shift_date)}: "${noteSnippet}${ellipsis}" Tap to view & confirm: ${link}`;
  };

  const handleSendNudge = async () => {
    if (!nudgeDialog || !nudgeDialog.family_id || !user) return;
    setNudgeSending(true);
    try {
      const message = buildNudgeMessage(nudgeDialog);
      const { error } = await supabase.functions.invoke('send-nudge-whatsapp', {
        body: {
          userIds: [nudgeDialog.family_id],
          message,
        },
      });
      if (error) throw error;

      // Record the nudge as an admin-authored, acknowledged feedback row so we can show "Nudged" chip
      const nowIso = new Date().toISOString();
      await supabase.from('daily_care_log_feedback').insert({
        log_id: nudgeDialog.id,
        family_id: nudgeDialog.family_id,
        comment: `__nudge_sent__: ${message.slice(0, 300)}`,
        author_role: 'admin' as const,
        acknowledged_at: nowIso,
        acknowledged_by: user.id,
      });

      toast.success(`Nudge sent to ${nudgeDialog.family_name}`);
      setNudgeDialog(null);
      await fetchLogs();
    } catch (e: any) {
      toast.error(e.message || 'Failed to send nudge');
    } finally {
      setNudgeSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading care logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">Failed to load logs: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    const name = professionalName?.trim() || 'This caregiver';
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ClipboardCheck className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {name} hasn't saved any daily care logs in the last 90 days.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Showing {logs.length} log{logs.length === 1 ? '' : 's'} from the last 90 days
        </p>
        {logs.map((log) => {
          const stats = getStats(log.checklist_data);
          const isExpanded = expanded.has(log.id);
          const startedTime = formatTime(log.started_at);
          const nudgeRecord = log.feedback.find((fb) => fb.comment.startsWith('__nudge_sent__'));
          const familyReplies = log.feedback.filter(
            (fb) => fb.author_role === 'family' && !fb.comment.startsWith('__')
          );

          return (
            <Collapsible key={log.id} open={isExpanded} onOpenChange={() => toggle(log.id)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="text-sm font-medium">{formatDate(log.shift_date)}</span>
                    <span className="text-sm text-muted-foreground truncate">
                      — {log.client_name || log.family_name}
                    </span>
                    {log.shift_type && (
                      <Badge variant="outline" className="text-xs">
                        {log.shift_type}
                      </Badge>
                    )}
                    {log.notes && log.noteAck?.acknowledged_at && (
                      <Badge variant="outline" className="text-xs gap-1 border-green-500/50 text-green-700 bg-green-50">
                        <CheckCircle2 className="h-3 w-3" />
                        Acked
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {log.time_in && log.time_out
                        ? `${log.time_in} – ${log.time_out}`
                        : startedTime
                        ? `Started ${startedTime}`
                        : ''}
                    </span>
                    <Badge
                      variant={stats.total > 0 && stats.completed === stats.total ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {stats.completed}/{stats.total}
                    </Badge>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3 border border-t-0 rounded-b-lg space-y-3 bg-muted/20">
                  {(log.started_at || log.last_activity_at) && (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {log.started_at && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Started: {formatTime(log.started_at)}
                        </span>
                      )}
                      {log.last_activity_at && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Last activity:{' '}
                          {formatTime(log.last_activity_at)}
                        </span>
                      )}
                    </div>
                  )}

                  {CHECKLIST_SECTIONS.map((section) => {
                    const saved = log.checklist_data[section.title];
                    if (!saved || !Array.isArray(saved)) return null;
                    const sectionCompleted = saved.filter((i: any) => i.completed).length;

                    return (
                      <div key={section.title} className="space-y-1">
                        <h4 className="text-xs font-medium flex items-center gap-1.5">
                          {section.title}
                          <span className="text-muted-foreground">
                            ({sectionCompleted}/{saved.length})
                          </span>
                        </h4>
                        <div className="pl-3 space-y-0.5">
                          {saved.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs">
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

                  {log.notes && (
                    <div className="bg-background rounded-md p-2 border space-y-2">
                      <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Caregiver Notes
                      </h4>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {log.notes}
                      </p>

                      {/* Acknowledgment / Nudge actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                        {log.noteAck?.acknowledged_at ? (
                          <Badge variant="outline" className="text-xs gap-1 border-green-500/50 text-green-700 bg-green-50">
                            <CheckCircle2 className="h-3 w-3" />
                            Family informed by {log.noteAck.author_role === 'admin' ? 'Admin' : 'Family'} ·{' '}
                            {formatDateTime(log.noteAck.acknowledged_at)}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            disabled={actionLoading === `ack-${log.id}`}
                            onClick={() => handleAdminAck(log)}
                          >
                            {actionLoading === `ack-${log.id}` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Mark family as informed
                          </Button>
                        )}

                        {nudgeRecord ? (
                          <Badge variant="outline" className="text-xs gap-1 border-blue-500/50 text-blue-700 bg-blue-50">
                            <Send className="h-3 w-3" />
                            Nudged {formatDateTime(nudgeRecord.created_at)}
                          </Badge>
                        ) : log.family_id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => setNudgeDialog(log)}
                          >
                            <Send className="h-3 w-3" />
                            Nudge family on WhatsApp
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Legacy log — no family linked. Use the manual nudge from the family profile.
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Family replies */}
                  {familyReplies.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Family Notes
                      </h4>
                      {familyReplies.map((fb) => (
                        <div key={fb.id} className="bg-primary/5 border border-primary/10 rounded-md p-2">
                          <p className="text-xs whitespace-pre-wrap">{fb.comment}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-muted-foreground">
                              {formatDateTime(fb.created_at)}
                            </p>
                            {fb.acknowledged_at && (
                              <Badge variant="outline" className="text-[10px] gap-1 border-green-500/50 text-green-700 bg-green-50">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Acked by caregiver {formatDateTime(fb.acknowledged_at)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Nudge confirmation dialog */}
      <Dialog open={!!nudgeDialog} onOpenChange={(open) => !open && setNudgeDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Nudge</DialogTitle>
            <DialogDescription>
              This will notify {nudgeDialog?.family_name} about the caregiver note from{' '}
              {nudgeDialog && formatDate(nudgeDialog.shift_date)}.
            </DialogDescription>
          </DialogHeader>
          {nudgeDialog && (
            <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap border">
              {buildNudgeMessage(nudgeDialog)}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNudgeDialog(null)} disabled={nudgeSending}>
              Cancel
            </Button>
            <Button onClick={handleSendNudge} disabled={nudgeSending} className="gap-1">
              {nudgeSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Nudge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
