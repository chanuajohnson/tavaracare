
/**
 * Safely converts a value to a JSON-compatible format for storage in Supabase JSONB columns.
 * Returns null if serialization fails.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export function toJson<T>(value: T): Json {
  try {
    return JSON.parse(JSON.stringify(value)) as Json;
  } catch (e) {
    console.warn('[toJson] Could not serialize:', e);
    return null;
  }
}

/**
 * Safely parses JSON data from Supabase with proper type casting.
 * Returns provided fallback value if parsing fails.
 */
export function fromJson<T>(json: unknown, fallback: T): T {
  try {
    if (json === null || json === undefined) {
      return fallback;
    }
    
    if (typeof json === 'string') {
      return JSON.parse(json) as T;
    }
    
    return json as T;
  } catch (e) {
    console.warn('[fromJson] Failed to parse JSON:', e);
    return fallback;
  }
}

/**
 * Safely accesses a nested property in an object with proper type casting.
 * Returns provided fallback if any part of the path is undefined.
 */
export function getNestedValue<T>(
  obj: Record<string, any> | null | undefined, 
  path: string, 
  fallback: T
): T {
  try {
    if (!obj) return fallback;
    
    const parts = path.split('.');
    let result: any = obj;
    
    for (const part of parts) {
      if (result === undefined || result === null) {
        return fallback;
      }
      result = result[part];
    }
    
    return (result === undefined || result === null) ? fallback : result as T;
  } catch (e) {
    console.warn(`[getNestedValue] Failed to get path ${path}:`, e);
    return fallback;
  }
}

/**
 * Ensures a value is a Record<string, any> type.
 * If the value is not an object or is null/array, returns an empty object.
 */
export function ensureRecord(value: any): Record<string, any> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
}
