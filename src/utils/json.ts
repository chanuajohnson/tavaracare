
/**
 * Safely parse a JSON string into an object
 * @param jsonString The JSON string to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed object or the default value
 */
export function fromJson<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

/**
 * Safely convert an object to a JSON string
 * @param value The value to convert to JSON
 * @returns The JSON string or undefined if conversion fails
 */
export function toJson(value: any): string | undefined {
  if (value === undefined || value === null) return undefined;
  
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Error converting to JSON:', error);
    return undefined;
  }
}

/**
 * Type definition for JSON values
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
