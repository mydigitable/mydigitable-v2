'use client'

import { useMemo } from 'react'
import { ShoppingBag, Search, Star, Flame, Plus } from 'lucide-react'

import { extractName } from '@/lib/utils'

interface NProduct { id: string; name: string; description: string; price: number; imageUrl: string | null; isFeatured: boolean; badge: string | null; isAvailable: boolean }
interface NCategory { id: string; name: string; products: NProduct[]; layout_type?: string; grid_columns?: number; show_images?: boolean; show_prices?: boolean; show_descriptions?: boolean }
interface ThemeInfo { slug: string; headerStyle: string; categoryStyle: string; cardShape: string; featuredStyle: string; layoutType: string; fonts: { heading: string; body: string } }
interface DesignConfig { selected_theme?: Record<string, unknown> | null; custom_colors?: Record<string, string>; layout_type?: string; grid_columns?: number; card_style?: string; spacing?: string; spacing_value?: number; border_radius?: number; show_search?: boolean; show_categories?: boolean; show_images?: boolean; show_prices?: boolean; show_descriptions?: boolean;[key: string]: unknown }

const DEFAULTS: Record<string, string> = { primary: '#16A34A', background: '#FAFAF9', surface: '#FFFFFF', border: '#E7E5E4', text: '#1C1917', text_secondary: '#78716C' }

export function MenuMobilePreview({ restaurant, menus, categories: rawCats, designConfig, className = '' }: {
    restaurant: { name?: string; business_name?: string } | null
    menus?: Array<Record<string, unknown>>
    categories?: Array<Record<string, unknown>>
    designConfig?: DesignConfig | null
    className?: string
}) {
    const dc = designConfig || {} as DesignConfig
    const theme = useMemo<ThemeInfo>(() => {
        const t = dc.selected_theme as Record<string, unknown> | null
        const fonts = (t?.fonts || {}) as Record<string, string>
        return {
            slug: (t?.slug as string) || 'modern-minimal',
            headerStyle: (t?.header_style as string) || 'simple',
            categoryStyle: (t?.category_style as string) || 'pills',
            cardShape: (t?.card_shape as string) || 'rounded',
            featuredStyle: (t?.featured_style as string) || 'banner',
            layoutType: (t?.layout_type as string) || dc.layout_type as string || 'grid',
            fonts: { heading: fonts.heading || 'DM Sans', body: fonts.body || 'DM Sans' }
        }
    }, [dc])

    const cssVars = useMemo(() => {
        const custom = (dc.custom_colors || {}) as Record<string, string>
        const tColors = ((dc.selected_theme as Record<string, unknown>)?.colors || {}) as Record<string, string>
        const g = (k: string) => custom[k] || custom[`color_${k}`] || tColors[k] || DEFAULTS[k] || '#000'
        return {
            '--c-pri': g('primary'), '--c-acc': custom.accent || tColors.accent || g('primary'),
            '--c-bg': g('background'), '--c-surf': g('surface'), '--c-brd': g('border'),
            '--c-tx': g('text'), '--c-tx2': g('text_secondary'),
            '--f-head': theme.fonts.heading, '--f-body': theme.fonts.body,
        } as React.CSSProperties
    }, [dc, theme])

    const layout = dc.layout_type || theme.layoutType || 'grid'
    const cols = dc.grid_columns ?? 2
    const showSearch = dc.show_search !== false
    const showCats = dc.show_categories !== false
    const showImg = dc.show_images !== false
    const showPrice = dc.show_prices !== false
    const showDesc = dc.show_descriptions !== false
    const showHeader = dc.show_header !== false
    const showLogo = dc.show_logo !== false
    const logoUrl = (dc as Record<string, unknown>).logo_url as string || ''
    const headerSub = (dc as Record<string, unknown>).header_subtitle as string || ''
    const spacing = typeof dc.spacing_value === 'number' ? `${dc.spacing_value}px` : dc.spacing === 'compact' ? '6px' : dc.spacing === 'relaxed' ? '16px' : '10px'
    const br = dc.border_radius ?? (theme.cardShape === 'sharp' ? 3 : theme.cardShape === 'square' ? 2 : theme.cardShape === 'borderless' ? 0 : theme.cardShape === 'soft' ? 5 : 12)
    const cardStyle = (dc.card_style as string) || 'elevated'

    // Card style CSS helper
    const cardCSS = (overrides?: React.CSSProperties): React.CSSProperties => {
        const base: React.CSSProperties = { background: 'var(--c-surf)', borderRadius: cardR, ...overrides }
        if (cardStyle === 'flat') {
            // No border, no shadow
            return base
        }
        if (cardStyle === 'outlined') {
            return { ...base, border: '1.5px solid var(--c-brd)', boxShadow: 'none' }
        }
        // 'elevated' — shadow
        return { ...base, border: '1px solid var(--c-brd)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
    }

    const { allCategories, featuredProducts } = useMemo(() => {
        let cats: NCategory[] = []
        const src = menus && menus.length > 0 ? menus.flatMap(m => ((m.categories || []) as Array<Record<string, unknown>>)) : (rawCats || []).filter((c: Record<string, unknown>) => c.is_active !== false)
        cats = (src as Array<Record<string, unknown>>).map(cat => ({
            id: String(cat.id || ''),
            name: extractName(cat.name) || 'Categoría',
            layout_type: (cat.layout_type as string) || undefined,
            grid_columns: cat.grid_columns != null ? Number(cat.grid_columns) : undefined,
            show_images: cat.show_images != null ? Boolean(cat.show_images) : undefined,
            show_prices: cat.show_prices != null ? Boolean(cat.show_prices) : undefined,
            show_descriptions: cat.show_descriptions != null ? Boolean(cat.show_descriptions) : undefined,
            products: ((cat.products || []) as Array<Record<string, unknown>>).filter(p => p.is_available !== false).map(p => ({
                id: String(p.id || ''), name: extractName(p.name) || 'Producto',
                description: extractName(p.description) || '',
                price: Number(p.price) || 0, imageUrl: (p.image_url as string) || null,
                isFeatured: Boolean(p.is_featured), badge: (p.featured_badge as string) || null, isAvailable: true,
            }))
        }))
        return { allCategories: cats, featuredProducts: cats.flatMap(c => c.products).filter(p => p.isFeatured).slice(0, 3) }
    }, [menus, rawCats])

    const restName = restaurant?.business_name || restaurant?.name || 'Mi Restaurante'
    const isDark = theme.slug === 'craft-bold'
    const isBistro = theme.slug === 'classic-bistro'
    const isNordic = theme.slug === 'nordic-clean'
    const isRustic = theme.slug === 'warm-rustic'

    // Card border radius for this theme
    const cardR = `${br}px`
    const addBtnR = `${Math.min(br, 8)}px`

    // Handle broken images gracefully
    const imgError = (e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).style.display = 'none' }

    // Determine if grid/photo-grid layout is active (needed for container logic)
    const isGridLayout = layout === 'grid' || layout === 'photo-grid'
    const isHorizontal = layout === 'horizontal'
    const isList = layout === 'list'

    // Per-theme styling tokens
    const themeTokens = isDark
        ? { head: 'var(--f-head)', btnBg: 'var(--c-acc)', btnText: 'white', btnR: 2, lsp: '0.05em' }
        : isBistro
            ? { head: 'var(--f-head)', btnBg: 'var(--c-pri)', btnText: 'white', btnR: 2, lsp: '0.06em' }
            : isRustic
                ? { head: 'var(--f-head)', btnBg: 'var(--c-pri)', btnText: 'white', btnR: 3, lsp: undefined }
                : isNordic
                    ? { head: 'var(--f-head)', btnBg: 'transparent', btnText: 'var(--c-tx)', btnR: 999, lsp: undefined }
                    : { head: 'var(--f-head)', btnBg: 'var(--c-pri)', btnText: 'white', btnR: parseInt(addBtnR), lsp: undefined }

    // Add button per theme
    function renderAddBtn(size: 'sm' | 'md') {
        const s = size === 'sm' ? { w: 'w-5 h-5', icon: 'w-3 h-3' } : { w: 'w-7 h-7', icon: 'w-3.5 h-3.5' }
        if (isNordic) return (
            <div className={`${s.w} rounded-full flex items-center justify-center text-xs`} style={{ border: '1.5px solid var(--c-tx)', color: 'var(--c-tx)' }}>+</div>
        )
        if (isDark) return (
            <div className={`${s.w} flex items-center justify-center text-xs`} style={{ border: '1.5px solid var(--c-pri)', borderRadius: 2, color: 'var(--c-pri)' }}>+</div>
        )
        return (
            <button className={`${s.w} flex items-center justify-center`} style={{ background: themeTokens.btnBg, color: themeTokens.btnText, borderRadius: addBtnR }}><Plus className={s.icon} /></button>
        )
    }
    // ─── renderProduct now accepts per-category overrides ─────
    function renderProduct(p: NProduct, idx: number, catOverrides?: { showImg: boolean; showPrice: boolean; showDesc: boolean }) {
        // Use per-category overrides if provided, else global defaults
        const showImg = catOverrides?.showImg ?? (dc.show_images !== false)
        const showPrice = catOverrides?.showPrice ?? (dc.show_prices !== false)
        const showDesc = catOverrides?.showDesc ?? (dc.show_descriptions !== false)
        // ─── HORIZONTAL CARD (all themes) ──────────────────────────
        if (isHorizontal) return (
            <div key={p.id} className="flex-shrink-0 overflow-hidden" style={{ ...cardCSS(), width: '160px' }}>
                {showImg && p.imageUrl && <div className="w-full" style={{ aspectRatio: '4/3', background: 'var(--c-brd)' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                <div className="p-2">
                    <div className="text-[10px] font-bold line-clamp-1" style={{ fontFamily: themeTokens.head, color: 'var(--c-tx)', letterSpacing: themeTokens.lsp }}>{p.name}</div>
                    {showDesc && p.description && <div className="text-[9px] line-clamp-1 mt-0.5" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                    <div className="flex items-center justify-between mt-1.5">
                        {showPrice && <span className="text-xs font-bold" style={{ color: 'var(--c-pri)' }}>€{p.price}</span>}
                        {renderAddBtn('sm')}
                    </div>
                </div>
            </div>
        )

        // ─── PHOTO-GRID CARD (all themes · square image, minimal text) ─
        if (layout === 'photo-grid') return (
            <div key={p.id} className="overflow-hidden" style={cardCSS()}>
                {showImg && p.imageUrl && <div className="w-full" style={{ aspectRatio: '1', background: 'var(--c-brd)' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                <div className="p-2">
                    <div className="text-[11px] font-bold line-clamp-1" style={{ fontFamily: themeTokens.head, color: 'var(--c-tx)', letterSpacing: themeTokens.lsp }}>{p.name}</div>
                    <div className="flex items-center justify-between mt-1">
                        {showPrice && <span className="text-xs font-bold" style={{ color: 'var(--c-pri)' }}>€{p.price}</span>}
                        {renderAddBtn('sm')}
                    </div>
                </div>
            </div>
        )

        // ─── LIST CARD (per-theme styling) ─────────────────────────
        if (isList) {
            // CRAFT list: numbered rows
            if (isDark) return (
                <div key={p.id} className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--c-brd)' }}>
                    <span style={{ fontFamily: themeTokens.head, fontSize: 22, color: 'var(--c-brd)', width: 28, textAlign: 'center' as const }}>{String(idx + 1).padStart(2, '0')}</span>
                    {showImg && p.imageUrl && <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden" style={{ border: '1px solid var(--c-brd)' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                    <div className="flex-1 min-w-0">
                        <div style={{ fontFamily: themeTokens.head, fontSize: 14, letterSpacing: '0.05em', color: 'var(--c-tx)', lineHeight: 1.2 }}>{p.name}</div>
                        {showDesc && p.description && <div className="text-[10px] line-clamp-1 mt-0.5" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                        {showPrice && <span style={{ fontFamily: themeTokens.head, fontSize: 16, color: 'var(--c-pri)', letterSpacing: '0.05em' }}>€{p.price}</span>}
                        <div className="mt-1">{renderAddBtn('sm')}</div>
                    </div>
                </div>
            )
            // NORDIC list: minimal line items
            if (isNordic) return (
                <div key={p.id} className="flex items-center justify-between py-3 gap-3" style={{ borderBottom: '1px solid var(--c-brd)' }}>
                    <div className="min-w-0 flex-1">
                        <div style={{ fontFamily: themeTokens.head, fontSize: 15, fontWeight: 300, color: 'var(--c-tx)' }}>{p.name}</div>
                        {showDesc && p.description && <div className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--c-tx2)', fontWeight: 300 }}>{p.description}</div>}
                    </div>
                    <div className="flex-shrink-0 text-right">
                        {showPrice && <span style={{ fontFamily: themeTokens.head, fontSize: 15, fontWeight: 300, color: 'var(--c-tx)' }}>€{p.price}</span>}
                        <div className="mt-1 ml-auto">{renderAddBtn('sm')}</div>
                    </div>
                </div>
            )
            // BISTRO list: elegant cards
            if (isBistro) return (
                <div key={p.id} className="flex gap-3 p-3" style={cardCSS()}>
                    {showImg && p.imageUrl && <div className="w-16 h-16 flex-shrink-0 overflow-hidden" style={{ borderRadius: cardR }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                    <div className="flex-1 min-w-0">
                        <div style={{ fontFamily: themeTokens.head, fontSize: 13, fontWeight: 600, color: 'var(--c-tx)' }}>{p.name}</div>
                        {showDesc && p.description && <div className="text-[10px] line-clamp-2 mt-0.5 mb-2" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                        <div className="flex items-center justify-between">
                            {showPrice && <span style={{ fontFamily: themeTokens.head, fontSize: 14, fontWeight: 700, color: 'var(--c-pri)' }}>€{p.price}</span>}
                            <button className="text-[9px] font-bold uppercase tracking-wider px-3 py-1" style={{ background: themeTokens.btnBg, color: themeTokens.btnText, borderRadius: themeTokens.btnR, letterSpacing: themeTokens.lsp }}>Añadir</button>
                        </div>
                    </div>
                </div>
            )
            // RUSTIC list: side-image card
            if (isRustic && showImg && p.imageUrl) return (
                <div key={p.id} className="flex overflow-hidden" style={cardCSS()}>
                    <div className="w-24 flex-shrink-0 relative" style={{ background: '#FEF3C7' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} />
                        {p.badge && <div className="absolute top-2 left-0 text-[8px] font-bold text-white px-2 py-0.5 uppercase" style={{ background: 'var(--c-pri)' }}>★ {p.badge}</div>}
                    </div>
                    <div className="flex-1 p-3">
                        <div style={{ fontFamily: themeTokens.head, fontSize: 13, fontWeight: 700, color: 'var(--c-tx)', lineHeight: 1.3 }}>{p.name}</div>
                        {showDesc && p.description && <div className="text-[10px] line-clamp-2 mt-1 mb-2" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                        <div className="flex items-center justify-between">
                            {showPrice && <span style={{ fontFamily: themeTokens.head, fontSize: 15, fontWeight: 700, color: 'var(--c-pri)' }}>€{p.price}</span>}
                            <button className="text-[10px] font-semibold px-3 py-1" style={{ background: themeTokens.btnBg, color: themeTokens.btnText, borderRadius: themeTokens.btnR }}>Ordenar</button>
                        </div>
                    </div>
                </div>
            )
            // Default list (Modern Minimal + Rustic fallback)
            return (
                <div key={p.id} className="flex gap-3 p-3" style={cardCSS()}>
                    {showImg && p.imageUrl && <div className="w-16 h-16 flex-shrink-0 overflow-hidden" style={{ borderRadius: `${Math.min(br, 8)}px` }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--c-tx)' }}>{p.name}</div>
                        {showDesc && p.description && <div className="text-[10px] mb-1 line-clamp-2" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                        {showPrice && <span className="text-sm font-bold" style={{ color: 'var(--c-pri)' }}>€{p.price}</span>}
                    </div>
                    {renderAddBtn('md')}
                </div>
            )
        }

        // ─── GRID CARD (per-theme styling) ─────────────────────────
        // CRAFT grid: dark industrial card
        if (isDark) return (
            <div key={p.id} className="overflow-hidden" style={cardCSS()}>
                {showImg && p.imageUrl && <div className="w-full" style={{ aspectRatio: '4/3', background: '#2A2520' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                <div className="p-2.5">
                    <div style={{ fontFamily: themeTokens.head, fontSize: 12, letterSpacing: '0.05em', color: 'var(--c-tx)', lineHeight: 1.3 }}>{p.name}</div>
                    {showDesc && p.description && <div className="text-[10px] mt-0.5 mb-1 line-clamp-2" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                    <div className="flex items-center justify-between mt-1">
                        {showPrice && <span style={{ fontFamily: themeTokens.head, fontSize: 14, color: 'var(--c-pri)', letterSpacing: '0.05em' }}>€{p.price}</span>}
                        {renderAddBtn('sm')}
                    </div>
                </div>
            </div>
        )
        // BISTRO grid: elegant card
        if (isBistro) return (
            <div key={p.id} className="overflow-hidden" style={cardCSS()}>
                {showImg && p.imageUrl && <div className="w-full" style={{ aspectRatio: '4/3', background: 'var(--c-brd)' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                <div className="p-2.5">
                    <div style={{ fontFamily: themeTokens.head, fontSize: 12, fontWeight: 600, color: 'var(--c-tx)' }}>{p.name}</div>
                    {showDesc && p.description && <div className="text-[10px] mt-0.5 mb-1 line-clamp-2" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                    <div className="flex items-center justify-between mt-1">
                        {showPrice && <span style={{ fontFamily: themeTokens.head, fontSize: 13, fontWeight: 700, color: 'var(--c-pri)' }}>€{p.price}</span>}
                        <button className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5" style={{ background: themeTokens.btnBg, color: themeTokens.btnText, borderRadius: themeTokens.btnR, letterSpacing: themeTokens.lsp }}>Añadir</button>
                    </div>
                </div>
            </div>
        )
        // NORDIC grid: clean minimal card with subtle border
        if (isNordic) return (
            <div key={p.id} className="overflow-hidden" style={{ background: 'var(--c-surf)', borderRadius: cardR, border: '1px solid var(--c-brd)' }}>
                {showImg && p.imageUrl && <div className="w-full" style={{ aspectRatio: '1', background: '#F0EFED' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                <div className="p-3">
                    <div className="line-clamp-1" style={{ fontFamily: themeTokens.head, fontSize: 13, fontWeight: 500, color: 'var(--c-tx)' }}>{p.name}</div>
                    {showDesc && p.description && <div className="text-[10px] mt-0.5 mb-1.5 line-clamp-1" style={{ color: 'var(--c-tx2)', fontWeight: 300 }}>{p.description}</div>}
                    <div className="flex items-center justify-between mt-1.5">
                        {showPrice && <span style={{ fontFamily: themeTokens.head, fontSize: 14, fontWeight: 500, color: 'var(--c-tx)' }}>€{p.price}</span>}
                        {renderAddBtn('sm')}
                    </div>
                </div>
            </div>
        )
        // RUSTIC grid: warm card
        if (isRustic) return (
            <div key={p.id} className="overflow-hidden" style={cardCSS()}>
                {showImg && p.imageUrl && <div className="w-full relative" style={{ aspectRatio: '4/3', background: '#FEF3C7' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} />
                    {p.badge && <div className="absolute top-2 left-0 text-[8px] font-bold text-white px-2 py-0.5 uppercase" style={{ background: 'var(--c-pri)' }}>★ {p.badge}</div>}
                </div>}
                <div className="p-2.5">
                    <div style={{ fontFamily: themeTokens.head, fontSize: 12, fontWeight: 700, color: 'var(--c-tx)' }}>{p.name}</div>
                    {showDesc && p.description && <div className="text-[10px] mt-0.5 mb-1 line-clamp-2" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                    <div className="flex items-center justify-between mt-1">
                        {showPrice && <span style={{ fontFamily: themeTokens.head, fontSize: 14, fontWeight: 700, color: 'var(--c-pri)' }}>€{p.price}</span>}
                        <button className="text-[9px] font-semibold px-2 py-0.5" style={{ background: themeTokens.btnBg, color: themeTokens.btnText, borderRadius: themeTokens.btnR }}>Ordenar</button>
                    </div>
                </div>
            </div>
        )
        // Modern Minimal grid (default)
        return (
            <div key={p.id} className="overflow-hidden" style={cardCSS()}>
                {showImg && p.imageUrl && <div className="w-full" style={{ aspectRatio: '4/3', background: 'var(--c-brd)' }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" onError={imgError} /></div>}
                <div className="p-2.5">
                    <div className="text-xs font-bold mb-0.5 line-clamp-1" style={{ color: 'var(--c-tx)' }}>{p.name}</div>
                    {showDesc && p.description && <div className="text-[10px] mb-1.5 line-clamp-2" style={{ color: 'var(--c-tx2)' }}>{p.description}</div>}
                    <div className="flex items-center justify-between">
                        {showPrice && <span className="text-sm font-bold" style={{ color: 'var(--c-pri)' }}>€{p.price}</span>}
                        {renderAddBtn('md')}
                    </div>
                </div>
            </div>
        )
    }

    // Category style rendering
    function renderCategoryTabs() {
        if (!showCats || allCategories.length === 0) return null
        const style = theme.categoryStyle
        // TABS (Bistro) — underline tabs
        if (style === 'tabs') return (
            <div className="px-5 flex gap-0 overflow-x-auto" style={{ background: 'var(--c-bg)', borderBottom: '2px solid var(--c-brd)' }}>
                <div className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--c-pri)', borderBottom: '2px solid var(--c-pri)', marginBottom: -2, fontFamily: 'var(--f-body)' }}>Todos</div>
                {allCategories.map(c => <div key={c.id} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--c-tx2)', fontFamily: 'var(--f-body)' }}>{c.name}</div>)}
            </div>
        )
        // TAGS (Craft) — square tags
        if (style === 'tags') return (
            <div className="px-5 py-3 flex gap-2 overflow-x-auto" style={{ background: 'var(--c-surf)', borderBottom: '1px solid var(--c-brd)' }}>
                <div className="px-3 py-1.5 text-[12px] whitespace-nowrap" style={{ fontFamily: 'var(--f-head)', letterSpacing: '0.08em', background: 'var(--c-pri)', color: 'white', borderRadius: 2 }}>Todos</div>
                {allCategories.map(c => <div key={c.id} className="px-3 py-1.5 text-[12px] whitespace-nowrap" style={{ fontFamily: 'var(--f-head)', letterSpacing: '0.08em', border: '1.5px solid var(--c-brd)', color: 'var(--c-tx2)', borderRadius: 2 }}>{c.name}</div>)}
            </div>
        )
        // UNDERLINE (Nordic) — minimal underline nav
        if (style === 'underline') return (
            <div className="px-5 flex gap-5 overflow-x-auto" style={{ background: 'var(--c-surf)', borderBottom: '1px solid var(--c-brd)' }}>
                <div className="py-2.5 text-[10px] uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--c-tx)', borderBottom: '1.5px solid var(--c-tx)', marginBottom: -1, fontWeight: 400, fontFamily: 'var(--f-body)' }}>Todo</div>
                {allCategories.map(c => <div key={c.id} className="py-2.5 text-[10px] uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--c-tx2)', fontWeight: 400, fontFamily: 'var(--f-body)' }}>{c.name}</div>)}
            </div>
        )
        // ITALIC-TAGS (Rustic)
        if (style === 'italic-tags') return (
            <div className="px-5 py-3 flex gap-2 overflow-x-auto" style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--c-brd)' }}>
                <div className="px-3 py-1.5 text-[11px] font-bold whitespace-nowrap" style={{ fontFamily: 'var(--f-head)', background: 'var(--c-pri)', color: 'white', borderRadius: 3 }}>Todos</div>
                {allCategories.map(c => <div key={c.id} className="px-3 py-1.5 text-[11px] whitespace-nowrap" style={{ fontFamily: 'var(--f-head)', fontStyle: 'italic', border: '1.5px solid var(--c-brd)', color: 'var(--c-tx2)', borderRadius: 3 }}>{c.name}</div>)}
            </div>
        )
        // DEFAULT: pills (Modern Minimal)
        return (
            <div className="px-5 py-3 flex gap-2 overflow-x-auto" style={{ background: 'var(--c-surf)' }}>
                <button className="px-4 py-2 text-xs font-semibold whitespace-nowrap" style={{ background: 'var(--c-pri)', color: 'white', borderRadius: 999 }}>Todos</button>
                {allCategories.map(c => <button key={c.id} className="px-4 py-2 text-xs font-medium whitespace-nowrap" style={{ border: '1.5px solid var(--c-brd)', color: 'var(--c-tx2)', borderRadius: 999, background: 'transparent' }}>{c.name}</button>)}
            </div>
        )
    }

    // Section title based on theme
    function renderSectionTitle(name: string) {
        if (isDark) return <div className="flex items-center gap-2 mb-3 mt-4" style={{ fontFamily: 'var(--f-head)', fontSize: 17, letterSpacing: '0.1em', color: 'var(--c-pri)' }}>{name}<span className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--c-brd), transparent)' }} /></div>
        if (isBistro) return <div className="flex items-center gap-2 mb-3 mt-4"><span className="flex-1 h-px" style={{ background: 'var(--c-brd)' }} /><span style={{ fontFamily: 'var(--f-head)', fontSize: 12, fontWeight: 600, color: 'var(--c-tx2)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{name}</span><span className="flex-1 h-px" style={{ background: 'var(--c-brd)' }} /></div>
        if (isNordic) return <div className="pt-5 pb-2 px-0" style={{ borderBottom: '1px solid var(--c-brd)' }}><div className="text-[9px] font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--c-tx2)', fontFamily: 'var(--f-body)' }}>{name}</div></div>
        if (isRustic) return <div className="text-center mb-3 mt-4"><div style={{ fontFamily: 'var(--f-head)', fontSize: 14, fontWeight: 700, color: 'var(--c-tx)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{name}</div><div className="h-0.5 mt-1" style={{ background: `linear-gradient(90deg, transparent, var(--c-pri), transparent)` }} /></div>
        return <div className="text-[10px] font-bold uppercase tracking-wider mb-3 mt-4" style={{ color: 'var(--c-tx2)' }}>{name}</div>
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative w-[375px] h-[812px] bg-slate-900 rounded-[50px] shadow-2xl overflow-hidden" style={{ boxShadow: '0 0 0 12px #1e293b, 0 30px 60px rgba(0,0,0,0.3)' }}>
                <style>{`
                    .preview-scroll::-webkit-scrollbar { width: 0px; height: 0px; }
                    .preview-scroll { scrollbar-width: none; -ms-overflow-style: none; }
                `}</style>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[130px] h-[30px] bg-black rounded-b-[22px] z-50" />
                <div className="w-full h-full overflow-y-auto preview-scroll" style={{ ...cssVars, background: 'var(--c-bg)', fontFamily: 'var(--f-body)' }}>
                    {/* Status Bar */}
                    <div className="sticky top-0 z-40 px-7 pt-14 pb-2 flex items-center justify-between text-xs font-semibold" style={{ background: isBistro ? 'var(--c-pri)' : 'var(--c-surf)', color: isBistro ? 'rgba(255,255,255,0.85)' : 'var(--c-tx)' }}>
                        <span>9:41</span><span className="text-[10px]">●●● WiFi 🔋</span>
                    </div>

                    {/* HEADER — theme-specific, controlled by show_header toggle */}
                    {showHeader && (isBistro ? (
                        <div className="px-5 py-4 relative" style={{ background: 'var(--c-pri)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-col gap-1"><span className="w-5 h-0.5 rounded" style={{ background: 'rgba(255,255,255,0.6)' }} /><span className="w-5 h-0.5 rounded" style={{ background: 'rgba(255,255,255,0.6)' }} /><span className="w-5 h-0.5 rounded" style={{ background: 'rgba(255,255,255,0.6)' }} /></div>
                                <div className="text-center">
                                    {showLogo && logoUrl ? (
                                        <img src={logoUrl} alt="" className="h-5 mx-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                    ) : (
                                        <div style={{ fontFamily: 'var(--f-head)', fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>MYDIGITABLE</div>
                                    )}
                                    <div className="flex gap-1 justify-center mt-0.5">{['◆', '◆', '◆'].map((d, i) => <span key={i} className="text-[6px]" style={{ color: 'var(--c-acc)' }}>{d}</span>)}</div>
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center relative" style={{ border: '1.5px solid rgba(201,168,76,0.4)', borderRadius: 7 }}><ShoppingBag className="w-4 h-4 text-white" /><div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: 'var(--c-acc)', color: 'var(--c-pri)' }}>2</div></div>
                            </div>
                            <div className="text-center"><div style={{ fontFamily: 'var(--f-head)', fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>{restName}</div>{headerSub && <div className="text-[10px] mt-1 uppercase tracking-widest" style={{ color: 'var(--c-acc)' }}>{headerSub}</div>}</div>
                            <div className="h-px mt-3" style={{ background: `linear-gradient(90deg, transparent, var(--c-acc), transparent)` }} />
                        </div>
                    ) : isDark ? (
                        <div className="px-5 py-3" style={{ background: 'var(--c-surf)', borderBottom: '1px solid var(--c-brd)', position: 'relative' }}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col gap-1"><span className="w-5 h-0.5" style={{ background: 'var(--c-tx2)' }} /><span className="w-5 h-0.5" style={{ background: 'var(--c-tx2)' }} /><span className="w-5 h-0.5" style={{ background: 'var(--c-tx2)' }} /></div>
                                {showLogo && logoUrl ? (
                                    <img src={logoUrl} alt="" className="h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                ) : (
                                    <span style={{ fontFamily: 'var(--f-head)', fontSize: 20, letterSpacing: '0.1em', color: 'var(--c-tx)' }}>MYDIGITABLE</span>
                                )}
                                <div className="w-9 h-9 flex items-center justify-center relative" style={{ border: '1.5px solid var(--c-pri)', borderRadius: 4 }}><ShoppingBag className="w-4 h-4" style={{ color: 'var(--c-pri)' }} /><div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: 'var(--c-pri)' }}>3</div></div>
                            </div>
                            <div style={{ fontFamily: 'var(--f-head)', fontSize: 28, letterSpacing: '0.05em', color: 'var(--c-tx)', lineHeight: 1 }}>{restName}</div>
                            {headerSub && <div className="text-[10px] mt-1 uppercase tracking-widest" style={{ color: 'var(--c-pri)' }}>{headerSub}</div>}
                            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, var(--c-pri), transparent)` }} />
                        </div>
                    ) : isNordic ? (
                        <div className="px-5 py-3" style={{ background: 'var(--c-surf)', borderBottom: '1px solid var(--c-brd)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-col gap-1.5"><span className="w-5 h-px" style={{ background: 'var(--c-tx)' }} /><span className="w-5 h-px" style={{ background: 'var(--c-tx)' }} /><span className="w-5 h-px" style={{ background: 'var(--c-tx)' }} /></div>
                                <div className="flex gap-3 items-center"><Search className="w-4 h-4" style={{ color: 'var(--c-tx)' }} /><div className="relative"><ShoppingBag className="w-4 h-4" style={{ color: 'var(--c-tx)' }} /><div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: 'var(--c-tx)', border: '1.5px solid white' }} /></div></div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-2 mb-1"><span className="flex-1 h-px" style={{ background: 'var(--c-brd)' }} />
                                    {showLogo && logoUrl ? (
                                        <img src={logoUrl} alt="" className="h-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                    ) : (
                                        <span className="text-[9px] tracking-[0.22em] uppercase" style={{ color: 'var(--c-tx2)', fontFamily: 'var(--f-body)', fontWeight: 300 }}>MYDIGITABLE</span>
                                    )}
                                    <span className="flex-1 h-px" style={{ background: 'var(--c-brd)' }} /></div>
                                <div style={{ fontFamily: 'var(--f-head)', fontSize: 30, fontWeight: 300, color: 'var(--c-tx)', letterSpacing: '-0.02em', lineHeight: 1 }}>{restName}</div>
                                {headerSub && <div className="text-[10px] mt-1" style={{ color: 'var(--c-tx2)', fontWeight: 300, letterSpacing: '0.06em' }}>{headerSub}</div>}
                            </div>
                        </div>
                    ) : isRustic ? (
                        <div className="px-5 py-3" style={{ background: 'var(--c-bg)', borderBottom: '2px solid var(--c-brd)' }}>
                            <div className="text-center text-[11px] tracking-widest mb-2" style={{ color: 'var(--c-brd)' }}>· · · ✦ · · ·</div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col gap-1"><span className="w-5 h-0.5" style={{ background: 'var(--c-tx2)' }} /><span className="w-5 h-0.5" style={{ background: 'var(--c-tx2)' }} /><span className="w-5 h-0.5" style={{ background: 'var(--c-tx2)' }} /></div>
                                <div className="text-center">
                                    {showLogo && logoUrl ? (
                                        <img src={logoUrl} alt="" className="h-5 mx-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                    ) : (
                                        <><div className="text-[7px] font-semibold tracking-[0.22em] uppercase" style={{ color: 'var(--c-tx2)' }}>Menú digital por</div><div className="text-[8px] tracking-[0.18em] uppercase" style={{ fontFamily: 'var(--f-head)', color: 'var(--c-tx2)' }}>MYDIGITABLE</div></>
                                    )}
                                </div>
                                <div className="relative"><ShoppingBag className="w-5 h-5" style={{ color: 'var(--c-pri)' }} /><div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: 'var(--c-pri)' }}>2</div></div>
                            </div>
                            <div className="text-center"><div style={{ fontFamily: 'var(--f-head)', fontSize: 28, fontWeight: 700, color: 'var(--c-tx)', lineHeight: 1.1 }}>{restName}</div>{headerSub && <div className="text-[11px] mt-1" style={{ fontFamily: 'var(--f-head)', fontStyle: 'italic', color: 'var(--c-tx2)' }}>{headerSub}</div>}</div>
                            <div className="flex items-center gap-2 mt-2"><span className="flex-1 h-px" style={{ background: 'var(--c-brd)' }} /><span className="text-[12px]" style={{ color: 'var(--c-pri)' }}>🌿</span><span className="flex-1 h-px" style={{ background: 'var(--c-brd)' }} /></div>
                        </div>
                    ) : (
                        /* Modern Minimal — simple header */
                        <>
                            <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'var(--c-surf)', borderBottom: '1px solid var(--c-brd)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1"><span className="w-5 h-0.5 rounded" style={{ background: 'var(--c-tx)' }} /><span className="w-5 h-0.5 rounded" style={{ background: 'var(--c-tx)' }} /><span className="w-5 h-0.5 rounded" style={{ background: 'var(--c-tx)' }} /></div>
                                    {showLogo && logoUrl ? (
                                        <img src={logoUrl} alt="" className="h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                    ) : (
                                        <span className="text-base font-bold truncate max-w-[200px]" style={{ color: 'var(--c-tx)' }}>{restName}</span>
                                    )}
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center relative text-white" style={{ background: 'var(--c-pri)', borderRadius: `${Math.min(br, 12)}px` }}><ShoppingBag className="w-5 h-5" /><div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">2</div></div>
                            </div>
                            {showSearch && <div className="px-5 pt-3 pb-2" style={{ background: 'var(--c-surf)' }}><div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-brd)', borderRadius: `${Math.max(br, 20)}px` }}><Search className="w-4 h-4" style={{ color: 'var(--c-tx2)' }} /><span className="text-sm" style={{ color: 'var(--c-tx2)' }}>¿Qué te apetece hoy?</span></div></div>}
                        </>
                    ))}
                    {/* Category tabs */}
                    {renderCategoryTabs()}

                    {/* Content */}
                    <div className="px-5 pb-28 pt-1" style={{ background: 'var(--c-bg)' }}>
                        {/* Featured */}
                        {featuredProducts.length > 0 && featuredProducts.map(p => (
                            <div key={p.id} className="overflow-hidden mb-3 mt-3" style={{
                                background: isDark || isBistro ? 'var(--c-pri)' : 'var(--c-surf)',
                                border: isDark || isBistro ? 'none' : `1px solid var(--c-brd)`,
                                borderRadius: isDark ? 4 : isBistro ? 3 : cardR
                            }}>
                                {showImg && p.imageUrl && <div className="relative w-full" style={{ height: 130, background: isDark ? '#2A2520' : isBistro ? '#2A4D7A' : undefined }}><img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                    {p.badge && <div className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold text-white flex items-center gap-1" style={{ background: isDark || isBistro ? 'var(--c-acc)' : 'var(--c-pri)', borderRadius: isDark ? 0 : 4, fontFamily: 'var(--f-head)', letterSpacing: isDark ? '0.1em' : undefined }}><Flame className="w-3 h-3" />{p.badge}</div>}
                                </div>}
                                <div className="p-3">
                                    {isBistro && <div className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--c-acc)' }}>⭐ Plato de la Casa</div>}
                                    <div style={{ fontFamily: 'var(--f-head)', fontSize: isDark ? 22 : 15, fontWeight: isDark ? 400 : 700, color: isDark || isBistro ? 'white' : 'var(--c-tx)', letterSpacing: isDark ? '0.05em' : undefined }}>{p.name}</div>
                                    {showDesc && p.description && <div className="text-[10px] mt-1 mb-2 line-clamp-2" style={{ color: isDark || isBistro ? 'rgba(255,255,255,0.6)' : 'var(--c-tx2)' }}>{p.description}</div>}
                                    <div className="flex items-center justify-between">
                                        {showPrice && <span style={{ fontFamily: 'var(--f-head)', fontSize: isDark ? 24 : 17, color: isDark || isBistro ? 'var(--c-acc)' : 'var(--c-pri)', fontWeight: isDark ? 400 : 600, letterSpacing: isDark ? '0.05em' : undefined }}>€{p.price}</span>}
                                        <button className="px-4 py-1.5 text-[10px] font-bold uppercase" style={{ background: isDark ? 'var(--c-acc)' : isBistro ? 'var(--c-acc)' : 'var(--c-pri)', color: isDark ? 'white' : isBistro ? 'var(--c-pri)' : 'white', borderRadius: isDark || isBistro ? 2 : addBtnR, fontFamily: isDark ? 'var(--f-head)' : undefined, letterSpacing: '0.08em' }}>{isBistro ? 'Pedir' : isDark ? 'Order' : 'Añadir'}</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Categories with products */}
                        {allCategories.map(cat => {
                            const prods = cat.products.filter(p => !p.isFeatured && p.isAvailable)
                            if (prods.length === 0) return null
                            // Per-category overrides (fallback to global)
                            const catLayout = cat.layout_type || layout
                            const catCols = cat.grid_columns || cols
                            const catOverrides = {
                                showImg: cat.show_images !== undefined ? cat.show_images : showImg,
                                showPrice: cat.show_prices !== undefined ? cat.show_prices : showPrice,
                                showDesc: cat.show_descriptions !== undefined ? cat.show_descriptions : showDesc,
                            }
                            const catIsGrid = catLayout === 'grid' || catLayout === 'photo-grid'
                            return (
                                <div key={cat.id} className="mb-4">
                                    {renderSectionTitle(cat.name)}
                                    {catLayout === 'horizontal' ? (
                                        <div className="flex overflow-x-auto pb-2 preview-scroll" style={{ gap: spacing, scrollSnapType: 'x mandatory' }}>
                                            {prods.slice(0, 12).map((p, i) => <div key={p.id} style={{ scrollSnapAlign: 'start' }}>{renderProduct(p, i, catOverrides)}</div>)}
                                        </div>
                                    ) : isNordic && catIsGrid ? (
                                        <div className="grid" style={{ gridTemplateColumns: `repeat(${catCols}, 1fr)`, gap: spacing, background: 'var(--c-brd)' }}>{prods.slice(0, 12).map((p, i) => renderProduct(p, i, catOverrides))}</div>
                                    ) : catIsGrid ? (
                                        <div className="grid" style={{ gridTemplateColumns: `repeat(${catCols}, 1fr)`, gap: spacing }}>{prods.slice(0, 12).map((p, i) => renderProduct(p, i, catOverrides))}</div>
                                    ) : (
                                        <div className="flex flex-col" style={{ gap: spacing }}>{prods.slice(0, 12).map((p, i) => renderProduct(p, i, catOverrides))}</div>
                                    )}
                                </div>
                            )
                        })}

                        {allCategories.length === 0 && <div className="text-center py-16"><div className="text-5xl mb-4">🍽️</div><h3 className="font-bold text-sm mb-1" style={{ color: 'var(--c-tx)' }}>Menú vacío</h3><p className="text-xs" style={{ color: 'var(--c-tx2)' }}>Añade categorías y productos</p></div>}
                    </div>

                    {/* FAB */}
                    <div className="sticky bottom-0 w-full px-5 pb-6 pt-2" style={{ background: 'transparent' }}>
                        <div className="flex items-center justify-between px-5 py-3.5" style={{
                            background: isDark ? `linear-gradient(135deg, var(--c-pri), var(--c-acc))` : 'var(--c-pri)',
                            borderRadius: isDark ? 4 : isBistro ? 3 : isNordic ? 0 : isRustic ? 5 : 999,
                            boxShadow: `0 8px 24px ${isDark ? 'rgba(194,120,58,0.4)' : isBistro ? 'rgba(30,58,95,0.35)' : 'rgba(0,0,0,0.25)'}`,
                        }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 flex items-center justify-center text-xs font-bold" style={{
                                    background: isBistro ? 'var(--c-acc)' : isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)',
                                    color: isBistro ? 'var(--c-pri)' : 'white',
                                    borderRadius: isDark ? 2 : isNordic ? 0 : '50%',
                                    fontFamily: isDark ? 'var(--f-head)' : undefined,
                                }}>2</div>
                                <span className="text-white font-semibold text-xs" style={{ fontFamily: isDark ? 'var(--f-head)' : undefined, letterSpacing: isDark || isBistro ? '0.06em' : undefined, textTransform: isDark || isBistro ? 'uppercase' : undefined } as React.CSSProperties}>Ver pedido</span>
                            </div>
                            <span className="font-bold text-sm text-white" style={{ fontFamily: isBistro || isDark || isRustic ? 'var(--f-head)' : undefined }}>€33.40</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
