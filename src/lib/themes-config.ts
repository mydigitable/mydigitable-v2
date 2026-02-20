// Theme Configuration Database
// Based on the 5 premium themes from mydigitable-5-temas.html

export interface ThemeConfig {
    id: string
    label: string
    description: string
    fontFamily: string
    cssVars: Record<string, string>
    previewColor: string
}

export const THEMES: Record<string, ThemeConfig> = {
    'modern-minimal': {
        id: 'modern-minimal',
        label: 'Modern Minimal',
        description: 'Limpio, moderno y profesional',
        fontFamily: 'var(--font-dm-sans)',
        cssVars: {
            '--p': '#16A34A',
            '--p-text': '#fff',
            '--bg': '#FAFAF9',
            '--surface': '#FFFFFF',
            '--border': '#E7E5E4',
            '--tx': '#1C1917',
            '--tx2': '#78716C',
            '--tx3': '#A8A29E',
            '--r': '12px',
        },
        previewColor: '#16A34A',
    },
    'classic-bistro': {
        id: 'classic-bistro',
        label: 'Classic Bistro',
        description: 'Elegante y tradicional',
        fontFamily: 'var(--font-lato)',
        cssVars: {
            '--navy': '#1E3A5F',
            '--gold': '#C9A84C',
            '--gl': '#F5EDD8',
            '--bg': '#FAF8F2',
            '--surface': '#FFFFFF',
            '--border': '#E2D9C5',
            '--tx': '#1A1408',
            '--tx2': '#6B5E45',
            '--tx3': '#A89880',
        },
        previewColor: '#1E3A5F',
    },
    'craft-bold': {
        id: 'craft-bold',
        label: 'Craft & Bold',
        description: 'Atrevido y moderno',
        fontFamily: 'var(--font-barlow)',
        cssVars: {
            '--cop': '#C2783A',
            '--cop-l': '#D4956A',
            '--bg': '#1A1815',
            '--surf': '#252220',
            '--surf2': '#2E2B27',
            '--brd': '#3A3630',
            '--tx': '#F5F0E8',
            '--tx2': '#B0A898',
            '--tx3': '#6B6358',
        },
        previewColor: '#C2783A',
    },
    'nordic-clean': {
        id: 'nordic-clean',
        label: 'Nordic Clean',
        description: 'Minimalista y sofisticado',
        fontFamily: 'var(--font-outfit)',
        cssVars: {
            '--bg': '#FFFFFF',
            '--surface': '#FFFFFF',
            '--border': '#E5E5E5',
            '--tx': '#171717',
            '--tx2': '#737373',
            '--tx3': '#A3A3A3',
        },
        previewColor: '#171717',
    },
    'warm-rustic': {
        id: 'warm-rustic',
        label: 'Warm Rustic',
        description: 'Cálido y acogedor',
        fontFamily: 'var(--font-source)',
        cssVars: {
            '--terra': '#B45309',
            '--terra-l': '#FEF3C7',
            '--bg': '#FEF7EC',
            '--paper': '#FFFDF7',
            '--brd': '#E7D9C1',
            '--brd2': '#D6C4A0',
            '--tx': '#3D1F00',
            '--tx2': '#7C4D14',
            '--tx3': '#B08040',
        },
        previewColor: '#B45309',
    },
}

// Helper to get theme by ID
export function getTheme(themeId: string): ThemeConfig {
    return THEMES[themeId] || THEMES['modern-minimal']
}

// Get all theme IDs
export function getAllThemeIds(): string[] {
    return Object.keys(THEMES)
}
