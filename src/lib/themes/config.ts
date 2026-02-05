/**
 * Theme Configuration for MyDigitable
 * 
 * 4 professional themes that restaurants can choose from:
 * - default: Verde Bosque + Amarillo (current)
 * - noir: Elegante para alta cocina
 * - organik: Natural eco-friendly
 * - neon: Vibrante para bares nocturnos
 * - minimal: Limpio fast-casual
 */

export type ThemeName = 'default' | 'noir' | 'organik' | 'neon' | 'minimal'

export interface ThemeColors {
    background: string        // HSL
    foreground: string        // HSL
    card: string             // HSL
    cardForeground: string   // HSL
    primary: string          // HSL
    primaryForeground: string // HSL
    secondary: string        // HSL
    secondaryForeground: string // HSL
    accent: string           // HSL
    accentForeground: string // HSL
    muted: string            // HSL
    mutedForeground: string  // HSL
    border: string           // HSL
    input: string            // HSL
    ring: string             // HSL
}

export interface Theme {
    name: ThemeName
    displayName: string
    description: string
    colors: ThemeColors
}

/**
 * Available themes
 */
export const themes: Record<ThemeName, Theme> = {
    // Verde Bosque (Dark) - Default
    default: {
        name: 'default',
        displayName: 'Verde Bosque',
        description: 'Tema por defecto - Moderno y versátil',
        colors: {
            background: '160 45% 6%',
            foreground: '160 5% 90%',
            card: '160 40% 10%',
            cardForeground: '160 5% 90%',
            primary: '142 71% 45%',
            primaryForeground: '160 5% 98%',
            secondary: '160 30% 20%',
            secondaryForeground: '160 5% 90%',
            accent: '48 96% 53%',
            accentForeground: '160 45% 10%',
            muted: '160 20% 15%',
            mutedForeground: '160 5% 60%',
            border: '160 30% 18%',
            input: '160 30% 18%',
            ring: '142 71% 45%',
        },
    },

    // Noir - Elegancia para Alta Cocina
    noir: {
        name: 'noir',
        displayName: 'Noir Élégant',
        description: 'Elegante y refinado - Ideal para restaurantes de alta cocina',
        colors: {
            background: '0 0% 8%',          // Negro profundo
            foreground: '40 20% 95%',       // Blanco cálido
            card: '0 0% 12%',               // Gris muy oscuro
            cardForeground: '40 20% 95%',
            primary: '42 100% 65%',         // Dorado elegante
            primaryForeground: '0 0% 10%',
            secondary: '0 0% 18%',          // Gris oscuro
            secondaryForeground: '40 20% 95%',
            accent: '42 100% 65%',          // Dorado
            accentForeground: '0 0% 10%',
            muted: '0 0% 15%',
            mutedForeground: '40 10% 65%',
            border: '0 0% 20%',
            input: '0 0% 20%',
            ring: '42 100% 65%',
        },
    },

    // Organik - Natural Eco-Friendly
    organik: {
        name: 'organik',
        displayName: 'Organik Natural',
        description: 'Natural y orgánico - Perfecto para restaurantes eco-friendly',
        colors: {
            background: '36 35% 92%',       // Beige claro
            foreground: '25 20% 15%',       // Marrón oscuro
            card: '40 40% 98%',             // Crema
            cardForeground: '25 20% 15%',
            primary: '90 48% 38%',          // Verde oliva
            primaryForeground: '40 40% 98%',
            secondary: '30 30% 75%',        // Beige medio
            secondaryForeground: '25 20% 15%',
            accent: '35 85% 55%',           // Naranja tierra
            accentForeground: '40 40% 98%',
            muted: '40 25% 85%',
            mutedForeground: '25 15% 40%',
            border: '40 20% 80%',
            input: '40 20% 80%',
            ring: '90 48% 38%',
        },
    },

    // Neon Street - Vibrante para Bares
    neon: {
        name: 'neon',
        displayName: 'Neon Street',
        description: 'Vibrante y energético - Ideal para bares y locales nocturnos',
        colors: {
            background: '265 85% 8%',       // Púrpura muy oscuro
            foreground: '280 5% 95%',       // Blanco frío
            card: '265 75% 12%',            // Púrpura oscuro
            cardForeground: '280 5% 95%',
            primary: '280 100% 65%',        // Púrpura neón
            primaryForeground: '265 85% 8%',
            secondary: '190 90% 50%',       // Cyan neón
            secondaryForeground: '265 85% 8%',
            accent: '320 95% 60%',          // Rosa neón
            accentForeground: '265 85% 8%',
            muted: '265 50% 20%',
            mutedForeground: '280 5% 70%',
            border: '265 70% 25%',
            input: '265 70% 25%',
            ring: '280 100% 65%',
        },
    },

    // Minimal Air - Limpio y Moderno
    minimal: {
        name: 'minimal',
        displayName: 'Minimal Air',
        description: 'Limpio y minimalista - Perfecto para fast-casual moderno',
        colors: {
            background: '0 0% 100%',        // Blanco puro
            foreground: '0 0% 10%',         // Negro suave
            card: '0 0% 98%',               // Gris muy claro
            cardForeground: '0 0% 10%',
            primary: '200 95% 45%',         // Azul vibrante
            primaryForeground: '0 0% 100%',
            secondary: '0 0% 92%',          // Gris claro
            secondaryForeground: '0 0% 10%',
            accent: '200 95% 45%',          // Azul
            accentForeground: '0 0% 100%',
            muted: '0 0% 94%',
            mutedForeground: '0 0% 45%',
            border: '0 0% 88%',
            input: '0 0% 88%',
            ring: '200 95% 45%',
        },
    },
}

/**
 * Get theme by name
 */
export function getTheme(name: ThemeName = 'default'): Theme {
    return themes[name] || themes.default
}

/**
 * Get all theme names
 */
export function getThemeNames(): ThemeName[] {
    return Object.keys(themes) as ThemeName[]
}

/**
 * Apply theme to document (for public menu)
 */
export function applyTheme(themeName: ThemeName) {
    const theme = getTheme(themeName)
    const root = document.documentElement

    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
        root.style.setProperty(cssVar, value)
    })
}
