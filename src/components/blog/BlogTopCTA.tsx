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
 * High-contrast dual CTA placed directly under the article header so it is
 * visible above the fold. Outcome-led copy targets the two visitor intents:
 * families arranging care this week, and caregivers looking to join a team.
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
      className="not-prose mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <Link
        to={familyHref}
        state={{
          referringPagePath: `/blog/${postSlug}`,
          referringPageLabel: "Back to article",
        }}
        onClick={() => onClick("top-family", familyHref)}
        className="group flex items-center justify-between gap-3 rounded-lg border-2 border-primary bg-primary px-5 py-4 text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Heart className="h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide opacity-90">
              For families
            </div>
            <div className="text-base font-semibold truncate">
              Find care this week
            </div>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
      </Link>

      <Link
        to={proHref}
        onClick={() => onClick("top-professional", proHref)}
        className="group flex items-center justify-between gap-3 rounded-lg border-2 border-primary/40 bg-background px-5 py-4 hover:border-primary hover:bg-primary/5 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <UserCheck className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              For caregivers
            </div>
            <div className="text-base font-semibold text-foreground truncate">
              Get matched with families
            </div>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
      </Link>
    </aside>
  );
}
