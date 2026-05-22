import { Link } from "react-router-dom";
import { Heart, UserCheck, ArrowRight } from "lucide-react";
import {
  buildCtaDestination,
  trackBlogCtaClick,
  type BlogCtaPlacement,
} from "@/lib/blog/attribution";

interface Props {
  postSlug: string;
}

/**
 * Compact dual CTA rendered near the top of the article (between the header
 * and the audio player). Designed for early-exit readers who never scroll to
 * the mid-article or end-of-article CTAs. Visually lighter than BlogInlineCTA.
 */
export function BlogTopCTA({ postSlug }: Props) {
  const onClick = (placement: BlogCtaPlacement, destination: string) => {
    void trackBlogCtaClick({ postSlug, placement, destination });
  };

  const familyHref = buildCtaDestination("/family/readiness-quiz", "top-family", postSlug);
  const proHref = buildCtaDestination(
    "/registration/professional",
    "top-professional",
    postSlug,
  );

  return (
    <aside
      aria-label="Start here"
      className="not-prose mb-8 rounded-lg border border-border bg-muted/30 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <Link
        to={familyHref}
        state={{
          referringPagePath: `/blog/${postSlug}`,
          referringPageLabel: "Back to article",
        }}
        onClick={() => onClick("top-family", familyHref)}
        className="group flex items-center justify-between gap-3 rounded-md border border-primary-200 bg-primary-100/40 px-4 py-3 hover:bg-primary-100/70 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Heart className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              For families
            </div>
            <div className="text-sm font-medium text-foreground truncate">
              Arrange care for a loved one
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <Link
        to={proHref}
        onClick={() => onClick("top-professional", proHref)}
        className="group flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3 hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <UserCheck className="h-4 w-4 text-foreground shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              For caregivers
            </div>
            <div className="text-sm font-medium text-foreground truncate">
              Join a coordinated care team
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </aside>
  );
}
