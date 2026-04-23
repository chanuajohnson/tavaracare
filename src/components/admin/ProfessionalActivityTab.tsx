import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleSlash,
  ClipboardCheck,
  RefreshCw,
} from 'lucide-react';
import { useProfessionalActivity } from '@/hooks/useProfessionalActivity';
import { ProfessionalCareLogsList } from './ProfessionalCareLogsList';

interface Props {
  professionalId: string;
  professionalName?: string | null;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
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

const formatTimeOnly = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
};

const getTimelinessBadge = (
  startedAt: string | null | undefined,
  scheduledStart: string | null | undefined,
  hasLog: boolean,
  date: string,
) => {
  if (!hasLog) {
    const isPast = new Date(date + 'T23:59:59') < new Date();
    return isPast ? (
      <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50 gap-1">
        <CircleSlash className="h-3 w-3" /> No log
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground gap-1">
        <Clock className="h-3 w-3" /> Upcoming
      </Badge>
    );
  }

  if (!startedAt || !scheduledStart) {
    return (
      <Badge variant="outline" className="text-muted-foreground gap-1">
        <ClipboardCheck className="h-3 w-3" /> Logged
      </Badge>
    );
  }

  try {
    const [h, m] = scheduledStart.split(':').map(Number);
    const started = new Date(startedAt);
    const sched = new Date(started);
    sched.setHours(h, m || 0, 0, 0);
    const diffMin = Math.round((started.getTime() - sched.getTime()) / 60000);

    if (diffMin <= 15) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1">
          <CheckCircle2 className="h-3 w-3" /> On time
        </Badge>
      );
    }
    if (diffMin <= 60) {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1">
          <Clock className="h-3 w-3" /> {diffMin} min late
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 gap-1">
        <AlertCircle className="h-3 w-3" /> {diffMin} min late
      </Badge>
    );
  } catch {
    return null;
  }
};

export const ProfessionalActivityTab: React.FC<Props> = ({
  professionalId,
  professionalName,
}) => {
  const {
    shifts,
    feed,
    weeklyLogCount,
    weeklyOnTimeCount,
    weeklyTotalScheduled,
    avgCompletionPct,
    lastActivityAt,
    loading,
    error,
    refresh,
  } = useProfessionalActivity(professionalId);

  const [logsDialogOpen, setLogsDialogOpen] = useState(false);

  const recentShifts = shifts.filter((s) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    cutoff.setHours(0, 0, 0, 0);
    return s.date >= cutoff.toISOString().slice(0, 10);
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Failed to load activity: {error}</p>
          <Button onClick={refresh} variant="outline" size="sm" className="mt-3 gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compliance summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Compliance Summary
            </CardTitle>
            <Button onClick={refresh} variant="ghost" size="sm" className="gap-1">
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Logs this week</p>
              <p className="text-2xl font-semibold">
                {weeklyLogCount}
                <span className="text-sm text-muted-foreground font-normal">
                  {' '}/ {weeklyTotalScheduled}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">On-time starts</p>
              <p className="text-2xl font-semibold">
                {weeklyOnTimeCount}
                {weeklyLogCount > 0 && (
                  <span className="text-sm text-muted-foreground font-normal">
                    {' '}/ {weeklyLogCount}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg checklist</p>
              <p className="text-2xl font-semibold">
                {avgCompletionPct != null ? `${avgCompletionPct}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last activity</p>
              <p className="text-sm font-medium mt-1">
                {lastActivityAt ? formatDateTime(lastActivityAt) : 'No activity yet'}
              </p>
            </div>
          </div>

          {/* Days-since-last-log gap indicator — instant signal that compliance is slipping */}
          {lastActivityAt && (() => {
            const last = new Date(lastActivityAt);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 2) {
              return (
                <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-900">
                    📝 <strong>{diffDays} days</strong> since last log saved — last activity on{' '}
                    {formatDateTime(lastActivityAt)}.
                  </p>
                </div>
              );
            }
            return null;
          })()}
        </CardContent>
      </Card>

      {/* Recent Shifts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Shifts (last 14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {recentShifts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No shifts in the last 14 days.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>First Log Saved</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Checklist</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentShifts.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {formatDate(s.date)}
                      </TableCell>
                      <TableCell>{s.clientName || s.familyName || '—'}</TableCell>
                      <TableCell className="text-sm">
                        {s.scheduledStart && s.scheduledEnd
                          ? `${s.scheduledStart}–${s.scheduledEnd}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.startedAt ? formatTimeOnly(s.startedAt) : (s.logId ? '— (legacy)' : '—')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.lastActivityAt ? formatTimeOnly(s.lastActivityAt) : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.totalItems && s.totalItems > 0
                          ? `${s.completedItems}/${s.totalItems}`
                          : 'Not started'}
                      </TableCell>
                      <TableCell>
                        {getTimelinessBadge(
                          s.startedAt,
                          s.scheduledStart,
                          !!s.logId,
                          s.date,
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity (last 30 days)</CardTitle>
            <Button
              onClick={() => setLogsDialogOpen(true)}
              variant="outline"
              size="sm"
            >
              View all logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No activity recorded in the past 30 days.
            </p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {feed.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 pb-3 border-b last:border-b-0"
                >
                  <div className="mt-0.5">
                    {item.type === 'check_in' ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                        🟢
                      </span>
                    ) : (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                        📋
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.detail && (
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(item.occurredAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Full logs dialog (reuses existing AdminCareLogsTab) */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              All Daily Care Logs{professionalName ? ` — ${professionalName}` : ''}
            </DialogTitle>
          </DialogHeader>
          <ProfessionalCareLogsList
            professionalId={professionalId}
            professionalName={professionalName}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
