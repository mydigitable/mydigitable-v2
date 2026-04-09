/**
 * Translation helper for multilingual fields
 * Extracts string value from fields that can be either string or object with language keys
 * 
 * @param field - Can be string, object with language keys {es: "...", en: "..."}, or any value
 * @param fallback - Optional fallback value if field is empty
 * @returns Extracted string value
 * 
 * @example
 * t("Simple string") // => "Simple string"
 * t({ es: "Hola", en: "Hello" }) // => "Hola"
 * t(null, "Default") // => "Default"
 */
export function t(field: any, fallback: string = ''): string {
    // Handle null/undefined
    if (field === null || field === undefined) return fallback;

    // Already a string
    if (typeof field === 'string') return field || fallback;

    // Object with language keys - prefer Spanish, then English, then first available
    if (typeof field === 'object' && !Array.isArray(field)) {
        return field?.es ?? field?.en ?? Object.values(field)[0] ?? fallback;
    }

    // Convert to string as last resort
    return String(field) || fallback;
}

/**
 * Safe number parser for prices and numeric values
 * 
 * @param value - Any value that should be a number
 * @param fallback - Fallback value if parsing fails (default: 0)
 * @returns Parsed number
 */
export function parseNumber(value: any, fallback: number = 0): number {
    if (typeof value === 'number' && !isNaN(value)) return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}

/**
 * Safe array getter - ensures value is always an array
 * 
 * @param value - Value that should be an array
 * @returns Array (empty if value is not an array)
 */
export function ensureArray<T = any>(value: any): T[] {
    if (Array.isArray(value)) return value;
    return [];
}
