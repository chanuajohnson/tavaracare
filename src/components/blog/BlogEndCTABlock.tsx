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
 * End-of-article dual CTA block. Replaces the single optional aside so every
 * reader sees a foolproof path forward, whether they arrived as a family or a
 * caregiver. Inbound UTMs are forwarded to the registration funnel.
 */
export function BlogEndCTABlock({ postSlug }: Props) {
  const familyHref = buildCtaDestination("/family/readiness-quiz", "end-family", postSlug);
  const proHref = buildCtaDestination(
    "/registration/professional",
    "end-professional",
    postSlug,
  );

  return (
    <section
      aria-label="Where to go next"
      className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="rounded-lg border border-primary-200 bg-primary-100/40 p-6">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Heart className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Families</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Start your family care plan</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A short readiness assessment gives our coordinators what they need to suggest the
          right level of care for your household. No payment required to begin.
        </p>
        <Button
          asChild
          onClick={() =>
            void trackBlogCtaClick({
              postSlug,
              placement: "end-family",
              destination: familyHref,
            })
          }
        >
          <Link
            to={familyHref}
            state={{
              referringPagePath: `/blog/${postSlug}`,
              referringPageLabel: "Back to article",
            }}
          >
            Begin family readiness <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-6">
        <div className="flex items-center gap-2 mb-3 text-foreground">
          <UserCheck className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Caregivers</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Join our care team</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tell us about your experience and availability. Our team will guide you through
          screening and pair you with families who match your skills.
        </p>
        <Button
          asChild
          variant="outline"
          onClick={() =>
            void trackBlogCtaClick({
              postSlug,
              placement: "end-professional",
              destination: proHref,
            })
          }
        >
          <Link to={proHref}>
            Apply to join Tavara <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
