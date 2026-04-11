

## Plan: Add Billing Cycle Toggle to Family Care & Premium Plans

### What Changes

The subscription page currently shows 3 cards (Basic free, Care $199.99/wk, Premium $699.99/mo). We keep 3 cards but add a **weekly/monthly toggle** to the two paid plans:

| Card | Weekly | Monthly |
|------|--------|---------|
| Family Basic | Free | — |
| Family Care | $199.99/week | $699.99/month |
| Family Premium | $399.99/month | $1,099.99/month |

### How It Works

1. Add a `billingCycle` state (`"weekly" | "monthly"`) with a toggle switch above the plan cards
2. Update the `familyPlans` data to include both `weeklyPrice` and `monthlyPrice` fields for each paid plan
3. The displayed price and period dynamically change based on the selected billing cycle
4. Family Premium only has monthly options, so the toggle switches between the two monthly price points ($399.99 and $1,099.99) — labeled as "Standard Monthly" vs "Premium Monthly" or simply both shown as monthly with the toggle acting as a tier selector

**Wait — clarification needed:** Family Premium has $399.99/mo and $1,099.99/mo. Since both are monthly, the toggle for Premium would be more like a "Standard vs Extended" toggle rather than weekly/monthly. Let me structure it as:

- **Global toggle**: Weekly / Monthly
- **Family Care**: $199.99 (weekly) ↔ $699.99 (monthly)  
- **Family Premium**: $399.99 (monthly) ↔ $1,099.99 (monthly) — when weekly is selected, show $399.99/mo; when monthly is selected, show $1,099.99/mo

This way the toggle conceptually maps to a shorter vs longer commitment across both plans.

### File Changed

`src/pages/subscription/SubscriptionPage.tsx`:
- Add `billingCycle` state and a toggle UI (pill-style switcher) above the cards
- Update plan objects with dual pricing (`priceWeekly`/`priceMonthly`)
- Render price dynamically based on toggle state
- Pass correct price to PayPal button based on selected cycle

