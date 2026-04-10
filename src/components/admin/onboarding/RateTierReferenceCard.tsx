
import React from "react";
import { DollarSign } from "lucide-react";

const RATE_TIERS = [
  {
    name: "Standard",
    rate: "$35/hr",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    includes: [
      "Companionship & emotional support",
      "Medication reminders, administration & logging",
      "GAPP-certified personal care (bathing, dressing, toileting)",
      "Basic daily dietary meal preparation",
      "Mobility assistance & transportation accompaniment",
      "Light housekeeping",
      "Vital signs monitoring (BP, temp, pulse)",
      "Detailed daily care documentation",
      "Specialized care (dementia/Alzheimer's, post-surgical, palliative)",
    ],
  },
  {
    name: "Full Service",
    rate: "$40/hr",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-800",
    includes: [
      "Everything in Standard, plus:",
      "Advanced specialist-directed meal prep (holidays & special occasions)",
      "Complex medical needs (wound care, catheter care, oxygen management)",
      "Overnight / live-in shifts",
      "Advanced certifications required (RN, LPN)",
      "Behavioral health support",
    ],
  },
  {
    name: "Premium",
    rate: "$45+/hr",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    includes: [
      "Everything in Full Service, plus:",
      "Change-in-care-plan management",
      "Disease progression support (escalating needs beyond Full Service)",
      "Multi-specialist coordination",
      "24/7 on-call availability",
      "Advanced palliative / end-of-life care",
      "Family training & transition planning",
    ],
  },
];

const ADDITIONAL_RATES = [
  { label: "Holiday Rate", detail: "1.5× on recognized holidays" },
  { label: "Christmas Rate", detail: "2× on Christmas Day" },
  { label: "Overtime / Extended Hours", detail: "1.5× beyond agreed shift hours" },
  { label: "Change Orders", detail: "Scope increases documented before rate adjustment" },
];

export default function RateTierReferenceCard() {
  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Rate Tier Benchmark Reference
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {RATE_TIERS.map((tier) => (
          <div key={tier.name} className={`rounded-lg border p-3 ${tier.color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tier.badge}`}>
                {tier.name}
              </span>
              <span className="font-bold text-sm">{tier.rate}</span>
            </div>
            <ul className="space-y-1">
              {tier.includes.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="font-medium text-xs mb-2">Additional Rate Rules</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ADDITIONAL_RATES.map((rule) => (
            <div key={rule.label} className="text-xs">
              <span className="font-medium">{rule.label}:</span>{" "}
              <span className="text-muted-foreground">{rule.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
