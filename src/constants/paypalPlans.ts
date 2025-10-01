/**
 * PayPal Subscription Plan IDs
 * 
 * IMPORTANT: All plans are created in USD in PayPal dashboard
 * TTD prices are displayed as estimates only
 * 
 * To create new plans:
 * 1. Log into PayPal Dashboard
 * 2. Products & Services → Subscriptions
 * 3. Create plan with USD pricing
 * 4. Copy the Plan ID here
 */

export const PAYPAL_PLAN_IDS_USD = {
  // Replace these with your actual USD plan IDs from PayPal dashboard
  basic: 'P-8M440647PU980712UNDOUB4I', // Basic plan - update with USD plan ID
  standard: 'P-XXXXXXXXXXXXUSDSTD', // Standard plan - create in PayPal
  premium: 'P-XXXXXXXXXXXXUSDPREM', // Premium plan - create in PayPal
} as const;

export type PayPalPlanKey = keyof typeof PAYPAL_PLAN_IDS_USD;

// USD base prices for each plan (monthly)
export const PLAN_PRICES_USD = {
  basic: 44.99,      // ~TT$299 at 6.78 rate
  standard: 74.99,   // ~TT$499 at 6.78 rate
  premium: 119.99,   // ~TT$799 at 6.78 rate
} as const;
