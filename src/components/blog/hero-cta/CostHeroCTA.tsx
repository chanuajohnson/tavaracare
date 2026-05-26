import { Link } from "react-router-dom";
import { ArrowRight, DollarSign } from "lucide-react";
import {
  buildCtaDestination,
  trackBlogCtaClick,
} from "@/lib/blog/attribution";

interface Props {
  postSlug: string;
}

/**
 * Slug-specific hero CTA for the senior-care-costs post.
 * Answers the implicit cost search query with a number anchor and routes
 * straight to the readiness quiz so the visitor takes one decisive action.
 */
export function CostHeroCTA({ postSlug }: Props) {
  const href = buildCtaDestination("/family/readiness-quiz", "hero-cost", postSlug);

  return (
    <aside
      aria-label="Care cost summary"
      className="not-prose mb-6 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 md:p-6"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-full bg-primary/15 p-2 shrink-0">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Care rates in Trinidad and Tobago
          </div>
          <p className="text-sm md:text-base text-foreground mt-1 leading-snug">
            Standard <strong>$40/hr</strong> · Full Service <strong>$45/hr</strong> · Premium <strong>$50+/hr</strong>
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Take the 2-minute readiness check and see what level of care fits your loved one, with a clear weekly estimate before you commit.
      </p>
      <Link
        to={href}
        state={{
          referringPagePath: `/blog/${postSlug}`,
          referringPageLabel: "Back to cost guide",
        }}
        onClick={() => void trackBlogCtaClick({ postSlug, placement: "hero-cost", destination: href })}
        className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        See what care fits my budget
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </aside>
  );
}
