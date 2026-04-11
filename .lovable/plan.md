

## Plan: Align Subscription Features Page and FAQ with Current Pricing

### Problem
Two files still show outdated pricing ($14.99, $29.99, $19.99, $34.99) that conflicts with the updated subscription tiers on `/subscription`.

### Affected Files

**File 1: `src/pages/subscription/SubscriptionFeaturesPage.tsx`** (lines 466-541)

The pricing sidebar shows:
- Family: "$14.99 Monthly subscription" with old feature list
- Professional Pro: "$19.99/month"
- Professional Expert: "$34.99/month"

Update the family section to show the 3-tier structure matching `/subscription`:
- **Family Basic** -- Free (profile, assessment, Legacy Story, matching, medication mgmt, meal planning, chat, community support)
- **Family Care** -- $199.99/week or $699.99/month
- **Family Premium** -- $399.99/month or $1,099.99/month

Add a "View All Plans" button linking to `/subscription` instead of inline PayPal buttons, since the sidebar is too narrow for a full toggle + 3 cards. Keep the professional section as-is for now (separate concern).

**File 2: `src/pages/support/FAQPage.tsx`** (lines 79-82)

The FAQ answer for "What are the subscription plans and pricing?" lists:
- Family Care: $14.99/month
- Family Premium: $29.99/month
- Professional Pro: $19.99/month
- Professional Expert: $34.99/month

Update to:
- Family Basic: Free -- profile, assessment, Legacy Story, matching, medication mgmt, meal planning, chat
- Family Care: $199.99/week or $699.99/month -- all Basic features + dedicated care coordinator, priority matching, video consultations
- Family Premium: $399.99/month or $1,099.99/month -- all Care features + care plan management, 24/7 on-call, billing management

### No other files affected
The `SubscriptionFeatureLink.tsx`, `LeadCaptureModal.tsx`, and `EnhancedFamilyNextStepsPanel.tsx` only contain navigation paths (not prices), so they need no changes.

