import { useState } from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ScanIssue, ScanResult } from '@/hooks/admin/useGuardrailScan';

interface Props {
  scan: ScanResult;
  body: string;
  onBodyReplace: (next: string) => void;
}

export function GuardrailScanPanel({ scan, body, onBodyReplace }: Props) {
  const [expanded, setExpanded] = useState(true);
  const { issues, hardCount, softCount, isLoading } = scan;

  if (isLoading) return null;

  if (issues.length === 0) {
    return (
      <Card className="bg-emerald-50 border-emerald-300 mb-3">
        <CardContent className="p-3 flex items-center gap-2 text-sm text-emerald-900">
          <ShieldCheck className="h-4 w-4" /> Guardrail scan clean — zero breaches detected.
        </CardContent>
      </Card>
    );
  }

  const applyReplace = (issue: ScanIssue) => {
    if (issue.field !== 'body' || !issue.preferred) return;
    const re = new RegExp(`\\b${issue.banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const next = body.replace(re, issue.preferred);
    onBodyReplace(next);
  };

  return (
    <Card
      className={
        hardCount > 0
          ? 'bg-red-50 border-red-300 mb-3'
          : 'bg-amber-50 border-amber-300 mb-3'
      }
    >
      <CardContent className="p-3 space-y-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 text-sm font-medium"
        >
          {hardCount > 0 ? (
            <ShieldAlert className="h-4 w-4 text-red-700" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-700" />
          )}
          <span>
            Guardrail scan:{' '}
            {hardCount > 0 && (
              <Badge variant="destructive" className="mr-1">
                {hardCount} hard
              </Badge>
            )}
            {softCount > 0 && (
              <Badge variant="outline" className="border-amber-400 text-amber-900">
                {softCount} soft
              </Badge>
            )}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {expanded ? 'Hide' : 'Show'}
          </span>
        </button>

        {expanded && (
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div
                key={`${issue.ruleId}-${i}`}
                className="rounded border bg-card p-2 text-xs space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={issue.severity === 'hard' ? 'destructive' : 'outline'}
                    className="text-[10px]"
                  >
                    {issue.severity}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {issue.field}
                    {issue.field === 'body' && ` · L${issue.lineNumber}`}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {issue.ruleType}
                  </Badge>
                  {issue.count && issue.count > 1 && (
                    <Badge variant="outline" className="text-[10px]">
                      used {issue.count}×
                    </Badge>
                  )}
                  <span className="text-muted-foreground">
                    <span className="line-through">{issue.banned}</span>
                    {issue.preferred && (
                      <>
                        {' → '}
                        <span className="font-medium text-foreground">{issue.preferred}</span>
                      </>
                    )}
                  </span>
                  {issue.field === 'body' && issue.preferred && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 ml-auto"
                      onClick={() => applyReplace(issue)}
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground italic">"{issue.excerpt}"</p>
                {issue.reason && (
                  <p className="text-[11px] text-muted-foreground">{issue.reason}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
