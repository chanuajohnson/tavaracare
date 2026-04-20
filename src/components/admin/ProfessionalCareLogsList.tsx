import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CHECKLIST_SECTIONS } from '@/components/professional/checklist/checklistSections';

interface ProfessionalCareLogsListProps {
  professionalId: string;
  professionalName?: string | null;
}

interface ProfCareLog {
  id: string;
  family_id: string | null;
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

export const ProfessionalCareLogsList: React.FC<ProfessionalCareLogsListProps> = ({
  professionalId,
  professionalName,
}) => {
  const [logs, setLogs] = useState<ProfCareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!professionalId) return;
    let cancelled = false;

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const since = new Date();
        since.setDate(since.getDate() - 90);
        const sinceStr = since.toISOString().slice(0, 10);

        const { data, error: logsErr } = await supabase
          .from('daily_care_logs')
          .select(
            'id, family_id, client_name, shift_date, shift_type, time_in, time_out, started_at, last_activity_at, notes, checklist_data, created_at'
          )
          .eq('professional_id', professionalId)
          .gte('shift_date', sinceStr)
          .order('shift_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(50);

        if (logsErr) throw logsErr;

        const familyIds = [
          ...new Set((data || []).map((l) => l.family_id).filter(Boolean) as string[]),
        ];
        const nameMap: Record<string, string> = {};
        if (familyIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', familyIds);
          profiles?.forEach((p) => {
            nameMap[p.id] = p.full_name || 'Unknown family';
          });
        }

        if (cancelled) return;
        setLogs(
          (data || []).map((l) => ({
            id: l.id,
            family_id: l.family_id,
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
          }))
        );
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load logs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [professionalId]);

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
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Showing {logs.length} log{logs.length === 1 ? '' : 's'} from the last 90 days
      </p>
      {logs.map((log) => {
        const stats = getStats(log.checklist_data);
        const isExpanded = expanded.has(log.id);
        const startedTime = formatTime(log.started_at);

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
                  <div className="bg-background rounded-md p-2 border">
                    <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Caregiver Notes
                    </h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {log.notes}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};
