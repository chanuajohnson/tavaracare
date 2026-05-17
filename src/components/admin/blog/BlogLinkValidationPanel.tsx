import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { LinkValidationResult } from '@/hooks/admin/useBlogLinkValidation';

interface Props {
  result: LinkValidationResult;
}

export function BlogLinkValidationPanel({ result }: Props) {
  const { totalLinks, issues, errorCount, warningCount, isLoading } = result;
  const allGood = totalLinks > 0 && issues.length === 0 && !isLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" />
          Internal link check
        </CardTitle>
        <CardDescription className="text-xs">
          Validates every internal link in the body against existing blog slugs and app routes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{totalLinks} internal link{totalLinks === 1 ? '' : 's'}</Badge>
          {errorCount > 0 && (
            <Badge variant="destructive">{errorCount} error{errorCount === 1 ? '' : 's'}</Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
              {warningCount} warning{warningCount === 1 ? '' : 's'}
            </Badge>
          )}
          {isLoading && <Badge variant="secondary">Checking…</Badge>}
        </div>

        {allGood && (
          <div className="flex items-start gap-2 text-emerald-700 text-xs">
            <CheckCircle2 className="h-4 w-4 mt-0.5" />
            <span>All {totalLinks} internal link{totalLinks === 1 ? '' : 's'} resolve.</span>
          </div>
        )}

        {totalLinks === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground">No internal links in the body yet.</p>
        )}

        {issues.length > 0 && (
          <ul className="space-y-2">
            {issues.map((iss, idx) => (
              <li
                key={`${iss.line}-${iss.href}-${idx}`}
                className={`rounded border p-2 text-xs ${
                  iss.severity === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  {iss.severity === 'error' ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-700 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-medium">
                      Line {iss.line}: <span className="font-mono break-all">{iss.href}</span>
                    </div>
                    <div className="text-muted-foreground truncate">
                      Text: "{iss.text}"
                    </div>
                    <div
                      className={
                        iss.severity === 'error' ? 'text-red-700' : 'text-amber-800'
                      }
                    >
                      {iss.reason}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {errorCount > 0 && (
          <p className="text-xs text-red-700">
            Publish is blocked until broken links are fixed or removed.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
