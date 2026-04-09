import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract a display string from a JSONB name/description field.
 * Handles: string, { es: "...", en: "..." }, null/undefined
 */
export function extractName(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    return (obj.es || obj.en || Object.values(obj).find(v => typeof v === 'string') || '') as string;
  }
  return String(value);
}
