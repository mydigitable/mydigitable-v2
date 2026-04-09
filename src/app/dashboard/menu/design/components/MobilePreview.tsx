'use client'

import { useState, useMemo } from 'react'
import { Search, ShoppingBag, Star, Flame, LayoutGrid, List } from 'lucide-react'
import type { RestaurantDesignConfig, MenuTheme } from '@/types/design'

// ============================================
// Helpers
// ============================================
function extractName(name: unknown): string {
    if (!name) return ''
    if (typeof name === 'string') return name
    if (typeof name === 'object' && name !== null) {
        const n = name as Record<string, string>
        return n.es || n.en || Object.values(n)[0] || ''
    }
    return ''
}

function extractDesc(desc: unknown): string {
    if (!desc) return ''
    if (typeof desc === 'string') return desc
    if (typeof desc === 'object' && desc !== null) {
        const obj = desc as Record<string, string>
        return obj.es || obj.en || Object.values(obj)[0] || ''
    }
    return ''
}

// ============================================
// Props
// ============================================
interface MobilePreviewProps {
    restaurant: { name?: string; business_name?: string; tagline?: string }
    menus: Array<{
        id?: string
        name?: unknown
        categories?: Array<{
            id?: string
            name?: unknown
            layout_type?: string
            grid_columns?: number
            show_images?: boolean
            show_prices?: boolean
            show_descriptions?: boolean
            products?: Array<{
                id?: string
                name?: unknown
                description?: unknown
                price?: number
                image_url?: string
                is_featured?: boolean
                featured_badge?: string
            }>
        }>
    }>
    config: RestaurantDesignConfig
    selectedCategory: string | null
    onSelectProduct: (id: string | null) => void
}

// ============================================
// Main Component
// ============================================
export function MobilePreview({
    restaurant,
    menus,
    config,
    selectedCategory,
    onSelectProduct
}: MobilePreviewProps) {
    const [activeMenuTab, setActiveMenuTab] = useState(menus[0]?.id || '')
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null)

    // CSS Variables dinámicas
    const cssVars = useMemo(() => {
        const colors = (config.custom_colors || {}) as Record<string, string>
        const themeColors = (config.selected_theme?.colors || {}) as Record<string, string>

        return {
            '--color-primary': colors.primary || themeColors.primary || '#16A34A',
            '--color-background': colors.background || themeColors.background || '#FFFFFF',
            '--color-surface': colors.surface || themeColors.surface || '#F8FAFC',
            '--color-border': colors.border || themeColors.border || '#E2E8F0',
            '--color-text': colors.text || themeColors.text || '#0F172A',
            '--color-text-secondary': colors.text_secondary || themeColors.text_secondary || '#64748B',
            '--color-accent': colors.accent || themeColors.accent || '#F59E0B',
        } as React.CSSProperties
    }, [config.custom_colors, config.selected_theme?.colors])

    // Font from theme
    const headingFont = config.selected_theme?.fonts?.heading || 'inherit'
    const bodyFont = config.selected_theme?.fonts?.body || 'inherit'

    // Google Fonts link
    const fontUrl = useMemo(() => {
        const theme = config.selected_theme
        if (!theme) return ''
        const fonts = [theme.fonts.heading, theme.fonts.body].filter((v, i, a) => a.indexOf(v) === i)
        const families = fonts.map(f => f.replace(/\s+/g, '+')).join('&family=')
        return `https://fonts.googleapis.com/css2?family=${families}:wght@300;400;500;600;700&display=swap`
    }, [config.selected_theme])

    // Obtener categorías filtradas
    const displayedCategories = useMemo(() => {
        const activeMenu = menus.find(m => m.id === activeMenuTab) || menus[0]
        if (!activeMenu) return []

        let categories = activeMenu.categories || []

        if (selectedCategory) {
            categories = categories.filter(c => c.id === selectedCategory)
        }

        if (activeCategoryFilter) {
            categories = categories.filter(c => c.id === activeCategoryFilter)
        }

        return categories
    }, [menus, activeMenuTab, selectedCategory, activeCategoryFilter])

    // Featured products
    const featuredProducts = useMemo(() => {
        return displayedCategories
            .flatMap(cat => cat.products || [])
            .filter(p => p.is_featured)
            .slice(0, 3)
    }, [displayedCategories])

    const restName = restaurant.business_name || extractName(restaurant.name) || 'Mi Restaurante'

    return (
        <div className="relative">
            {/* Controls arriba del teléfono */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20">
                <div className="bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Vista previa en vivo
                </div>
            </div>

            {fontUrl && (
                // eslint-disable-next-line @next/next/no-page-custom-font
                <link rel="stylesheet" href={fontUrl} />
            )}

            {/* iPhone Frame */}
            <div
                className="relative w-[430px] h-[880px] bg-slate-900 rounded-[60px] shadow-2xl overflow-hidden"
                style={{
                    boxShadow: '0 0 0 12px #1e293b, 0 30px 60px rgba(0,0,0,0.3)'
                }}
            >
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[35px] bg-black rounded-b-[25px] z-50 flex items-center justify-center">
                    <div className="w-[80px] h-[20px] bg-slate-900 rounded-full flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                        <div className="w-8 h-1.5 bg-slate-700 rounded-full" />
                    </div>
                </div>

                {/* Screen Content */}
                <div
                    className="w-full h-full overflow-y-auto"
                    style={{ ...cssVars, backgroundColor: 'var(--color-background)', fontFamily: `'${bodyFont}', sans-serif` }}
                >
                    {/* Status Bar */}
                    <div
                        className="sticky top-0 z-40 px-8 pt-14 pb-2 flex items-center justify-between text-xs font-semibold backdrop-blur-xl"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text)'
                        }}
                    >
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5 text-[11px]">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            <span>📶</span>
                            <span>🔋</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div
                        className="px-6 py-5 border-b"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--color-text)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <button
                                className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                <ShoppingBag className="w-6 h-6 text-white" />
                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                                    2
                                </div>
                            </button>
                        </div>

                        <div className="text-center">
                            <h1
                                className="text-3xl font-bold mb-1.5"
                                style={{
                                    color: 'var(--color-text)',
                                    fontFamily: `'${headingFont}', serif`
                                }}
                            >
                                {restName}
                            </h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {restaurant.tagline || 'Menú Digital'}
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    {config.show_search && (
                        <div className="px-6 py-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                            <div
                                className="relative rounded-2xl border-2 overflow-hidden transition-all"
                                style={{ borderColor: 'var(--color-border)' }}
                            >
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                                <div
                                    className="w-full pl-12 pr-4 py-3.5 text-sm"
                                    style={{
                                        backgroundColor: 'var(--color-background)',
                                        color: 'var(--color-text-secondary)'
                                    }}
                                >
                                    ¿Qué te apetece hoy?
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Tabs (if multiple menus) */}
                    {menus.length > 1 && (
                        <div className="px-6 pb-2 flex gap-2 overflow-x-auto">
                            {menus.map(menu => (
                                <button
                                    key={menu.id}
                                    onClick={() => { setActiveMenuTab(menu.id || ''); setActiveCategoryFilter(null) }}
                                    className="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border"
                                    style={{
                                        backgroundColor: activeMenuTab === menu.id ? 'var(--color-primary)' : 'transparent',
                                        borderColor: activeMenuTab === menu.id ? 'var(--color-primary)' : 'var(--color-border)',
                                        color: activeMenuTab === menu.id ? 'white' : 'var(--color-text-secondary)'
                                    }}
                                >
                                    {extractName(menu.name) || 'Menú'}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Category Pills */}
                    {config.show_categories && (
                        <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
                            <button
                                onClick={() => setActiveCategoryFilter(null)}
                                className="px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border-2"
                                style={{
                                    backgroundColor: !activeCategoryFilter ? 'var(--color-primary)' : 'transparent',
                                    borderColor: !activeCategoryFilter ? 'var(--color-primary)' : 'var(--color-border)',
                                    color: !activeCategoryFilter ? 'white' : 'var(--color-text)'
                                }}
                            >
                                Todos
                            </button>

                            {(menus.find(m => m.id === activeMenuTab) || menus[0])?.categories?.slice(0, 5).map(cat => {
                                const catName = extractName(cat.name) || 'Categoría'
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat.id ? null : (cat.id || null))}
                                        className="px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border-2"
                                        style={{
                                            backgroundColor: activeCategoryFilter === cat.id ? 'var(--color-primary)' : 'transparent',
                                            borderColor: activeCategoryFilter === cat.id ? 'var(--color-primary)' : 'var(--color-border)',
                                            color: activeCategoryFilter === cat.id ? 'white' : 'var(--color-text)'
                                        }}
                                    >
                                        {catName}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="px-6 pb-32 pt-2" style={{ backgroundColor: 'var(--color-background)' }}>
                        {/* Featured Section */}
                        {featuredProducts.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="currentColor" />
                                    <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Destacados
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {featuredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => onSelectProduct(product.id || null)}
                                            className="w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border text-left"
                                            style={{
                                                backgroundColor: 'var(--color-surface)',
                                                borderColor: 'var(--color-border)'
                                            }}
                                        >
                                            {config.show_images && product.image_url && (
                                                <div className="relative h-48 w-full">
                                                    <img
                                                        src={product.image_url}
                                                        alt={extractName(product.name)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {product.featured_badge && (
                                                        <div
                                                            className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                                                            style={{ backgroundColor: 'var(--color-accent)' }}
                                                        >
                                                            <Flame className="w-3.5 h-3.5" />
                                                            {product.featured_badge}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="p-4">
                                                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)', fontFamily: `'${headingFont}', serif` }}>
                                                    {extractName(product.name) || 'Producto'}
                                                </h3>

                                                {config.show_descriptions && (
                                                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                                                        {extractDesc(product.description) || ''}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    {config.show_prices && (
                                                        <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                                            €{(product.price || 0).toFixed(2)}
                                                        </span>
                                                    )}

                                                    <span
                                                        className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg inline-block"
                                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                                    >
                                                        Añadir
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories with Products */}
                        {displayedCategories.map(category => (
                            <CategorySection
                                key={category.id}
                                category={category}
                                config={config}
                                headingFont={headingFont}
                                onSelectProduct={onSelectProduct}
                            />
                        ))}

                        {/* Empty State */}
                        {displayedCategories.length === 0 && (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-4">🍽️</div>
                                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>No hay productos aún</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Añade categorías y productos en el gestor de menú</p>
                            </div>
                        )}
                    </div>

                    {/* Floating Cart */}
                    <div
                        className="sticky bottom-4 mx-6 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            >
                                2
                            </div>
                            <span className="text-white font-semibold">Ver pedido</span>
                        </div>
                        <span className="text-white text-xl font-bold">€33.40</span>
                    </div>

                    {/* Powered By */}
                    {config.show_powered_by && (
                        <div className="text-center py-2 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                            Menú digital por <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>MyDigitable</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Category Section
// ============================================
function CategorySection({ category, config, headingFont, onSelectProduct }: {
    category: NonNullable<MobilePreviewProps['menus'][0]['categories']>[0]
    config: RestaurantDesignConfig
    headingFont: string
    onSelectProduct: (id: string | null) => void
}) {
    const layout = category.layout_type || config.layout_type || 'grid'
    const gridCols = category.grid_columns || config.grid_columns || 2
    const products = category.products || []
    const catShowImages = category.show_images !== undefined ? category.show_images : config.show_images
    const catShowPrices = category.show_prices !== undefined ? category.show_prices : config.show_prices
    const catShowDescs = category.show_descriptions !== undefined ? category.show_descriptions : config.show_descriptions
    const catName = extractName(category.name) || 'Categoría'

    if (products.length === 0) return null

    const catConfig = { ...config, show_images: catShowImages, show_prices: catShowPrices, show_descriptions: catShowDescs }

    return (
        <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {catName}
            </h2>

            {(layout === 'grid' || layout === 'tabs' || layout === 'masonry' || layout === 'photo-grid') ? (
                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
                >
                    {products.map(product => (
                        <ProductCardGrid
                            key={product.id}
                            product={product}
                            config={catConfig}
                            headingFont={headingFont}
                            onClick={() => onSelectProduct(product.id || null)}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map(product => (
                        <ProductCardList
                            key={product.id}
                            product={product}
                            config={catConfig}
                            headingFont={headingFont}
                            onClick={() => onSelectProduct(product.id || null)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ============================================
// Product Card - Grid
// ============================================
function ProductCardGrid({ product, config, headingFont, onClick }: {
    product: NonNullable<NonNullable<MobilePreviewProps['menus'][0]['categories']>[0]['products']>[0]
    config: RestaurantDesignConfig
    headingFont: string
    onClick: () => void
}) {
    const pName = extractName(product.name) || 'Producto'
    const pDesc = extractDesc(product.description) || ''

    return (
        <button
            onClick={onClick}
            className="text-left rounded-2xl overflow-hidden border hover:shadow-lg transition-all"
            style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
            }}
        >
            {config.show_images && (
                <div className="relative w-full aspect-square flex items-center justify-center text-4xl" style={{ backgroundColor: 'var(--color-border)' }}>
                    {product.image_url
                        ? <img src={product.image_url} alt={pName} className="w-full h-full object-cover" />
                        : '🍽️'}
                    {product.is_featured && product.featured_badge && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
                            {product.featured_badge}
                        </div>
                    )}
                </div>
            )}

            <div className="p-3">
                <h3 className="text-sm font-bold mb-1 line-clamp-1" style={{ color: 'var(--color-text)', fontFamily: `'${headingFont}', serif` }}>
                    {pName}
                </h3>

                {config.show_descriptions && pDesc && (
                    <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {pDesc}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    {config.show_prices && (
                        <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
                            €{(product.price || 0).toFixed(2)}
                        </span>
                    )}

                    <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </span>
                </div>
            </div>
        </button>
    )
}

// ============================================
// Product Card - List
// ============================================
function ProductCardList({ product, config, headingFont, onClick }: {
    product: NonNullable<NonNullable<MobilePreviewProps['menus'][0]['categories']>[0]['products']>[0]
    config: RestaurantDesignConfig
    headingFont: string
    onClick: () => void
}) {
    const pName = extractName(product.name) || 'Producto'
    const pDesc = extractDesc(product.description) || ''

    return (
        <button
            onClick={onClick}
            className="w-full flex gap-4 p-4 rounded-2xl border hover:shadow-lg transition-all text-left"
            style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
            }}
        >
            {config.show_images && (
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl" style={{ backgroundColor: 'var(--color-border)' }}>
                    {product.image_url
                        ? <img src={product.image_url} alt={pName} className="w-full h-full object-cover" />
                        : '🍽️'}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-text)', fontFamily: `'${headingFont}', serif` }}>
                    {pName}
                </h3>

                {config.show_descriptions && pDesc && (
                    <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {pDesc}
                    </p>
                )}

                {config.show_prices && (
                    <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                        €{(product.price || 0).toFixed(2)}
                    </span>
                )}
            </div>

            <span
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 self-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </span>
        </button>
    )
}
