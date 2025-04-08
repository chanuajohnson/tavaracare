
import { Json } from "@/integrations/supabase/types";

/**
 * Safely converts a TypeScript value to a JSON-compatible value for Supabase
 */
export const toJson = <T>(value: T): Json => {
  return JSON.parse(JSON.stringify(value)) as Json;
};

/**
 * Safely converts a JSON value from Supabase to a typed value
 */
export const fromJson = <T>(value: Json | null | undefined): T | null => {
  if (value === null || value === undefined) {
    return null;
  }
  return value as T;
};
