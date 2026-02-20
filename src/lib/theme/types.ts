export type ThemeFontSize = 'sm' | 'md' | 'lg'

export type ThemeFont =
    | 'system'
    | 'playfair'
    | 'poppins'
    | 'dm-sans'
    | 'crimson'
    | 'quicksand'

export interface ThemeTokens {
    // Colors (stored as RGB values for Tailwind opacity support)
    colorPrimary: string        // "16 185 129"
    colorPrimaryText: string    // Color del texto sobre primary
    colorBackground: string     // "255 255 255"
    colorSurface: string        // "249 250 251"
    colorBorder: string         // "229 231 235"
    colorTextPrimary: string    // "17 24 39"
    colorTextSecondary: string  // "107 114 128"
    colorTextMuted: string      // "156 163 175"

    // Typography
    fontHeading: string         // Font family CSS string
    fontBody: string
    fontPrice: string

    // Spacing & Shape
    radiusSm: string            // "0.375rem"
    radiusMd: string            // "0.5rem"
    radiusLg: string            // "0.75rem"
    radiusFull: string          // "9999px"

    // Shadows
    shadowSm: string
    shadowMd: string
    shadowLg: string

    // Special effects
    headerBackground: string    // CSS background (puede ser gradient)
    headerTextColor: string
    categoryActiveBackground: string
    categoryActiveText: string
    cartButtonBackground: string
    cartButtonText: string
}

export interface ThemeDefinition {
    id: string
    name: string
    description: string
    thumbnail: string           // Emoji o color para preview rápido
    targetRestaurant: string    // "Restaurantes modernos, cafeterías"
    tier: 'basic' | 'pro' | 'enterprise'

    // Tokens base del tema
    tokens: ThemeTokens

    // Opciones de customización disponibles
    customization: {
        allowPrimaryColor: boolean
        allowFont: boolean
        allowFontSize: boolean
        availableFonts: ThemeFont[]
    }
}

export interface ThemeOverrides {
    primaryColor?: string
    fontFamily?: string
    fontSize?: ThemeFontSize
}
