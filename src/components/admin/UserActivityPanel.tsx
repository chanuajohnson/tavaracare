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
import { Monitor, Smartphone, Tablet, Globe, ChevronDown, Clock, MousePointerClick } from 'lucide-react';

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
}

interface ActivityRow {
  id: string;
  session_id: string | null;
  feature_name: string | null;
  action_type: string | null;
  created_at: string;
  additional_data: any;
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [sessRes, actRes] = await Promise.all([
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
        ]);
        if (cancelled) return;
        if (sessRes.error) throw sessRes.error;
        if (actRes.error) throw actRes.error;
        setSessions((sessRes.data || []) as SessionRow[]);
        setActivity((actRes.data || []) as ActivityRow[]);
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
          {!last ? (
            <p className="text-sm text-muted-foreground">No session data recorded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Last sign-in</div>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <Collapsible defaultOpen>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Login History{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({sessions.length})
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
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No login sessions recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Browser</TableHead>
                        <TableHead className="text-right">Pages</TableHead>
                        <TableHead>Exit page</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {format(new Date(s.started_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDuration(s.duration_seconds)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs capitalize">
                              <DeviceIcon type={s.device_type} />
                              {s.device_type || '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{s.browser || '—'}</TableCell>
                          <TableCell className="text-xs text-right">
                            {s.page_views ?? 0}
                          </TableCell>
                          <TableCell className="text-xs font-mono max-w-[180px] truncate">
                            {s.exit_page || '—'}
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
