/**
 * PayPal Hosted Button Configuration for Errands Service
 * This is completely separate from the subscription PayPal setup
 */

export const ERRANDS_PAYPAL_CONFIG = {
  // Errands-specific PayPal Client ID (different from subscriptions)
  clientId: 'BAA98frn2StUv8pNoL8M8L5ksnt-mOyL8Ttqu_dTdTs9oyyU_bw7bEaoKGtBJEJELSs2Tp-Yr2HFAPvveM',
  
  // Hosted Button ID from PayPal Dashboard
  hostedButtonId: 'QJA4AUELY3U9Y',
  
  // Script configuration
  scriptConfig: {
    components: 'hosted-buttons',
    enableFunding: 'venmo',
    currency: 'USD',
  },
  
  // Button details
  buttonDetails: {
    name: 'On-Demand Errands Buddy',
    amount: 14.75, // USD (equivalent to TT$100 deposit)
    currency: 'USD',
  }
} as const;

/**
 * Generate the PayPal SDK script URL for errands
 */
export function getErrandsPayPalScriptUrl(): string {
  const { clientId, scriptConfig } = ERRANDS_PAYPAL_CONFIG;
  return `https://www.paypal.com/sdk/js?client-id=${clientId}&components=${scriptConfig.components}&enable-funding=${scriptConfig.enableFunding}&currency=${scriptConfig.currency}`;
}
