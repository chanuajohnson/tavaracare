import React from "react";
import { Info } from "lucide-react";

type Variant = "compact" | "inline" | "full";

interface PlatformPositioningDisclaimerProps {
  variant?: Variant;
  className?: string;
}

/**
 * Single source of truth for Tavara's "coordination platform, not agency" positioning.
 * Mount this on every surface where users could mistake Tavara for an employment agency:
 * dashboards, onboarding, FAQ, generated PDFs, billing nudges.
 *
 * Variants:
 *  - compact: footer-style one-liner with badge
 *  - inline: short paragraph for intro cards
 *  - full: complete explanation for FAQ/legal sections
 */
export const PlatformPositioningDisclaimer: React.FC<PlatformPositioningDisclaimerProps> = ({
  variant = "compact",
  className = "",
}) => {
  if (variant === "compact") {
    return (
      <div
        className={`mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground ${className}`}
      >
        <span className="font-semibold text-foreground">Tavara is a Care Coordination & Management Platform.</span>{" "}
        Families engage caregivers directly. Tavara is not an employment or placement agency.
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm ${className}`}
      >
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <p className="text-foreground/80">
          <span className="font-semibold text-foreground">Tavara is a Care Coordination & Management Platform.</span>{" "}
          Families engage caregivers directly. Tavara coordinates matching, scheduling, payroll calculation, and
          quality oversight — but is not an employment agency, placement agency, or employer of caregivers.
        </p>
      </div>
    );
  }

  // full
  return (
    <div
      className={`rounded-lg border border-primary/20 bg-card p-6 ${className}`}
    >
      <h3 className="mb-3 text-lg font-semibold text-foreground">About Tavara's Model</h3>
      <p className="mb-3 text-sm leading-relaxed text-foreground/80">
        <span className="font-semibold text-foreground">Tavara is a Care Coordination & Management Platform.</span>{" "}
        Families engage caregivers directly. Tavara coordinates matching, scheduling, payroll calculation, and quality
        oversight — but is not an employment agency, placement agency, or employer of caregivers.
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Caregiver wages flow as a transparent pass-through; coordination fees fund platform operations, training
        oversight, and ongoing family support. The family is the employer of record for NIS purposes; Tavara provides
        tools, calculations, and government form generation as a coordination service.
      </p>
    </div>
  );
};

/**
 * Plain-text disclaimer for embedding in PDFs, emails, WhatsApp templates, and other
 * non-React surfaces where a single canonical line is needed.
 */
export const PLATFORM_POSITIONING_LINE =
  "Tavara is a Care Coordination & Management Platform. Families engage caregivers directly. Tavara is not an employment or placement agency.";

export default PlatformPositioningDisclaimer;
