import type { ThemeDefinition, ThemeFontSize, ThemeOverrides } from './types'
import { getThemeById } from './themes'

const FONT_SIZE_MAP: Record<ThemeFontSize, string> = {
    sm: '14px',
    md: '16px',
    lg: '18px',
}

export function applyThemeToDocument(
    themeId: string,
    overrides?: ThemeOverrides
) {
    const theme = getThemeById(themeId)
    const root = document.documentElement

    // Aplicar tokens base
    applyTokens(root, theme, overrides)

    // Marcar tema activo
    root.setAttribute('data-theme', themeId)
}

export function applyTokens(
    root: HTMLElement,
    theme: ThemeDefinition,
    overrides?: ThemeOverrides
) {
    const t = theme.tokens

    // Colors
    setCSSVar(root, '--color-primary', overrides?.primaryColor
        ? hexToRgbString(overrides.primaryColor)
        : t.colorPrimary
    )
    setCSSVar(root, '--color-primary-text', t.colorPrimaryText)
    setCSSVar(root, '--color-bg', t.colorBackground)
    setCSSVar(root, '--color-surface', t.colorSurface)
    setCSSVar(root, '--color-border', t.colorBorder)
    setCSSVar(root, '--color-text', t.colorTextPrimary)
    setCSSVar(root, '--color-text-secondary', t.colorTextSecondary)
    setCSSVar(root, '--color-text-muted', t.colorTextMuted)

    // Typography
    setCSSVar(root, '--font-heading', overrides?.fontFamily
        ? fontIdToCSS(overrides.fontFamily)
        : t.fontHeading
    )
    setCSSVar(root, '--font-body', t.fontBody)
    setCSSVar(root, '--font-price', t.fontPrice)
    setCSSVar(root, '--font-size-base', overrides?.fontSize
        ? FONT_SIZE_MAP[overrides.fontSize]
        : '16px'
    )

    // Shape
    setCSSVar(root, '--radius-sm', t.radiusSm)
    setCSSVar(root, '--radius-md', t.radiusMd)
    setCSSVar(root, '--radius-lg', t.radiusLg)
    setCSSVar(root, '--radius-full', t.radiusFull)

    // Shadows
    setCSSVar(root, '--shadow-sm', t.shadowSm)
    setCSSVar(root, '--shadow-md', t.shadowMd)
    setCSSVar(root, '--shadow-lg', t.shadowLg)

    // Semantic
    setCSSVar(root, '--header-bg', t.headerBackground)
    setCSSVar(root, '--header-text', t.headerTextColor)
    setCSSVar(root, '--category-active-bg', t.categoryActiveBackground)
    setCSSVar(root, '--category-active-text', t.categoryActiveText)
    setCSSVar(root, '--cart-bg', t.cartButtonBackground)
    setCSSVar(root, '--cart-text', t.cartButtonText)
}

function setCSSVar(root: HTMLElement, name: string, value: string) {
    root.style.setProperty(name, value)
}

function hexToRgbString(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return '22 163 74'
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
}

function fontIdToCSS(fontId: string): string {
    const map: Record<string, string> = {
        system: "system-ui, sans-serif",
        playfair: "'Playfair Display', serif",
        poppins: "'Poppins', sans-serif",
        'dm-sans': "'DM Sans', sans-serif",
        crimson: "'Crimson Text', serif",
        quicksand: "'Quicksand', sans-serif",
    }
    return map[fontId] ?? "system-ui, sans-serif"
}

// Helper para SSR - genera objeto de CSS variables
export function buildCSSVariables(theme: ThemeDefinition, overrides?: ThemeOverrides): Record<string, string> {
    const t = theme.tokens

    return {
        '--color-primary': overrides?.primaryColor
            ? hexToRgbString(overrides.primaryColor)
            : t.colorPrimary,
        '--color-primary-text': t.colorPrimaryText,
        '--color-bg': t.colorBackground,
        '--color-surface': t.colorSurface,
        '--color-border': t.colorBorder,
        '--color-text': t.colorTextPrimary,
        '--color-text-secondary': t.colorTextSecondary,
        '--color-text-muted': t.colorTextMuted,
        '--font-heading': overrides?.fontFamily ? fontIdToCSS(overrides.fontFamily) : t.fontHeading,
        '--font-body': t.fontBody,
        '--font-price': t.fontPrice,
        '--font-size-base': overrides?.fontSize ? FONT_SIZE_MAP[overrides.fontSize] : '16px',
        '--radius-sm': t.radiusSm,
        '--radius-md': t.radiusMd,
        '--radius-lg': t.radiusLg,
        '--radius-full': t.radiusFull,
        '--shadow-sm': t.shadowSm,
        '--shadow-md': t.shadowMd,
        '--shadow-lg': t.shadowLg,
        '--header-bg': t.headerBackground,
        '--header-text': t.headerTextColor,
        '--category-active-bg': t.categoryActiveBackground,
        '--category-active-text': t.categoryActiveText,
        '--cart-bg': t.cartButtonBackground,
        '--cart-text': t.cartButtonText,
    }
}
