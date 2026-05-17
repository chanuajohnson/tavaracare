import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  extractInternalLinks,
  classifyRoute,
  isBlogSlugHref,
  type ExtractedLink,
} from '@/lib/blog/linkValidation';

export interface LinkIssue {
  href: string;
  text: string;
  line: number;
  severity: 'error' | 'warning';
  reason: string;
}

export interface LinkValidationResult {
  totalLinks: number;
  issues: LinkIssue[];
  errorCount: number;
  warningCount: number;
  isLoading: boolean;
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function useBlogLinkValidation(body: string): LinkValidationResult {
  const debouncedBody = useDebounced(body, 400);

  const links = useMemo<ExtractedLink[]>(
    () => extractInternalLinks(debouncedBody),
    [debouncedBody],
  );

  const slugs = useMemo(() => {
    const set = new Set<string>();
    for (const l of links) {
      const s = isBlogSlugHref(l.href);
      if (s) set.add(s);
    }
    return Array.from(set).sort();
  }, [links]);

  const { data: slugRows, isLoading } = useQuery({
    queryKey: ['blog-link-validation', slugs],
    enabled: slugs.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('slug, status')
        .in('slug', slugs);
      if (error) throw error;
      return (data ?? []) as Array<{ slug: string; status: string }>;
    },
  });

  const result = useMemo<LinkValidationResult>(() => {
    const map = new Map<string, string>();
    for (const r of slugRows ?? []) map.set(r.slug, r.status);

    const issues: LinkIssue[] = [];
    for (const link of links) {
      const cls = classifyRoute(link.href);
      if (cls === 'known-route' || cls === 'dynamic-allowed') continue;

      if (cls === 'blog-slug') {
        const slug = isBlogSlugHref(link.href)!;
        const status = map.get(slug);
        if (!status) {
          issues.push({
            href: link.href,
            text: link.text,
            line: link.line,
            severity: 'error',
            reason: `No blog post exists with slug "${slug}"`,
          });
        } else if (status !== 'published') {
          issues.push({
            href: link.href,
            text: link.text,
            line: link.line,
            severity: 'warning',
            reason: `Linked post exists but is "${status}" — will 404 for public readers`,
          });
        }
        continue;
      }

      // cls === 'unknown'
      issues.push({
        href: link.href,
        text: link.text,
        line: link.line,
        severity: 'warning',
        reason: 'Path does not match any known app route',
      });
    }

    return {
      totalLinks: links.length,
      issues,
      errorCount: issues.filter((i) => i.severity === 'error').length,
      warningCount: issues.filter((i) => i.severity === 'warning').length,
      isLoading: slugs.length > 0 && isLoading,
    };
  }, [links, slugRows, slugs.length, isLoading]);

  return result;
}
