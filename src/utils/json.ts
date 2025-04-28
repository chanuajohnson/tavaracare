
// Define Json type for type safety
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Safely parses JSON string to object
 */
export function fromJson<T>(jsonString: string | Json, defaultValue: T): T {
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString) as T;
    } catch (e) {
      console.error('Error parsing JSON string:', e);
      return defaultValue;
    }
  }
  return jsonString as unknown as T;
}

/**
 * Safely converts object to JSON string
 */
export function toJson(obj: any): Json {
  try {
    if (typeof obj === 'string') {
      return obj as Json;
    }
    return JSON.stringify(obj) as Json;
  } catch (e) {
    console.error('Error stringifying object to JSON:', e);
    return '{}' as Json;
  }
}
