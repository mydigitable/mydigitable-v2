/**
 * Helper function to extract text from JSONB multi-language fields
 * @param jsonbField - The JSONB field from database (e.g., {es: "Entrantes", en: "Starters"})
 * @param preferredLang - Preferred language code (default: 'es')
 * @returns The text in the preferred language, or first available language, or empty string
 */
export function getLocalizedText(
    jsonbField: Record<string, string> | string | null | undefined,
    preferredLang: string = 'es'
): string {
    // If it's already a string, return it
    if (typeof jsonbField === 'string') {
        return jsonbField
    }

    // If it's null or undefined, return empty string
    if (!jsonbField) {
        return ''
    }

    // If it's an object (JSONB), extract the text
    if (typeof jsonbField === 'object') {
        // Try preferred language first
        if (jsonbField[preferredLang]) {
            return jsonbField[preferredLang]
        }

        // Try Spanish as fallback
        if (jsonbField['es']) {
            return jsonbField['es']
        }

        // Try English as second fallback
        if (jsonbField['en']) {
            return jsonbField['en']
        }

        // Return first available language
        const firstKey = Object.keys(jsonbField)[0]
        if (firstKey) {
            return jsonbField[firstKey]
        }
    }

    return ''
}
