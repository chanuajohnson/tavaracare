import { Link } from "react-router-dom";
import { Heart, UserCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildCtaDestination,
  trackBlogCtaClick,
  type BlogCtaPlacement,
} from "@/lib/blog/attribution";

interface Props {
  postSlug: string;
}

/**
 * Inline dual CTA injected mid-article. Audience-forked: one card for families,
 * one for caregivers. Both carry inbound UTM attribution forward.
 */
export function BlogInlineCTA({ postSlug }: Props) {
  const onClick = (placement: BlogCtaPlacement, destination: string) => {
    void trackBlogCtaClick({ postSlug, placement, destination });
  };

  const familyHref = buildCtaDestination("/registration/family", "inline-family", postSlug);
  const proHref = buildCtaDestination(
    "/registration/professional",
    "inline-professional",
    postSlug,
  );

  return (
    <aside
      aria-label="Next step"
      className="not-prose my-10 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="rounded-lg border border-primary-200 bg-primary-100/30 p-5">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <Heart className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">For families</span>
        </div>
        <p className="text-base font-medium text-foreground mb-1">
          Arranging care for a loved one in Trinidad &amp; Tobago?
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Share what your household needs and we will help you build a steady care team.
        </p>
        <Button asChild size="sm" onClick={() => onClick("inline-family", familyHref)}>
          <Link
            to={familyHref}
            state={{
              referringPagePath: `/blog/${postSlug}`,
              referringPageLabel: "Back to article",
            }}
          >
            Start your family readiness <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-5">
        <div className="flex items-center gap-2 mb-2 text-foreground">
          <UserCheck className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">For caregivers</span>
        </div>
        <p className="text-base font-medium text-foreground mb-1">
          Are you a caregiver looking to join a coordinated care team?
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Tavara matches you with families who value continuity and professionalism.
        </p>
        <Button
          asChild
          size="sm"
          variant="outline"
          onClick={() => onClick("inline-professional", proHref)}
        >
          <Link to={proHref}>
            Apply to our care team <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
