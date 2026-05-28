import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, DollarSign, MessageCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import {
  buildCtaDestination,
  trackBlogCtaClick,
} from "@/lib/blog/attribution";

interface Props {
  postSlug: string;
}

type Tier = "standard" | "full_service" | "premium";

const TIERS: Record<Tier, { label: string; rate: number; rateLabel: string; blurb: string }> = {
  standard: {
    label: "Standard",
    rate: 40,
    rateLabel: "$40/hr",
    blurb: "Companion and daily living support",
  },
  full_service: {
    label: "Full Service",
    rate: 45,
    rateLabel: "$45/hr",
    blurb: "Personal care, mobility, light clinical tasks",
  },
  premium: {
    label: "Premium",
    rate: 50,
    rateLabel: "$50+/hr",
    blurb: "Complex needs, specialised clinical scope",
  },
};

const WA_NUMBER = "18687865357";

/**
 * Interactive care-rate estimator for the cost-of-care post.
 * Gives first-time visitors an immediate price answer (the reason they came),
 * with a low-commitment WhatsApp CTA and a secondary path to the readiness quiz.
 *
 * All pricing copy stays inside the public allow-list:
 *   per-hour tier rates ($40/$45/$50+) and the live-in starts-from floor ($2,400/wk).
 */
export function CostEstimator({ postSlug }: Props) {
  const [tier, setTier] = useState<Tier>("standard");
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const interactionLoggedRef = useRef(false);
  const tierMeta = TIERS[tier];

  const weeklyRate = useMemo(
    () => tierMeta.rate * hoursPerDay * daysPerWeek,
    [tierMeta.rate, hoursPerDay, daysPerWeek],
  );

  const formattedWeekly = useMemo(
    () => `$${weeklyRate.toLocaleString("en-US")}`,
    [weeklyRate],
  );

  // Fire one interaction event per session once the user touches any control.
  useEffect(() => {
    if (interactionLoggedRef.current) return;
    // Only log once values diverge from defaults.
    if (tier === "standard" && hoursPerDay === 8 && daysPerWeek === 5) return;
    interactionLoggedRef.current = true;
    void supabase.from("cta_engagement_tracking").insert({
      user_id: null,
      action_type: "cost_estimator_interacted",
      additional_data: {
        post_slug: postSlug,
        tier,
        hours_per_day: hoursPerDay,
        days_per_week: daysPerWeek,
        weekly_rate: weeklyRate,
      },
    });
  }, [tier, hoursPerDay, daysPerWeek, weeklyRate, postSlug]);

  const quizHref = buildCtaDestination(
    "/family/readiness-quiz",
    "hero-cost",
    postSlug,
  );

  const waMessage = encodeURIComponent(
    `Hi Tavara, I read the cost of care guide and used the estimator.\n` +
      `Tier: ${tierMeta.label} (${tierMeta.rateLabel})\n` +
      `Hours: ${hoursPerDay}/day · ${daysPerWeek} days/week\n` +
      `Estimated care rate: ${formattedWeekly}/week\n\n` +
      `Can you help me figure out the right fit for my loved one?`,
  );
  const waHref = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

  const logCta = (action: "cost_estimator_whatsapp_click" | "cost_estimator_quiz_click") => {
    void supabase.from("cta_engagement_tracking").insert({
      user_id: null,
      action_type: action,
      additional_data: {
        post_slug: postSlug,
        tier,
        hours_per_day: hoursPerDay,
        days_per_week: daysPerWeek,
        weekly_rate: weeklyRate,
      },
    });
  };

  return (
    <aside
      aria-label="Care rate estimator"
      className="not-prose mb-6 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 md:p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="rounded-full bg-primary/15 p-2 shrink-0">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Estimate care in Trinidad and Tobago
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            Pick a care level and shift size. The estimate updates as you adjust.
          </p>
        </div>
      </div>

      {/* Tier picker */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-foreground mb-2">
          Care level
        </label>
        <ToggleGroup
          type="single"
          value={tier}
          onValueChange={(v) => v && setTier(v as Tier)}
          className="grid grid-cols-3 gap-2"
        >
          {(Object.keys(TIERS) as Tier[]).map((t) => (
            <ToggleGroupItem
              key={t}
              value={t}
              aria-label={TIERS[t].label}
              className="flex flex-col items-center justify-center h-auto py-2 px-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border rounded-md"
            >
              <span className="text-[11px] font-semibold leading-tight">
                {TIERS[t].label}
              </span>
              <span className="text-[11px] opacity-90">{TIERS[t].rateLabel}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-[11px] text-muted-foreground mt-2">{tierMeta.blurb}</p>
      </div>

      {/* Hours slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-foreground">
            Hours per day
          </label>
          <span className="text-xs font-semibold text-primary tabular-nums">
            {hoursPerDay} hr
          </span>
        </div>
        <Slider
          value={[hoursPerDay]}
          min={4}
          max={12}
          step={1}
          onValueChange={(v) => setHoursPerDay(v[0])}
          aria-label="Hours per day"
        />
      </div>

      {/* Days slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-foreground">
            Days per week
          </label>
          <span className="text-xs font-semibold text-primary tabular-nums">
            {daysPerWeek} {daysPerWeek === 1 ? "day" : "days"}
          </span>
        </div>
        <Slider
          value={[daysPerWeek]}
          min={1}
          max={7}
          step={1}
          onValueChange={(v) => setDaysPerWeek(v[0])}
          aria-label="Days per week"
        />
      </div>

      {/* Estimate readout */}
      <div className="rounded-lg bg-background/70 border border-primary/20 p-4 mb-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
          Estimated care rate
        </p>
        <p className="text-2xl md:text-3xl font-bold text-foreground mt-1 tabular-nums">
          {formattedWeekly}
          <span className="text-sm font-medium text-muted-foreground"> / week</span>
        </p>
        <p className="text-[11px] text-muted-foreground mt-2">
          Prefer full-time in-home support? Live-in care starts from $2,400 / week.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => logCta("cost_estimator_whatsapp_click")}
          className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex-1"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp us your situation
        </a>
        <Link
          to={quizHref}
          state={{
            referringPagePath: `/blog/${postSlug}`,
            referringPageLabel: "Back to cost guide",
          }}
          onClick={() => {
            logCta("cost_estimator_quiz_click");
            void trackBlogCtaClick({
              postSlug,
              placement: "hero-cost",
              destination: quizHref,
            });
          }}
          className="group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-background px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors flex-1"
        >
          See caregivers who fit
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
        This is a planning estimate. We'll confirm the right care team and weekly schedule together — no commitment yet.
      </p>
    </aside>
  );
}
