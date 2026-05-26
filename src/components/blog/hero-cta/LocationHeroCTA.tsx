import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  slug: string;
  areaServed?: string;
  primaryCtaHref?: string;
}

/**
 * Slug-specific hero CTA for location landing pages.
 * Answers the implicit "is care available in my area" search intent with
 * a single primary action and isolates click-through under the
 * `hero-location` placement so the admin funnel card can compare it
 * against the generic hero buttons.
 */
export function LocationHeroCTA({ slug, areaServed, primaryCtaHref }: Props) {
  const href = primaryCtaHref ?? "/family/readiness-quiz";
  const area = areaServed ?? "your area";

  const onClick = () => {
    void supabase.from("cta_engagement_tracking").insert({
      user_id: null,
      action_type: "location_cta_click",
      additional_data: {
        location_slug: slug,
        placement: "hero-location",
        destination: href,
        area_served: areaServed ?? null,
        page_url: typeof window !== "undefined" ? window.location.href : null,
      },
    });
  };

  return (
    <aside
      aria-label={`Arrange care in ${area}`}
      className="not-prose mb-6 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 md:p-6"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-full bg-primary/15 p-2 shrink-0">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Care in {area}
          </div>
          <p className="text-sm md:text-base text-foreground mt-1 leading-snug">
            Caregivers cover this area. Most families are matched within days, not weeks.
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Take the 2-minute readiness check and see what level of care fits your loved one, with a clear weekly estimate before you commit.
      </p>
      <Link
        to={href}
        state={{
          referringPagePath: `/${slug}`,
          referringPageLabel: `Back to ${area}`,
        }}
        onClick={onClick}
        className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        See if care fits my situation
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </aside>
  );
}
