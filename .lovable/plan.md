

## Family Cost Breakdown — "What does Week 1 actually cost?"

**Scenario:** Standard caregiver $40/hr · 8 hrs/day · 5 days/wk · smallest plan = **Active Care Management $699/wk**

---

### 1. One-time onboarding costs (Week 1 only)

Pulled live from the billable services catalog (`billable_service_items`):

| Item | Category | Cost (USD) |
|---|---|---|
| Care Assessment & Setup | setup | **$499** |
| Caregiver Matching & Placement | setup | **$299** |
| Care Readiness Assessment (Tier 1 home prep) | care_environment_support | **$199** |
| **One-time subtotal** | | **$997** |

> Tier 2 *Guided Home Reset* ($499) and Tier 3 *Full Reset* (custom quote) are **optional** — not assumed in the baseline.

---

### 2. Recurring weekly costs

| Item | USD/week | Notes |
|---|---|---|
| Caregiver wage (40 hrs × $40) | **$1,600** | Pass-through to caregiver — not Tavara revenue |
| NIS contribution (employer share, family responsibility) | **~$138.10** | Class based on $1,600 weekly wage; employee share (~$87.40) is deducted from caregiver pay, not added on top |
| Active Care Management (Tavara coordination) | **$699** | The "smallest plan" |
| **Weekly subtotal (family out-of-pocket)** | **~$2,437** | |

> NIS figures derived from the 2026 NIBTT schedule used in `nisCalculation.ts`. Exact class confirmed at first payroll run.

---

### 3. Optional weekly add-ons (often discussed at onboarding, not auto-billed)

| Add-on | USD/week |
|---|---|
| Medication Management Support | $99 |
| Daily Care SOP + Monitoring | $149 |
| Meal Support Upgrade | $75 |
| Light Secondary Support (other household member) | $150+ |

---

### 4. Conditional / "may apply" charges (transparency)

- **Holiday rate:** 1.5× ($60/hr); Christmas Day 2× ($80/hr)
- **Care Plan Adjustment Fee:** $149 one-time when scope changes from baseline
- **Basic Escalation Support:** $100 one-time per triggered incident (fall, urgent change)
- **Replacement caregiver outside the planned pool of 3** (1 primary + 2 backups): additional matching fee may apply

---

### 5. Totals at a glance

```text
Week 1 (with onboarding):   $997 one-time + $2,437 recurring = ~$3,434
Week 2 onward (steady state):                                  ~$2,437/wk
Monthly steady state (×4.33):                                  ~$10,556/mo
```

---

### 6. Suggested family-facing language

> "To set realistic expectations: your **first week** with Tavara at the standard care level (40 hours, $40/hr) and our entry-level Active Care Management plan comes to roughly **TT$23,300 (~US$3,434)**. That covers a one-time onboarding and home readiness investment of about US$997, plus your first week of caregiver wages (US$1,600), NIS employer contributions (~US$138), and Tavara's coordination fee (US$699).
>
> From **week two onward**, your steady weekly cost settles at around **US$2,437 (~TT$16,500)** — the wage you pay the caregiver directly, the family-side NIS contribution, and Tavara's weekly management.
>
> Anything beyond this baseline — holiday rates, care escalations, or a deeper home reset — is always **discussed and approved by you before it takes effect**. No surprise charges."

---

### 7. What I'd produce next (if you want)

A **printable one-page "Cost of Care — Baseline Estimate"** PDF (TTD + USD side by side) that families review and digitally acknowledge during the Service Commencement step. This becomes the anchor document so no family ever says *"I didn't know it would cost this much."*

### Note on a data inconsistency I spotted (not in scope but worth flagging)

The onboarding checklist text shows Standard rate as **$40/hr**, but the saved memory `mem://features/caregiver-rate-tiers` says **$35/hr**. The figures above use $40 (matching what families read on their checklist and your prompt). Worth aligning these before next family-facing rate update.

