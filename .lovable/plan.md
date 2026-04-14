

## Plan: Update Subscription Pricing & Rewrite Copy for Care Coordination

### Pricing Updates

| Plan | Weekly | Monthly | Current (Wrong) |
|------|--------|---------|-----------------|
| Family Basic | Free | Free | Same |
| Family Care | $499 | $1,799 | $199.99/wk, $699.99/mo |
| Family Premium | — (monthly only) | $2,499 | $399.99/wk, $1,099.99/mo |

### Changes in `src/pages/subscription/SubscriptionPage.tsx`

**1. Pricing values (lines 148-219)**
- Family Care: `priceWeekly: "$499"`, `priceMonthly: "$1,799"`
- Family Premium: `priceWeekly: "$2,499"`, `priceMonthly: "$2,499"` (monthly only — both show same price, or hide weekly toggle for Premium)

**2. Page header (lines 541-548)**
- Replace "Subscribe to Access Premium Features" with "Choose Your Care Coordination Plan"
- Replace feature type display with tagline: "Structure, coordination, and peace of mind — so you can focus on what matters most."

**3. Info banner (lines 558-581)**
- Replace "Upgrade to Unlock {featureType}" with "Find the right level of care coordination"
- Replace description with: "Every plan gives your family tools, guidance, and hands-on support to coordinate care with confidence."
- Remove video call variant copy

**4. Family Basic plan copy (lines 99-146)**
- Description: "Get organized and start building your care team"
- Rewrite features to coordination language:
  - "Family profile and care preferences setup"
  - "Care needs assessment and planning tools"
  - "Legacy Story — preserve your loved one's journey"
  - "Care team discovery and matching"
  - "Medication tracking and scheduling"
  - "Meal planning and grocery lists"
  - "Unlimited messaging with your care team"
  - "Community support and resources"
- Excluded features updated to match new names
- buttonText: "Get Started Free"

**5. Family Care plan copy (lines 147-183)**
- Description: "Active care coordination with dedicated management support"
- Rewrite features:
  - "Everything in Family Basic"
  - "Dedicated care coordinator assigned to your family"
  - "Care team scheduling and oversight"
  - "Video consultations for care planning"
  - "Care coordination and billing support"
  - "Weekly care check-ins and status updates"
- Excluded: "Priority matching and complex care management", "24/7 on-call coordinator"
- buttonText: "Start Care Coordination"

**6. Family Premium plan copy (lines 184-219)**
- Description: "Concierge-level coordination for complex or high-touch care needs"
- Rewrite features:
  - "Everything in Family Care"
  - "Priority care team matching and placement"
  - "Extended video consultations"
  - "Comprehensive care plan management"
  - "24/7 on-call coordinator support"
  - "Multi-caregiver scheduling and rotation management"
  - "Detailed care analytics and progress reports"
  - "Emergency escalation and rapid response coordination"
- buttonText: "Choose Premium"

**7. Clarity block — NEW (after billing toggle, ~line 597)**
Add a styled note:
> "Caregiver compensation is arranged directly between your family and your care team. Your Tavara subscription covers care coordination, management tools, and ongoing support to ensure care is delivered consistently and effectively."

**8. CTA buttons throughout**
- Replace "Upgrade to Care" → "Start Care Coordination"
- Replace "Upgrade to Premium" → "Choose Premium"
- Replace "Current Plan" → "Get Started Free"

### Single file change: `src/pages/subscription/SubscriptionPage.tsx`

