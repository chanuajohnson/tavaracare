import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildCtaDestination,
  trackBlogCtaClick,
  type BlogCtaPlacement,
} from "@/lib/blog/attribution";

interface Props {
  postSlug: string;
  category?: string | null;
}

const PROFESSIONAL_CATEGORIES = ["caregiver-awareness", "caregiver", "professional"];

function pickAudience(category?: string | null): "family" | "professional" {
  const c = (category ?? "").toLowerCase();
  return PROFESSIONAL_CATEGORIES.some((k) => c.includes(k)) ? "professional" : "family";
}

/**
 * Dismissible mobile-only sticky bar with a single primary CTA chosen by post
 * category. Hidden once dismissed for the session.
 */
export function BlogStickyMobileCTA({ postSlug, category }: Props) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(`tavara_blog_sticky_dismissed_${postSlug}`)) {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, [postSlug]);

  if (dismissed) return null;

  const audience = pickAudience(category);
  const placement: BlogCtaPlacement = "sticky-mobile";
  const baseHref =
    audience === "professional" ? "/registration/professional" : "/family/care-assessment";
  const href = buildCtaDestination(baseHref, placement, postSlug);
  const label =
    audience === "professional" ? "Join our care team" : "Start family readiness";

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(`tavara_blog_sticky_dismissed_${postSlug}`, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Button
          asChild
          size="sm"
          className="flex-1"
          onClick={() => void trackBlogCtaClick({ postSlug, placement, destination: href })}
        >
          <Link to={href}>
            {label} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={handleDismiss}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
