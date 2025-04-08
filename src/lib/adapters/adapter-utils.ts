
import { Json } from '@/integrations/supabase/types';

/**
 * Helper to convert snake_case to camelCase
 */
export function snakeToCamel(s: string): string {
  return s.replace(/(_\w)/g, m => m[1].toUpperCase());
}

/**
 * Helper to convert camelCase to snake_case
 */
export function camelToSnake(s: string): string {
  return s.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`);
}

/**
 * Adapter for converting snake_case keys to camelCase
 */
export function adaptFromDb<T extends object>(data: Record<string, any>): T {
  if (!data) return {} as T;
  
  const result: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    const camelKey = snakeToCamel(key);
    let value = data[key];
    
    // Handle nested objects including arrays
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        value = value.map(item => 
          typeof item === 'object' && item !== null ? adaptFromDb(item) : item
        );
      } else {
        value = adaptFromDb(value);
      }
    }
    
    result[camelKey] = value;
  });
  
  return result as T;
}

/**
 * Adapter for converting camelCase keys to snake_case
 */
export function adaptToDb<T extends object>(data: Record<string, any>): T {
  if (!data) return {} as T;
  
  const result: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    const snakeKey = camelToSnake(key);
    let value = data[key];
    
    // Handle nested objects including arrays
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        value = value.map(item => 
          typeof item === 'object' && item !== null ? adaptToDb(item) : item
        );
      } else {
        value = adaptToDb(value);
      }
    }
    
    result[snakeKey] = value;
  });
  
  return result as T;
}

/**
 * Helper utility for safe JSON conversion
 */
export const toJson = <T>(value: T): Json => {
  if (value === undefined) return null;
  
  try {
    // Handle special cases
    if (value === null) return null;
    
    // Use a more robust approach for deeply nested objects
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    console.error('Error converting to JSON:', e);
    return null;
  }
};
