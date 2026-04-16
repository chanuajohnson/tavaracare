
import React from "react";
import { Leaf, CheckCircle2 } from "lucide-react";

const SERVICE_TIERS = [
  {
    level: "Level 1",
    name: "Care Readiness Assessment",
    price: "$199",
    description:
      "Structured home walkthrough, caregiver workflow mapping, hygiene and safety assessment, decluttering recommendations, and space optimization plan.",
  },
  {
    level: "Level 2",
    name: "Guided Home Reset",
    price: "From $499",
    description:
      "Decluttering guidance with family, caregiver workspace setup, light organization, sanitation planning, and basic hazard removal.",
  },
  {
    level: "Level 3",
    name: "Full Care Environment Reset",
    price: "Custom",
    description:
      "Comprehensive care-space restructuring — including deep cleaning coordination, pest control coordination, removal of unsafe items, and full environment preparation. Coordinated and managed by Tavara.",
  },
];

export default function CareEnvironmentIntroCard() {
  return (
    <div className="mt-4 rounded-xl border border-green-200 bg-gradient-to-br from-green-50/60 to-emerald-50/40 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="h-5 w-5 text-green-700" />
        <h4 className="font-semibold text-base text-green-900">
          🌿 Preparing Your Home for Care
        </h4>
      </div>

      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        As your loved one transitions into this stage of care, the home may need
        to adapt as well. Caregiving introduces a new dynamic — your home
        becomes both a place of comfort and a structured care environment.
      </p>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        A well-prepared space supports your loved one's dignity and well-being,
        the caregiver's ability to provide safe and effective care, and a more
        peaceful daily experience for everyone.
      </p>

      <div className="rounded-lg bg-white/70 border border-green-100 p-4 mb-4">
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          "In some homes, especially where parents have lived for many years, a
          bit of preparation can make a meaningful difference — not just for the
          caregiver, but for your loved one's comfort, safety, and day-to-day
          well-being as well. We can support you in gently preparing the space so
          it feels lighter, safer, and easier to manage."
        </p>
      </div>

      <h5 className="text-sm font-medium mb-3 text-green-800">
        Tavara Care Environment Support — Service Tiers
      </h5>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SERVICE_TIERS.map((tier) => (
          <div
            key={tier.level}
            className="rounded-lg border bg-white/80 p-3 flex flex-col"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-800">
                {tier.level}
              </span>
            </div>
            <p className="text-sm font-medium mb-0.5">{tier.name}</p>
            <p className="text-xs font-semibold text-primary mb-1.5">
              {tier.price}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">
              {tier.description}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3 italic">
        Select applicable services below. These are coordinated and managed by
        Tavara — we guide, support, arrange, and manage vendors where needed.
      </p>
    </div>
  );
}
