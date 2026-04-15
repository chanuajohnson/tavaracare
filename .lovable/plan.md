

## Completed: System-Wide Pricing Alignment & Billing Enforcement

### Database Changes Applied
- `Active Care Management` → $699/week (was "Family Care Coordination Plan" at $499)
- `Premium Care Management` → $899/week (was "Family Premium" at $2,499/month)
- Legacy "Urgent Care Change / Escalation" deactivated
- 8 new service items added: Daily Care SOP + Monitoring ($149/wk), Light/Standard/High-Need Secondary Support ($150/$250/$400/wk), Home Setup ($199), Basic/Urgent/Emergency Escalation ($100/$200/$300)

### Files Modified
1. `RateTierReferenceCard.tsx` — $40/$45/$50+ rates
2. `onboardingSections.ts` — rates, SOP serviceCategory, care team pool, plan naming
3. `SubscriptionPage.tsx` — Active Care $699/wk, Premium $899/wk
4. `invoiceService.ts` — $40/hr, $699/wk defaults
5. `DocumentGenerationMenu.tsx` — dynamic line items from care_plan_service_selections
6. `BillingSummaryCard.tsx` — grouped Care Plan Commercial Summary with projected totals
7. `useUnitEconomics.ts` — $699/$899 subscription revenue
8. `FamilyDashboard.tsx` — $40–$50+ rates
9. `UserNudgeTab.tsx` — $40/$45/$50+ WhatsApp template
10. `FamilyOnboardingChecklistPage.tsx` — $40/hr default
11. `professionalOnboardingSections.ts` — $40/$45/$50+ rates
12. `FAQPage.tsx` — updated plan pricing
13. `SubscriptionFeaturesPage.tsx` — $699/wk, $3,299/mo
14. `EnhancedFamilyNextStepsPanel.tsx` — $699/week
15. `ProfessionalOnboardingChecklistPage.tsx` — $40/hr default
