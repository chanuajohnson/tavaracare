import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface RecalculationLogEntry {
  id: string;
  caregiver_id: string;
  recalculation_type: string;
  created_at: string;
  processed_at?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  assignments_created: number;
  assignments_removed: number;
  error_message?: string;
  caregiver_name?: string;
}

export const MatchRecalculationLog: React.FC = () => {
  const [logs, setLogs] = useState<RecalculationLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      // First get the logs
      const { data: logData, error: logError } = await supabase
        .from('match_recalculation_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logError) throw logError;

      // Then get caregiver names separately
      const caregiverIds = logData?.map(log => log.caregiver_id) || [];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', caregiverIds);

      if (profileError) {
        console.error('Error fetching caregiver profiles:', profileError);
      }

      // Map caregiver names to logs
      const profileMap = new Map(profileData?.map(p => [p.id, p.full_name]) || []);
      
      const processedLogs: RecalculationLogEntry[] = logData?.map(log => ({
        ...log,
        status: log.status as RecalculationLogEntry['status'],
        caregiver_name: profileMap.get(log.caregiver_id) || 'Unknown Caregiver'
      })) || [];

      setLogs(processedLogs);
    } catch (error) {
      console.error('Error fetching recalculation logs:', error);
      toast.error('Failed to fetch recalculation logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Set up real-time subscription for new log entries
    const channel = supabase
      .channel('match-recalculation-log')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_recalculation_log'
        },
        () => {
          console.log('Recalculation log updated, refreshing...');
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      processing: 'default',
      pending: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Match Recalculation Log</CardTitle>
            <CardDescription>
              Track automatic match recalculations triggered by caregiver availability changes
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading recalculation logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recalculation logs found. Changes will appear here automatically.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="font-medium">{log.caregiver_name}</span>
                    {getStatusBadge(log.status)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {log.recalculation_type}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {log.assignments_created}
                  </div>
                  <div>
                    <span className="font-medium">Removed:</span> {log.assignments_removed}
                  </div>
                </div>

                {log.processed_at && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Processed: {formatDistanceToNow(new Date(log.processed_at), { addSuffix: true })}
                  </div>
                )}

                {log.error_message && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    <span className="font-medium">Error:</span> {log.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};