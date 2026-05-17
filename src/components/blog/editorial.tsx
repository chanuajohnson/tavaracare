import React from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial UI kit for Tavara blog posts.
 * Wired into ReactMarkdown via custom component overrides in BlogPostPage.
 *
 * Markdown conventions:
 *   `---`                     -> <SectionDivider />
 *   `> normal quote`          -> <PullQuote />
 *   `> [!LEARNED] body...`    -> <TavaraLearned />
 *   `> [!OBSERVATION] body`   -> <Observation />
 *
 * Plus `<DropCap>` wraps the article's opening paragraph in BlogPostPage.
 */

export const PullQuote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <blockquote className="my-10 border-l-4 border-primary pl-6 py-2 text-2xl md:text-3xl font-serif italic leading-snug text-foreground/90">
    {children}
  </blockquote>
);

export const TavaraLearned: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <aside className="my-10 rounded-lg border border-primary/30 bg-primary-100/40 px-6 py-5 not-italic">
    <div className="inline-block mb-2 text-xs font-semibold uppercase tracking-wider text-primary-700 bg-background/60 px-2 py-1 rounded">
      What Tavara has learned
    </div>
    <div className="text-base leading-relaxed text-foreground/90 [&_p]:m-0 [&_p+p]:mt-3">
      {children}
    </div>
  </aside>
);

export const Observation: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="my-8 border-l-2 border-accent bg-muted/50 px-5 py-3 text-base italic text-foreground/85 [&_p]:m-0">
    {children}
  </div>
);

export const SectionDivider: React.FC = () => (
  <div className="my-12 flex items-center justify-center gap-3 text-muted-foreground/60" aria-hidden>
    <span className="h-1 w-1 rounded-full bg-current" />
    <span className="h-1 w-1 rounded-full bg-current" />
    <span className="h-1 w-1 rounded-full bg-current" />
  </div>
);

export const DropCap: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-6xl first-letter:font-bold first-letter:font-serif first-letter:leading-none first-letter:text-primary",
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Parses a blockquote's text-only first child to extract a directive tag,
 * returning the variant and the cleaned children.
 */
export const parseDirective = (
  raw: string,
): { variant: "pullquote" | "learned" | "observation"; cleaned: string } => {
  const trimmed = raw.trimStart();
  if (trimmed.startsWith("[!LEARNED]")) {
    return { variant: "learned", cleaned: trimmed.replace(/^\[!LEARNED\]\s*/, "") };
  }
  if (trimmed.startsWith("[!OBSERVATION]")) {
    return { variant: "observation", cleaned: trimmed.replace(/^\[!OBSERVATION\]\s*/, "") };
  }
  return { variant: "pullquote", cleaned: raw };
};
