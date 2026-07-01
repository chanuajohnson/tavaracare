import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { Monitor, Smartphone, Tablet, Globe, ChevronDown, Clock, MousePointerClick, ShieldCheck } from 'lucide-react';

interface UserActivityPanelProps {
  userId: string;
  userFullName?: string;
}

interface SessionRow {
  id: string;
  session_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  page_views: number | null;
  device_type: string | null;
  browser: string | null;
  referrer: string | null;
  exit_page: string | null;
  inferred_from_activity?: boolean;
}

interface ActivityRow {
  id: string;
  session_id: string | null;
  feature_name: string | null;
  action_type: string | null;
  created_at: string;
  additional_data: any;
}

interface AuthHistoryRow {
  id: string;
  event_type: string;
  occurred_at: string;
  ip_address: string | null;
  actor_email: string | null;
  provider: string | null;
  auth_last_sign_in_at: string | null;
  auth_created_at: string | null;
}

const loginEventTypes = new Set(['login', 'user_signedup', 'current_last_sign_in']);

function getAuthEventLabel(type: string): string {
  switch (type) {
    case 'current_last_sign_in':
      return 'Current last sign-in';
    case 'user_signedup':
      return 'Account created';
    case 'token_refreshed':
      return 'Session refreshed';
    case 'token_revoked':
      return 'Session revoked';
    case 'logout':
      return 'Logout';
    case 'login':
      return 'Login';
    default:
      return type.replace(/_/g, ' ');
  }
}

function getAuthLoginRows(rows: AuthHistoryRow[]): AuthHistoryRow[] {
  const actualLoginRows = rows.filter((row) => row.event_type === 'login' || row.event_type === 'user_signedup');
  if (actualLoginRows.length > 0) return actualLoginRows;

  return rows.filter((row) => row.event_type === 'current_last_sign_in');
}

function buildSessionsFromActivity(rows: ActivityRow[]): SessionRow[] {
  const grouped = new Map<string, ActivityRow[]>();
  const inactivityGapMs = 30 * 60 * 1000;

  rows.forEach((row) => {
    if (!row.session_id) return;
    const current = grouped.get(row.session_id) || [];
    current.push(row);
    grouped.set(row.session_id, current);
  });

  return Array.from(grouped.entries())
    .flatMap(([sessionId, sessionRows]) => {
      const sorted = [...sessionRows].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      const visits: ActivityRow[][] = [];
      let currentVisit: ActivityRow[] = [];

      sorted.forEach((row) => {
        const previous = currentVisit[currentVisit.length - 1];
        const gap = previous
          ? new Date(row.created_at).getTime() - new Date(previous.created_at).getTime()
          : 0;

        if (previous && gap > inactivityGapMs) {
          visits.push(currentVisit);
          currentVisit = [row];
          return;
        }

        currentVisit.push(row);
      });

      if (currentVisit.length > 0) visits.push(currentVisit);

      return visits.map((visitRows, index) => {
        const first = visitRows[0];
        const last = visitRows[visitRows.length - 1];
        const firstData = first?.additional_data || {};
        const lastData = last?.additional_data || {};
        const startedAt = first?.created_at || new Date().toISOString();
        const endedAt = last?.created_at || startedAt;
        const durationSeconds = Math.max(
          0,
          Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000),
        );

        return {
          id: `activity-${sessionId}-${index}`,
          session_id: sessionId,
          started_at: startedAt,
          ended_at: endedAt,
          duration_seconds: durationSeconds || null,
          page_views: visitRows.length,
          device_type: lastData.device_type || firstData.device_type || null,
          browser: lastData.browser || firstData.browser || null,
          referrer: lastData.referrer || firstData.referrer || null,
          exit_page:
            lastData.page_path ||
            lastData.current_path ||
            lastData.path ||
            lastData.url ||
            null,
          inferred_from_activity: true,
        } satisfies SessionRow;
      });
    })
    .sort(
      (a, b) =>
        new Date(b.ended_at || b.started_at).getTime() -
        new Date(a.ended_at || a.started_at).getTime(),
    );
}

function DeviceIcon({ type }: { type: string | null }) {
  const t = (type || '').toLowerCase();
  if (t.includes('mobile') || t.includes('phone')) return <Smartphone className="h-3.5 w-3.5" />;
  if (t.includes('tablet')) return <Tablet className="h-3.5 w-3.5" />;
  if (t.includes('desktop')) return <Monitor className="h-3.5 w-3.5" />;
  return <Globe className="h-3.5 w-3.5" />;
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function UserActivityPanel({ userId, userFullName }: UserActivityPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [authHistory, setAuthHistory] = useState<AuthHistoryRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [sessRes, actRes, sessionActivityRes, authHistoryRes] = await Promise.all([
          supabase
            .from('session_analytics')
            .select('*')
            .eq('user_id', userId)
            .order('started_at', { ascending: false })
            .limit(10),
          supabase
            .from('cta_engagement_tracking')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(25),
          supabase
            .from('cta_engagement_tracking')
            .select('id, session_id, feature_name, action_type, created_at, additional_data')
            .eq('user_id', userId)
            .not('session_id', 'is', null)
            .order('created_at', { ascending: false })
            .limit(200),
          supabase.functions.invoke('admin-users', {
            body: {
              action: 'auth-history',
              user_id: userId,
            },
          }),
        ]);
        if (cancelled) return;
        if (sessRes.error) throw sessRes.error;
        if (actRes.error) throw actRes.error;
        if (sessionActivityRes.error) throw sessionActivityRes.error;
        if (authHistoryRes.error) throw authHistoryRes.error;

        const realSessions = (sessRes.data || []) as SessionRow[];
        const fallbackSessions = buildSessionsFromActivity(
          (sessionActivityRes.data || []) as ActivityRow[],
        );

        setSessions(realSessions.length > 0 ? realSessions : fallbackSessions);
        setActivity((actRes.data || []) as ActivityRow[]);
        setAuthHistory(((authHistoryRes.data as any)?.events || []) as AuthHistoryRow[]);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load activity');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-red-600">
          Could not load activity: {error}
        </CardContent>
      </Card>
    );
  }

  const last = sessions[0];
  const authLoginRows = getAuthLoginRows(authHistory);
  const latestAuthLogin =
    authHistory.find((row) => row.event_type === 'current_last_sign_in') ||
    authLoginRows[0] ||
    null;
  const authEventRows = authHistory.filter((row) => row.event_type !== 'current_last_sign_in');

  return (
    <div className="space-y-4">
      {/* Last Login & Device */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last Login &amp; Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!latestAuthLogin && !last ? (
            <p className="text-sm text-muted-foreground">No session data recorded yet.</p>
          ) : latestAuthLogin ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Loaded from Supabase Auth. The app session table can be empty even when Supabase
                has login records.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Last Supabase sign-in</div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(latestAuthLogin.occurred_at), { addSuffix: true })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(latestAuthLogin.occurred_at), 'PPp')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Provider / IP</div>
                  <div className="font-medium">
                    {latestAuthLogin.provider || 'Email'} · {latestAuthLogin.ip_address || 'IP not recorded'}
                  </div>
                  {latestAuthLogin.actor_email && (
                    <div className="text-xs text-muted-foreground truncate">
                      {latestAuthLogin.actor_email}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Device / Browser</div>
                  <div className="flex items-center gap-2 font-medium">
                    <DeviceIcon type={last?.device_type || null} />
                    <span className="capitalize">{last?.device_type || 'Not captured by Auth'}</span>
                    {last?.browser && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span>{last.browser}</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Auth login records</div>
                  <div className="font-medium">{authLoginRows.length}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {last.inferred_from_activity && (
                <p className="text-xs text-muted-foreground">
                  Login history is inferred from tracked dashboard activity because no session
                  analytics rows were recorded for this user.
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Last activity session</div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(last.started_at), { addSuffix: true })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(last.started_at), 'PPp')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Device / Browser</div>
                  <div className="flex items-center gap-2 font-medium">
                    <DeviceIcon type={last.device_type} />
                    <span className="capitalize">{last.device_type || 'Unknown'}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{last.browser || 'Unknown'}</span>
                  </div>
                </div>
                {last.referrer && (
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground">Referrer</div>
                    <div className="font-mono text-xs truncate">{last.referrer}</div>
                  </div>
                )}
                {last.exit_page && (
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground">Exit page</div>
                    <div className="font-mono text-xs truncate">{last.exit_page}</div>
                  </div>
                )}
                {last.inferred_from_activity && (
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground">Events in session</div>
                    <div className="text-xs font-medium">{last.page_views ?? 0}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supabase Login History */}
      <Card>
        <Collapsible defaultOpen>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Supabase Login History{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({authLoginRows.length})
                </span>
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {authLoginRows.length > 0 && (
                <p className="mb-3 text-xs text-muted-foreground">
                  These rows come directly from Supabase Auth audit history and include prior
                  login/account-created events.
                </p>
              )}
              {authLoginRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No Supabase Auth login records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authLoginRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {format(new Date(row.occurred_at), 'MMM d, yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {getAuthEventLabel(row.event_type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{row.actor_email || '—'}</TableCell>
                          <TableCell className="text-xs capitalize">{row.provider || 'email'}</TableCell>
                          <TableCell className="text-xs font-mono">
                            {row.ip_address || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Full Supabase Auth Log */}
      <Card>
        <Collapsible>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Full Supabase Auth Log{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({authEventRows.length})
                </span>
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {authEventRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No auth audit events found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authEventRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {format(new Date(row.occurred_at), 'MMM d, yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {getAuthEventLabel(row.event_type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{row.actor_email || '—'}</TableCell>
                          <TableCell className="text-xs capitalize">{row.provider || '—'}</TableCell>
                          <TableCell className="text-xs font-mono">
                            {row.ip_address || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Activity Trail */}
      <Card>
        <Collapsible defaultOpen>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointerClick className="h-4 w-4" />
                Recent Activity Trail{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({activity.length})
                </span>
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tracked actions yet for {userFullName || 'this user'}.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Feature</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Session</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activity.map((a, i) => {
                        const prev = activity[i - 1];
                        const newSession = !prev || prev.session_id !== a.session_id;
                        return (
                          <TableRow
                            key={a.id}
                            className={newSession ? 'border-t-2 border-t-muted' : ''}
                          >
                            <TableCell className="text-xs whitespace-nowrap">
                              {format(new Date(a.created_at), 'MMM d HH:mm:ss')}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              {a.feature_name || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">
                                {a.action_type || 'event'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[10px] font-mono text-muted-foreground">
                              {a.session_id ? a.session_id.slice(0, 8) : '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

export default UserActivityPanel;
