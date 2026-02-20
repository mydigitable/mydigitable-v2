import type { ThemeDefinition } from './types'

export const THEMES: ThemeDefinition[] = [

    // ═══════════════════════════════════════════
    // TEMA 1: MODERN MINIMAL
    // Inspiración: Clean, Google Material You, iOS
    // Target: Cafeterías, healthy food, brunch
    // ═══════════════════════════════════════════
    {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        description: 'Limpio y profesional. El estándar que todos reconocen.',
        thumbnail: '⬜',
        targetRestaurant: 'Cafeterías, brunch, healthy food',
        tier: 'basic',
        tokens: {
            colorPrimary: '22 163 74',           // green-600
            colorPrimaryText: '255 255 255',
            colorBackground: '250 250 249',       // stone-50 (cálido, no puro blanco)
            colorSurface: '255 255 255',
            colorBorder: '231 229 228',           // stone-200
            colorTextPrimary: '28 25 23',         // stone-900
            colorTextSecondary: '120 113 108',    // stone-500
            colorTextMuted: '168 162 158',        // stone-400

            fontHeading: "'DM Sans', sans-serif",
            fontBody: "'DM Sans', sans-serif",
            fontPrice: "'DM Sans', sans-serif",

            radiusSm: '0.5rem',
            radiusMd: '0.75rem',
            radiusLg: '1rem',
            radiusFull: '9999px',

            shadowSm: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
            shadowMd: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
            shadowLg: '0 12px 32px -4px rgb(0 0 0 / 0.1)',

            headerBackground: 'rgb(255 255 255)',
            headerTextColor: '28 25 23',
            categoryActiveBackground: '22 163 74',
            categoryActiveText: '255 255 255',
            cartButtonBackground: '22 163 74',
            cartButtonText: '255 255 255',
        },
        customization: {
            allowPrimaryColor: true,
            allowFont: true,
            allowFontSize: true,
            availableFonts: ['system', 'dm-sans', 'poppins', 'quicksand'],
        },
    },

    // ═══════════════════════════════════════════
    // TEMA 2: CLASSIC BISTRO
    // Inspiración: "Chez Pierre" de las referencias
    // Target: Restaurantes franceses, bistros, fine casual
    // ═══════════════════════════════════════════
    {
        id: 'classic-bistro',
        name: 'Classic Bistro',
        description: 'Elegancia francesa. Para restaurantes con historia y carácter.',
        thumbnail: '🔵',
        targetRestaurant: 'Bistros, restaurantes franceses, fine casual',
        tier: 'basic',
        tokens: {
            colorPrimary: '30 58 138',            // blue-900 (azul marino)
            colorPrimaryText: '255 255 255',
            colorBackground: '254 252 243',       // warm cream
            colorSurface: '255 255 255',
            colorBorder: '220 215 201',           // warm border
            colorTextPrimary: '15 23 42',         // slate-900
            colorTextSecondary: '100 116 139',    // slate-500
            colorTextMuted: '148 163 184',        // slate-400

            fontHeading: "'Playfair Display', serif",
            fontBody: "'Lato', sans-serif",
            fontPrice: "'Playfair Display', serif",

            radiusSm: '0.25rem',
            radiusMd: '0.375rem',
            radiusLg: '0.5rem',
            radiusFull: '9999px',

            shadowSm: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
            shadowMd: '0 4px 12px -2px rgb(0 0 0 / 0.1)',
            shadowLg: '0 12px 32px -4px rgb(0 0 0 / 0.12)',

            headerBackground: 'rgb(30 58 138)',   // navy header
            headerTextColor: '255 255 255',
            categoryActiveBackground: '30 58 138',
            categoryActiveText: '255 255 255',
            cartButtonBackground: '30 58 138',
            cartButtonText: '255 255 255',
        },
        customization: {
            allowPrimaryColor: true,
            allowFont: true,
            allowFontSize: true,
            availableFonts: ['playfair', 'crimson', 'dm-sans'],
        },
    },

    // ═══════════════════════════════════════════
    // TEMA 3: CRAFT & BOLD
    // Inspiración: "The Craft & Barrel" de las referencias
    // Target: Craft beer bars, american food, burgers
    // ═══════════════════════════════════════════
    {
        id: 'craft-bold',
        name: 'Craft & Bold',
        description: 'Oscuro y masculino. Para bares y cocina americana con carácter.',
        thumbnail: '⬛',
        targetRestaurant: 'Craft bars, burgers, BBQ, americana',
        tier: 'basic',
        tokens: {
            colorPrimary: '194 120 49',           // copper/bronze
            colorPrimaryText: '255 255 255',
            colorBackground: '26 24 21',          // almost black
            colorSurface: '38 35 30',             // dark surface
            colorBorder: '58 54 46',             // dark border
            colorTextPrimary: '245 240 230',      // warm white
            colorTextSecondary: '168 156 134',    // warm gray
            colorTextMuted: '107 99 84',          // muted warm

            fontHeading: "'Bebas Neue', sans-serif",
            fontBody: "'Barlow', sans-serif",
            fontPrice: "'Bebas Neue', sans-serif",

            radiusSm: '0.25rem',
            radiusMd: '0.375rem',
            radiusLg: '0.5rem',
            radiusFull: '0.5rem',               // No circular, más cuadrado

            shadowSm: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
            shadowMd: '0 4px 12px -2px rgb(0 0 0 / 0.4)',
            shadowLg: '0 12px 32px -4px rgb(0 0 0 / 0.5)',

            headerBackground: 'linear-gradient(180deg, rgb(38 35 30), rgb(26 24 21))',
            headerTextColor: '245 240 230',
            categoryActiveBackground: '194 120 49',
            categoryActiveText: '255 255 255',
            cartButtonBackground: '194 120 49',
            cartButtonText: '255 255 255',
        },
        customization: {
            allowPrimaryColor: true,
            allowFont: true,
            allowFontSize: true,
            availableFonts: ['system', 'poppins', 'dm-sans'],
        },
    },

    // ═══════════════════════════════════════════
    // TEMA 4: NORDIC CLEAN
    // Inspiración: "Nordic Table" de las referencias
    // Target: Cafés nórdicos, brunch, saludable
    // ═══════════════════════════════════════════
    {
        id: 'nordic-clean',
        name: 'Nordic Clean',
        description: 'Escandinavo y fotográfico. Deja que las fotos hablen.',
        thumbnail: '🤍',
        targetRestaurant: 'Cafés nórdicos, brunch, healthy bowls',
        tier: 'basic',
        tokens: {
            colorPrimary: '82 82 82',             // neutral-600 (casi negro)
            colorPrimaryText: '255 255 255',
            colorBackground: '255 255 255',       // pure white
            colorSurface: '250 250 250',          // nearly white
            colorBorder: '240 240 240',           // very light
            colorTextPrimary: '23 23 23',         // neutral-900
            colorTextSecondary: '115 115 115',    // neutral-500
            colorTextMuted: '163 163 163',        // neutral-400

            fontHeading: "'Cormorant Garamond', serif",
            fontBody: "'Outfit', sans-serif",
            fontPrice: "'Outfit', sans-serif",

            radiusSm: '0rem',                     // Sin radius - cuadrado
            radiusMd: '0rem',
            radiusLg: '0.25rem',
            radiusFull: '9999px',                 // Solo pills

            shadowSm: '0 0 0 1px rgb(0 0 0 / 0.06)',
            shadowMd: '0 0 0 1px rgb(0 0 0 / 0.08), 0 4px 12px rgb(0 0 0 / 0.04)',
            shadowLg: '0 0 0 1px rgb(0 0 0 / 0.08), 0 12px 24px rgb(0 0 0 / 0.06)',

            headerBackground: 'rgb(255 255 255)',
            headerTextColor: '23 23 23',
            categoryActiveBackground: '23 23 23',
            categoryActiveText: '255 255 255',
            cartButtonBackground: '23 23 23',
            cartButtonText: '255 255 255',
        },
        customization: {
            allowPrimaryColor: true,
            allowFont: true,
            allowFontSize: true,
            availableFonts: ['system', 'dm-sans', 'poppins', 'quicksand'],
        },
    },

    // ═══════════════════════════════════════════
    // TEMA 5: WARM RUSTIC
    // Inspiración: Nonna's Cucina + Trattoria Toscana
    // Target: Italianos, españoles, tabernas, tapas
    // ═══════════════════════════════════════════
    {
        id: 'warm-rustic',
        name: 'Warm Rustic',
        description: 'Cálido y hogareño. Como comer en casa de la abuela.',
        thumbnail: '🟤',
        targetRestaurant: 'Restaurantes italianos, tabernas, tapas, tradicional',
        tier: 'basic',
        tokens: {
            colorPrimary: '180 83 9',             // amber-700 (terracota)
            colorPrimaryText: '255 255 255',
            colorBackground: '254 247 236',       // warm paper
            colorSurface: '255 253 247',          // cream
            colorBorder: '231 213 188',           // warm tan
            colorTextPrimary: '69 26 3',          // brown-900
            colorTextSecondary: '146 64 14',      // orange-800
            colorTextMuted: '180 130 100',        // muted brown

            fontHeading: "'Libre Baskerville', serif",
            fontBody: "'Source Sans 3', sans-serif",
            fontPrice: "'Libre Baskerville', serif",

            radiusSm: '0.25rem',
            radiusMd: '0.375rem',
            radiusLg: '0.5rem',
            radiusFull: '9999px',

            shadowSm: '0 1px 3px 0 rgb(100 50 0 / 0.08)',
            shadowMd: '0 4px 12px -2px rgb(100 50 0 / 0.1)',
            shadowLg: '0 12px 32px -4px rgb(100 50 0 / 0.12)',

            headerBackground: 'rgb(254 247 236)',
            headerTextColor: '69 26 3',
            categoryActiveBackground: '180 83 9',
            categoryActiveText: '255 255 255',
            cartButtonBackground: '180 83 9',
            cartButtonText: '255 255 255',
        },
        customization: {
            allowPrimaryColor: true,
            allowFont: true,
            allowFontSize: true,
            availableFonts: ['playfair', 'crimson', 'system'],
        },
    },
]

export const DEFAULT_THEME_ID = 'modern-minimal'

export function getThemeById(id: string): ThemeDefinition {
    return THEMES.find(t => t.id === id) ?? THEMES[0]
}
