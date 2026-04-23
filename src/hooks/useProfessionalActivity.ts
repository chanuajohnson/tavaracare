import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShiftActivityRow {
  id: string;                    // care_shift id OR daily_care_log id
  date: string;                  // ISO date (YYYY-MM-DD)
  scheduledStart?: string | null;// "08:00"
  scheduledEnd?: string | null;  // "16:00"
  shiftTitle?: string | null;
  familyName?: string | null;
  clientName?: string | null;
  carePlanId?: string | null;
  logId?: string | null;
  startedAt?: string | null;     // first-save timestamp
  lastActivityAt?: string | null;
  completedItems?: number;
  totalItems?: number;
  notesPresent?: boolean;
  source: 'shift' | 'log';
}

export interface ActivityFeedItem {
  id: string;
  occurredAt: string;
  type: 'check_in' | 'log_save';
  label: string;
  detail?: string;
}

export interface ProfessionalActivitySummary {
  shifts: ShiftActivityRow[];
  feed: ActivityFeedItem[];
  weeklyLogCount: number;
  weeklyOnTimeCount: number;
  weeklyTotalScheduled: number;
  avgCompletionPct: number | null;
  lastActivityAt: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/* helpers ----------------------------------------------------------- */

const last7DaysIso = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const thirtyDaysAgoIso = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const countCompletion = (
  checklistData: any,
): { completed: number; total: number } => {
  if (!checklistData || typeof checklistData !== 'object') {
    return { completed: 0, total: 0 };
  }
  let completed = 0;
  let total = 0;
  Object.values(checklistData).forEach((section: any) => {
    if (Array.isArray(section)) {
      section.forEach((item: any) => {
        total += 1;
        if (item?.completed === true) completed += 1;
      });
    }
  });
  return { completed, total };
};

const isOnTime = (startedAt: string | null, scheduledStart: string | null) => {
  if (!startedAt || !scheduledStart) return false;
  try {
    const [h, m] = scheduledStart.split(':').map(Number);
    if (Number.isNaN(h)) return false;
    const started = new Date(startedAt);
    const sched = new Date(started);
    sched.setHours(h, m || 0, 0, 0);
    const diffMin = (started.getTime() - sched.getTime()) / 60000;
    return diffMin <= 15;
  } catch {
    return false;
  }
};

/* hook -------------------------------------------------------------- */

export const useProfessionalActivity = (
  professionalId: string | undefined | null,
): ProfessionalActivitySummary => {
  const [data, setData] = useState<Omit<
    ProfessionalActivitySummary,
    'refresh'
  >>({
    shifts: [],
    feed: [],
    weeklyLogCount: 0,
    weeklyOnTimeCount: 0,
    weeklyTotalScheduled: 0,
    avgCompletionPct: null,
    lastActivityAt: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    if (!professionalId) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }

    setData((d) => ({ ...d, loading: true, error: null }));

    try {
      const weekStart = last7DaysIso();
      const since30 = thirtyDaysAgoIso();

      // Pull shifts assigned to this caregiver in the past 30 days
      const { data: shiftsData, error: shiftsErr } = await supabase
        .from('care_shifts')
        .select('id, title, start_time, end_time, status, family_id, care_plan_id')
        .eq('caregiver_id', professionalId)
        .gte('start_time', since30)
        .order('start_time', { ascending: false });

      if (shiftsErr) throw shiftsErr;

      // Pull daily care logs in the past 30 days
      const { data: logsData, error: logsErr } = await supabase
        .from('daily_care_logs')
        .select(
          'id, shift_date, time_in, time_out, client_name, care_plan_id, family_id, checklist_data, notes, started_at, last_activity_at, created_at',
        )
        .eq('professional_id', professionalId)
        .gte('shift_date', since30.slice(0, 10))
        .order('shift_date', { ascending: false });

      if (logsErr) throw logsErr;

      // Resolve family names
      const familyIds = Array.from(
        new Set(
          [
            ...(shiftsData || []).map((s) => s.family_id),
            ...(logsData || []).map((l) => l.family_id),
          ].filter(Boolean),
        ),
      ) as string[];

      let familyNames: Record<string, string> = {};
      if (familyIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', familyIds);
        (profs || []).forEach((p: any) => {
          familyNames[p.id] = p.full_name;
        });
      }

      // Build a unified per-shift row, merging shifts ↔ logs
      const rows: ShiftActivityRow[] = [];

      (shiftsData || []).forEach((s: any) => {
        const dateStr = s.start_time?.slice(0, 10);
        const matchedLog = (logsData || []).find(
          (l: any) =>
            l.shift_date === dateStr &&
            (l.care_plan_id === s.care_plan_id ||
              l.family_id === s.family_id),
        );
        const counts = matchedLog
          ? countCompletion(matchedLog.checklist_data)
          : { completed: 0, total: 0 };

        rows.push({
          id: s.id,
          date: dateStr,
          scheduledStart: s.start_time
            ? new Date(s.start_time).toTimeString().slice(0, 5)
            : null,
          scheduledEnd: s.end_time
            ? new Date(s.end_time).toTimeString().slice(0, 5)
            : null,
          shiftTitle: s.title,
          familyName: familyNames[s.family_id] || null,
          clientName: matchedLog?.client_name || familyNames[s.family_id] || null,
          carePlanId: s.care_plan_id,
          logId: matchedLog?.id || null,
          startedAt: matchedLog?.started_at || null,
          lastActivityAt:
            matchedLog?.last_activity_at || matchedLog?.created_at || null,
          completedItems: counts.completed,
          totalItems: counts.total,
          notesPresent: !!matchedLog?.notes,
          source: 'shift',
        });
      });

      // Add ad-hoc logs (no scheduled shift)
      (logsData || []).forEach((l: any) => {
        const alreadyIncluded = rows.some((r) => r.logId === l.id);
        if (alreadyIncluded) return;
        const counts = countCompletion(l.checklist_data);
        rows.push({
          id: l.id,
          date: l.shift_date,
          scheduledStart: l.time_in,
          scheduledEnd: l.time_out,
          shiftTitle: 'Ad-hoc shift',
          familyName: familyNames[l.family_id] || null,
          clientName: l.client_name,
          carePlanId: l.care_plan_id,
          logId: l.id,
          startedAt: l.started_at,
          lastActivityAt: l.last_activity_at || l.created_at,
          completedItems: counts.completed,
          totalItems: counts.total,
          notesPresent: !!l.notes,
          source: 'log',
        });
      });

      rows.sort((a, b) => (a.date < b.date ? 1 : -1));

      // Build activity feed (last 30d)
      const feed: ActivityFeedItem[] = [];
      (logsData || []).forEach((l: any) => {
        const counts = countCompletion(l.checklist_data);
        if (l.started_at) {
          feed.push({
            id: `start-${l.id}`,
            occurredAt: l.started_at,
            type: 'check_in',
            label: `Started checklist for ${l.client_name || familyNames[l.family_id] || 'client'}`,
            detail: counts.total > 0 ? `${counts.completed}/${counts.total} ticked at start` : undefined,
          });
        }
        const lastSave = l.last_activity_at || l.created_at;
        if (lastSave && lastSave !== l.started_at) {
          feed.push({
            id: `save-${l.id}`,
            occurredAt: lastSave,
            type: 'log_save',
            label: `Saved Daily Checklist (${l.client_name || familyNames[l.family_id] || 'client'})`,
            detail:
              counts.total > 0
                ? `${counts.completed}/${counts.total} (${Math.round((counts.completed / counts.total) * 100)}%)`
                : undefined,
          });
        }
      });
      feed.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));

      // Weekly metrics
      const weeklyShifts = rows.filter(
        (r) => r.date >= weekStart.slice(0, 10),
      );
      const weeklyLogs = weeklyShifts.filter((r) => !!r.logId);
      const weeklyOnTime = weeklyLogs.filter((r) =>
        isOnTime(r.startedAt || null, r.scheduledStart || null),
      ).length;

      // Avg completion across weekly logs (with non-zero totals)
      const completions = weeklyLogs
        .filter((r) => (r.totalItems || 0) > 0)
        .map(
          (r) => ((r.completedItems || 0) / (r.totalItems || 1)) * 100,
        );
      const avgCompletion =
        completions.length > 0
          ? Math.round(
              completions.reduce((a, b) => a + b, 0) / completions.length,
            )
          : null;

      const lastActivity =
        feed.length > 0 ? feed[0].occurredAt : null;

      setData({
        shifts: rows,
        feed,
        weeklyLogCount: weeklyLogs.length,
        weeklyOnTimeCount: weeklyOnTime,
        weeklyTotalScheduled: weeklyShifts.length,
        avgCompletionPct: avgCompletion,
        lastActivityAt: lastActivity,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('[useProfessionalActivity] error:', err);
      setData((d) => ({
        ...d,
        loading: false,
        error: err.message || 'Failed to load activity',
      }));
    }
  }, [professionalId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, refresh: load };
};
