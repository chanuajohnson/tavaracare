/**
 * Currency conversion utilities
 * 
 * PayPal billing is in USD
 * TTD is displayed as a friendly estimate for local users
 */

// Exchange rate: USD to TTD
// Update this periodically or fetch from an API for real-time rates
const USD_TO_TTD_RATE = 6.78;

/**
 * Convert USD to TTD
 */
export function usdToTtd(usd: number): number {
  return Math.round(usd * USD_TO_TTD_RATE);
}

/**
 * Format price as "USD (≈ TTD)" for display
 */
export function formatUsdWithTtd(usd: number): string {
  const ttd = usdToTtd(usd);
  return `$${usd.toFixed(2)} USD (≈ TT$${ttd})`;
}

/**
 * Format just the TTD estimate
 */
export function formatTtdEstimate(usd: number): string {
  const ttd = usdToTtd(usd);
  return `TT$${ttd}`;
}

/**
 * Get the current exchange rate
 */
export function getExchangeRate(): number {
  return USD_TO_TTD_RATE;
}
