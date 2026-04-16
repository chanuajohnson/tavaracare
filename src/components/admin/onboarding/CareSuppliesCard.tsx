
import React from "react";

const SUPPLY_CATEGORIES = [
  {
    emoji: "🧤",
    title: "Basic Care Supplies",
    items: [
      "Disposable medical gloves",
      "Hand sanitizer",
      "Disinfectant (Lysol, bleach, or vinegar solution)",
      "Cleaning cloths / rags / paper towels",
      "Garbage bags",
    ],
  },
  {
    emoji: "🩺",
    title: "Health & Monitoring",
    items: [
      "Thermometer",
      "Blood pressure machine (if available)",
      "Pulse oximeter (if available)",
      "Basic first aid kit",
    ],
  },
  {
    emoji: "💊",
    title: "Medications & Support",
    items: [
      "All prescribed medications (clearly labeled)",
      "Pill organizer (recommended)",
      "Over-the-counter basics (if approved): pain relief (e.g. Panadol, Advil), Milk of Magnesia / digestive support, antiseptic (Dettol, alcohol)",
    ],
  },
  {
    emoji: "🍽️",
    title: "Food & Nutrition",
    items: [
      "Groceries for daily meals",
      "Light snacks (fruit, crackers, etc.)",
      "Any dietary-specific items needed",
    ],
  },
  {
    emoji: "🛏️",
    title: "Personal Care",
    items: [
      "Towels and washcloths",
      "Soap, lotion, hygiene products",
      "Adult care supplies (if applicable)",
    ],
  },
  {
    emoji: "🧼",
    title: "Home Workspace Access",
    items: [
      "Clear workspace for the caregiver",
      "Access to kitchen and basic utilities",
      "Laundry access (for care-related use)",
    ],
  },
  {
    emoji: "➕",
    title: "Optional (Helpful)",
    items: [
      "Notebook for notes (if you prefer physical tracking)",
      "Extra linens",
      "Comfortable chair/space for caregiver during downtime",
    ],
  },
];

export default function CareSuppliesCard() {
  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
        Part 2 — Supplies & Readiness
      </p>
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        📋 Basic Care Supplies — Family Responsibility
      </h4>
      <p className="text-xs text-muted-foreground mb-4">
        The family is responsible for providing the following supplies to support the caregiver during each shift.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SUPPLY_CATEGORIES.map((cat) => (
          <div
            key={cat.title}
            className="rounded-lg border bg-muted/30 p-3"
          >
            <p className="font-medium text-sm mb-2">
              {cat.emoji} {cat.title}
            </p>
            <ul className="space-y-1">
              {cat.items.map((item, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                >
                  <span className="mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
