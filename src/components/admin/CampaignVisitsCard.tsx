import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VisitRow {
  utm_campaign: string;
  utm_source: string;
  utm_content: string;
  visits: number;
  last_visit: string;
}

export function CampaignVisitsCard() {
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cta_engagement_tracking')
        .select('action_type, additional_data, created_at')
        .in('action_type', ['blog_utm_landed', 'location_utm_landed'])
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('[CampaignVisitsCard] fetch error', error);
        setLoading(false);
        return;
      }

      const map = new Map<string, VisitRow>();
      data?.forEach((item) => {
        const a = (item.additional_data as Record<string, any>) || {};
        if (!a.utm_source) return;
        const campaign = a.utm_campaign || '(none)';
        const source = a.utm_source;
        const content = a.utm_content || a.post_slug || a.location_slug || '(none)';
        const key = `${campaign}|${source}|${content}`;
        const existing = map.get(key);
        if (existing) {
          existing.visits++;
          if (new Date(item.created_at) > new Date(existing.last_visit)) {
            existing.last_visit = item.created_at;
          }
        } else {
          map.set(key, {
            utm_campaign: campaign,
            utm_source: source,
            utm_content: content,
            visits: 1,
            last_visit: item.created_at,
          });
        }
      });

      setRows(Array.from(map.values()).sort((a, b) => b.visits - a.visits));
      setLoading(false);
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visits by Campaign</CardTitle>
        <CardDescription>
          Link clicks landing on blog posts and location pages, grouped by campaign / source / destination.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tracked visits yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.utm_campaign}</TableCell>
                  <TableCell><Badge variant="outline">{r.utm_source}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.utm_content}</TableCell>
                  <TableCell className="text-right font-bold">{r.visits}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(r.last_visit), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
