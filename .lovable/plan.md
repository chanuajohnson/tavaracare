

## Plan: System-Wide Pricing Alignment & Billing Enforcement

This plan unifies all pricing, billing, service selection, document generation, and unit economics across Tavara into a single consistent system where onboarding selections are the source of truth.

---

### Database Changes (Migration + Inserts)

**Migration: Add new service items and update existing ones in `billable_service_items`**

Update existing items:
- "Family Care Coordination Plan" → price to $699/week
- Deactivate legacy "Urgent Care Change / Escalation" (replaced by tiered options)

Insert new items:
- Daily Care SOP + Monitoring — $149/week, category `weekly_addon`
- Light Secondary Support — $150/week, category `weekly_addon`
- Standard Secondary Support — $250/week, category `weekly_addon`
- High-Need Secondary Support — $400/week, category `weekly_addon`
- Home Setup Support / Care Readiness — $199 one-time, category `setup`
- Caregiver Matching & Placement — $299 one-time, category `setup`
- Basic Escalation Support — $100 one-time, category `care_change`
- Urgent Escalation Support — $200 one-time, category `care_change`
- Emergency Stabilization / Rapid Response — $300 one-time, category `care_change`

**Update `subscription_plans`**: Set Family Care to $699, add/update Family Premium at $899.

---

### File Changes

**1. `src/components/admin/onboarding/RateTierReferenceCard.tsx`**
- Update Standard: $35→$40/hr
- Update Full Service: $40→$45/hr
- Update Premium: $45+→$50+/hr
- Add admin-only note about caregiver compensation spread and NIS coverage

**2. `src/components/admin/onboarding/onboardingSections.ts`**
- Update `rates_and_changes` items: $35→$40, $40→$45, $45+→$50+
- Add `serviceCategory: "weekly_addon"` to `daily_checklist` section
- Update `daily_checklist` items to mention SOP monitoring, secondary support, escalation as billable add-ons
- Update `caregiver_matching` items to describe 3-person care team pool (primary + backup + additional backup), replacement logic
- Update `post_onboarding` item: "Family Care Plan (weekly)" → "Active Care Management (weekly)"
- Update `family_terms` item: same plan name update

**3. `src/pages/subscription/SubscriptionPage.tsx`**
- Family Care: $499→$699/week, $1,799→$2,499/month, rename to "Active Care Management"
- Family Premium: $2,499/month → $899/week + $3,299/month, rename to "Premium Care Management"
- Update descriptions to match new positioning

**4. `src/services/care-plans/invoiceService.ts`**
- `buildDefaultCareBillingData`: nurse rate $35→$40, subscription $199.99→$699
- Update subscription tier name to "Active Care Management"
- Update subscription rate string to "$699/week"
- Update comment about Anna Maria's case
- Add `carePlanId` parameter support to `buildDefaultCareBillingData` for dynamic line item generation

**5. `src/components/admin/care-plans/DocumentGenerationMenu.tsx`**
- Replace hardcoded podiatry toggle with dynamic service selection
- Add `carePlanId` prop and fetch approved `care_plan_service_selections` from Supabase
- Auto-generate line items from all selected/approved services
- Remove `buildDefaultCareBillingData` dependency; build line items dynamically from selections

**6. `src/components/admin/onboarding/BillingSummaryCard.tsx`**
- Restructure display into grouped sections: Core Plan, Care Services (hourly), Weekly Add-Ons, One-Time Fees
- Add projected totals at bottom: Weekly Total, One-Time Total, Monthly Recurring Projection (weekly × 4.33)
- Rename title to "Care Plan Commercial Summary"

**7. `src/hooks/admin/useUnitEconomics.ts`**
- `getWeeklySubscriptionRevenue`: remove `$2499/4.33` premium logic, remove `499` care logic
- Replace with: premium → $899/week, care → $699/week
- Service breakdown already pulls from `care_plan_service_selections` — no structural change needed

**8. `src/components/family/FamilyDashboard.tsx`**
- Update rate display: $35–$45+ → $40–$50+
- Update tier descriptions: Standard $40, Full Service $45, Premium $50+

**9. `src/components/admin/UserNudgeTab.tsx`**
- Update rate tiers in WhatsApp template: $35→$40, $40→$45, $45+→$50+

**10. `src/pages/family/FamilyOnboardingChecklistPage.tsx`**
- Update default care rate fallback from "$35/hr (Standard)" to "$40/hr (Standard)"

**11. `src/pages/registration/FamilyRegistration.tsx`**
- Update rate select options: $35→$40, $40→$45, $45+→$50+

**12. `src/pages/support/FAQPage.tsx`**
- Update subscription pricing in FAQ answer to match new tiers

**13. `src/pages/subscription/SubscriptionFeaturesPage.tsx`**
- Update pricing display: $199.99→$699

**14. `src/components/family/EnhancedFamilyNextStepsPanel.tsx`**
- Update pricing copy: $199.99→$699

**15. `src/components/admin/onboarding/professionalOnboardingSections.ts`**
- Update professional-facing rate tiers: $35→$40, $40→$45, $45+→$50+
- Add context about family billing vs caregiver compensation

---

### What Is NOT Changed
- Chat flow / registration flow logic
- Auth / routing / navigation
- Professional compensation/payout display (internal logic stays separate)
- Database schema structure (only data inserts/updates)

### Summary of Legacy Values Being Removed
| Old Value | New Value | Where |
|-----------|-----------|-------|
| $35/hr | $40/hr | All family-facing rates |
| $40/hr Full Service | $45/hr | All rate displays |
| $45+/hr Premium | $50+/hr | All rate displays |
| $199.99/week | $699/week | Invoice, FAQ, features page |
| $499/week | $699/week | Subscription page |
| $2,499/month (premium) | $899/week / $3,299/month | Subscription, unit economics |

