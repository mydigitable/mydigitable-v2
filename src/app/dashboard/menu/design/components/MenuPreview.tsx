'use client'

import { useMemo } from 'react'
import type { RestaurantDesignConfig, MenuTheme } from '@/types/design'

// Helper to extract name from JSONB
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

// Google Fonts URL for the preview
function getFontUrl(theme: MenuTheme | undefined) {
    if (!theme) return ''
    const fonts = [theme.fonts.heading, theme.fonts.body].filter((v, i, a) => a.indexOf(v) === i)
    const families = fonts.map(f => f.replace(/\s+/g, '+')).join('&family=')
    return `https://fonts.googleapis.com/css2?family=${families}:wght@300;400;500;600;700&display=swap`
}

interface PreviewProduct {
    id: string; name: string; description: string; price: number; image_url?: string
}

const PLACEHOLDER_PRODUCTS: PreviewProduct[] = [
    { id: '1', name: 'Avocado Toast', description: 'Pan sourdough, aguacate, huevo', price: 14.50 },
    { id: '2', name: 'Salmon Bowl', description: 'Salmón, quinoa, verduras', price: 18.90 },
    { id: '3', name: 'Ensalada César', description: 'Lechuga romana, pollo, parmesano', price: 12.00 },
    { id: '4', name: 'Risotto de Setas', description: 'Arroz carnaroli, setas porcini', price: 14.90 },
    { id: '5', name: 'Pasta Trufa', description: 'Pasta fresca, crema de trufa', price: 15.50 },
    { id: '6', name: 'Pollo Asado', description: 'Con patatas y ensalada', price: 16.90 },
]

export function MenuPreview({
    restaurant,
    menus,
    config
}: {
    restaurant: { name?: string; business_name?: string }
    menus: Array<{
        categories?: Array<{
            name?: unknown
            products?: Array<{ id?: string; name?: unknown; description?: unknown; price?: number; image_url?: string }>
        }>
    }>
    config: RestaurantDesignConfig
}) {
    const theme = config.selected_theme

    // Colors
    const c = useMemo(() => {
        const custom = (config.custom_colors || {}) as Record<string, string>
        const tc = (theme?.colors || {}) as Record<string, string>
        return {
            primary: custom.primary || tc.primary || '#16A34A',
            accent: custom.accent || tc.accent || custom.primary || tc.primary || '#10B981',
            bg: custom.background || tc.background || '#FFFFFF',
            surface: custom.surface || tc.surface || '#FFFFFF',
            border: custom.border || tc.border || '#E2E8F0',
            text: custom.text || tc.text || '#0F172A',
            text2: custom.text_secondary || tc.text_secondary || '#64748B',
        }
    }, [config.custom_colors, theme?.colors])

    const fontHeading = theme?.fonts?.heading || 'DM Sans'
    const fontBody = theme?.fonts?.body || 'DM Sans'
    const headerStyle = theme?.header_style || 'simple'
    const categoryStyle = theme?.category_style || 'pills'
    const cardShape = theme?.card_shape || 'rounded'
    const featuredStyle = theme?.featured_style || 'none'

    // Border radius based on card shape
    const radius = cardShape === 'sharp' ? '2px'
        : cardShape === 'square' ? '4px'
            : cardShape === 'borderless' ? '0px'
                : cardShape === 'soft' ? '5px'
                    : `${config.border_radius}px`

    const spacing = config.spacing === 'compact' ? '8px' : config.spacing === 'relaxed' ? '24px' : '16px'

    // Products
    const { products, catNames } = useMemo(() => {
        const prods: PreviewProduct[] = []
        const cats: string[] = []
        for (const menu of menus) {
            for (const cat of (menu.categories || [])) {
                const cn = extractName(cat.name) || ''
                if (cn && !cats.includes(cn)) cats.push(cn)
                for (const p of (cat.products || [])) {
                    prods.push({
                        id: p.id || String(Math.random()),
                        name: extractName(p.name) || 'Producto',
                        description: extractDesc(p.description) || '',
                        price: p.price || 0,
                        image_url: p.image_url || undefined,
                    })
                }
            }
        }
        return { products: prods.length > 0 ? prods.slice(0, 6) : PLACEHOLDER_PRODUCTS, catNames: cats.length > 0 ? cats.slice(0, 5) : ['Brunch', 'Mains', 'Postres'] }
    }, [menus])

    const restName = restaurant.business_name || extractName(restaurant.name) || 'Mi Restaurante'

    return (
        <>
            {/* Load Google Fonts */}
            {theme && (
                // eslint-disable-next-line @next/next/no-page-custom-font
                <link rel="stylesheet" href={getFontUrl(theme)} />
            )}

            <div className="w-[390px] h-[844px] bg-white rounded-[44px] overflow-hidden shadow-2xl border-[14px] border-slate-900 relative">
                {/* iPhone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[30px] bg-slate-900 rounded-b-3xl z-50" />

                <div className="w-full h-full overflow-hidden flex flex-col" style={{ backgroundColor: c.bg, fontFamily: `'${fontBody}', sans-serif` }}>
                    {/* Status Bar */}
                    <div className="px-7 pt-14 pb-2 flex items-center justify-between text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: headerStyle === 'hero' || headerStyle === 'industrial' ? c.primary : c.surface, color: headerStyle === 'hero' || headerStyle === 'industrial' ? 'rgba(255,255,255,0.85)' : c.text }}>
                        <span>9:41</span>
                        <span>●●● WiFi 🔋</span>
                    </div>

                    {/* ====== HEADER ====== */}
                    {headerStyle === 'simple' && (
                        <div className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0" style={{ backgroundColor: c.surface, borderColor: c.border }}>
                            <div className="flex items-center gap-3">
                                <HamburgerIcon color={c.text} />
                                {config.show_logo && <span className="text-base font-bold" style={{ color: c.text, fontFamily: `'${fontHeading}', sans-serif` }}>{restName}</span>}
                            </div>
                            <CartButton bg={c.primary} />
                        </div>
                    )}

                    {headerStyle === 'hero' && (
                        <div className="px-6 py-4 flex-shrink-0" style={{ backgroundColor: c.primary }}>
                            <div className="flex items-center justify-between mb-3">
                                <HamburgerIcon color="rgba(255,255,255,0.6)" />
                                {config.show_logo && <span className="text-xs font-bold tracking-widest" style={{ fontFamily: `'${fontHeading}', serif`, color: 'white', letterSpacing: '0.04em' }}>{restName.toUpperCase()}</span>}
                                <CartButton bg="transparent" border={`1.5px solid ${c.accent}55`} iconColor="white" badgeBg={c.accent} badgeColor={c.primary} />
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: `'${fontHeading}', serif`, letterSpacing: '-0.01em' }}>{restName}</div>
                                <div className="text-[11px] tracking-widest uppercase" style={{ color: c.accent }}>Cocina de autor · Mesa 5</div>
                                <div className="h-px mt-3" style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }} />
                            </div>
                        </div>
                    )}

                    {headerStyle === 'industrial' && (
                        <div className="px-5 py-3 flex-shrink-0" style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.border}`, position: 'relative' }}>
                            <div className="flex items-center justify-between mb-2">
                                <HamburgerIcon color={c.text2} />
                                <span className="text-[22px] tracking-[0.1em]" style={{ fontFamily: `'${fontHeading}', sans-serif`, color: c.text }}>{restName.toUpperCase()}</span>
                                <CartButton bg="transparent" border={`1.5px solid ${c.primary}`} iconColor={c.primary} badgeBg={c.primary} badgeColor="white" />
                            </div>
                            <div className="text-[11px] font-medium tracking-[0.14em] uppercase" style={{ color: c.primary }}>Craft Kitchen · Mesa 7</div>
                            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)` }} />
                        </div>
                    )}

                    {headerStyle === 'editorial' && (
                        <div className="px-5 py-3 flex-shrink-0" style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.border}` }}>
                            <div className="flex items-center justify-between mb-3">
                                <HamburgerIcon color={c.text} thin />
                                <div className="flex gap-3.5">
                                    <svg className="w-[18px] h-[18px]" fill="none" stroke={c.text} strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                    <div className="relative">
                                        <CartIcon color={c.text} />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: c.text }} />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <div className="flex-1 h-px" style={{ backgroundColor: c.border }} />
                                    <span className="text-[11px] tracking-[0.22em] uppercase font-light" style={{ color: c.text2 }}>MENU</span>
                                    <div className="flex-1 h-px" style={{ backgroundColor: c.border }} />
                                </div>
                                <div className="text-[32px] font-light" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text, letterSpacing: '-0.02em', lineHeight: '1' }}>{restName}</div>
                                <div className="text-[11px] font-light tracking-wider mt-1" style={{ color: c.text2 }}>Cocina Nórdica · Mesa 3</div>
                            </div>
                        </div>
                    )}

                    {headerStyle === 'ornamental' && (
                        <div className="px-5 py-3 flex-shrink-0" style={{ backgroundColor: c.bg, borderBottom: `2px solid ${c.border}` }}>
                            <div className="text-center text-xs tracking-[0.14em] mb-2" style={{ color: c.border }}>· · · ✦ · · ·</div>
                            <div className="flex items-center justify-between mb-2.5">
                                <HamburgerIcon color={c.text2} />
                                <div className="text-center flex-1 px-2.5">
                                    <div className="text-[8px] font-semibold tracking-[0.22em] uppercase" style={{ color: c.text2 }}>Menú digital por</div>
                                    <div className="text-[9px] tracking-[0.18em] uppercase font-normal" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text2 }}>MYDIGITABLE</div>
                                </div>
                                <CartButton bg="transparent" iconColor={c.primary} badgeBg={c.primary} badgeColor="white" />
                            </div>
                            <div className="text-center">
                                <div className="text-[30px] font-bold leading-tight" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text, letterSpacing: '-0.02em' }}>{restName}</div>
                                <div className="text-xs font-normal italic mt-0.5" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text2 }}>Cucina italiana tradizionale</div>
                                <div className="flex items-center gap-2 mt-2.5">
                                    <div className="flex-1 h-px" style={{ backgroundColor: c.border }} />
                                    <span className="text-[13px]" style={{ color: c.primary }}>🌿</span>
                                    <div className="flex-1 h-px" style={{ backgroundColor: c.border }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====== SEARCH ====== */}
                    {config.show_search && headerStyle !== 'editorial' && (
                        <div className="px-5 pt-3 pb-2 flex-shrink-0" style={{ backgroundColor: headerStyle === 'hero' ? c.bg : c.surface }}>
                            <div className="px-4 py-2 flex items-center gap-2 border" style={{
                                backgroundColor: c.bg, borderColor: c.border,
                                borderRadius: cardShape === 'sharp' || cardShape === 'square' ? '4px' : '999px'
                            }}>
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={c.text2} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                <span className="text-sm" style={{ color: c.text2 }}>Buscar en el menú...</span>
                            </div>
                        </div>
                    )}

                    {/* ====== CATEGORIES ====== */}
                    {config.show_categories && (
                        <div className="px-5 pb-3 flex gap-2 overflow-x-auto flex-shrink-0" style={{
                            backgroundColor: headerStyle === 'hero' ? c.bg : c.surface,
                            borderBottom: categoryStyle === 'tabs' || categoryStyle === 'underline' ? `2px solid ${c.border}` : 'none'
                        }}>
                            {['Todos', ...catNames].map((cat, i) => {
                                if (categoryStyle === 'pills') return (
                                    <button key={cat} className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border-[1.5px] transition-all"
                                        style={{ backgroundColor: i === 0 ? c.primary : 'transparent', borderColor: i === 0 ? c.primary : c.border, color: i === 0 ? 'white' : c.text2 }}>{cat}</button>
                                )
                                if (categoryStyle === 'tabs') return (
                                    <button key={cat} className="px-3 py-2.5 text-[11px] font-bold tracking-wider uppercase whitespace-nowrap"
                                        style={{ color: i === 0 ? c.primary : c.text2, borderBottom: i === 0 ? `2px solid ${c.primary}` : '2px solid transparent', marginBottom: '-2px' }}>{cat}</button>
                                )
                                if (categoryStyle === 'tags') return (
                                    <button key={cat} className="px-3.5 py-1.5 text-[14px] tracking-wider whitespace-nowrap"
                                        style={{ fontFamily: `'${fontHeading}', sans-serif`, letterSpacing: '0.08em', backgroundColor: i === 0 ? c.primary : 'transparent', border: `1.5px solid ${i === 0 ? c.primary : c.border}`, borderRadius: '2px', color: i === 0 ? 'white' : c.text2 }}>{cat}</button>
                                )
                                if (categoryStyle === 'underline') return (
                                    <button key={cat} className="px-0 py-2.5 text-[11px] tracking-wider uppercase whitespace-nowrap font-light mr-4"
                                        style={{ color: i === 0 ? c.text : c.text2, borderBottom: i === 0 ? `1.5px solid ${c.text}` : '1.5px solid transparent', marginBottom: '-2px' }}>{cat}</button>
                                )
                                // italic-tags
                                return (
                                    <button key={cat} className="px-3.5 py-1.5 text-xs whitespace-nowrap"
                                        style={{ fontFamily: `'${fontHeading}', serif`, fontStyle: i === 0 ? 'normal' : 'italic', fontWeight: i === 0 ? '700' : '400', backgroundColor: i === 0 ? c.primary : 'transparent', border: `1.5px solid ${i === 0 ? c.primary : c.border}`, borderRadius: '3px', color: i === 0 ? 'white' : c.text2 }}>{cat}</button>
                                )
                            })}
                        </div>
                    )}

                    {/* ====== CONTENT ====== */}
                    <div className="flex-1 overflow-y-auto pb-24" style={{ backgroundColor: c.bg }}>
                        {/* Featured Section */}
                        {featuredStyle === 'dark-banner' && products[0] && (
                            <div className="mx-5 mt-4 mb-4 overflow-hidden" style={{ backgroundColor: headerStyle === 'industrial' ? c.surface : c.primary, borderRadius: cardShape === 'sharp' ? '3px' : cardShape === 'square' ? '4px' : radius }}>
                                <div className="w-full h-[130px] flex items-center justify-center text-[64px]" style={{ background: `linear-gradient(135deg, ${c.primary}22, ${c.primary}44)` }}>
                                    🍗
                                </div>
                                <div className="px-3.5 py-3">
                                    <div className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: c.accent }}>⭐ Plato de la Casa</div>
                                    <div className="text-[17px] font-bold text-white mb-2" style={{ fontFamily: `'${fontHeading}', serif` }}>{products[0].name}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[17px] font-semibold" style={{ color: c.accent, fontFamily: `'${fontHeading}', serif` }}>€{products[0].price.toFixed(2)}</span>
                                        <button className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: c.accent, color: c.primary, borderRadius: cardShape === 'sharp' ? '2px' : '4px' }}>Pedir</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {featuredStyle === 'hero-image' && products[0] && (
                            <div>
                                <div className="w-full h-[200px] flex items-center justify-center text-[80px]" style={{ backgroundColor: '#F5F5F5' }}>🥑</div>
                                <div className="px-5 py-3.5 flex items-start justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                                    <div>
                                        <div className="text-xl font-light mb-0.5" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text }}>{products[0].name}</div>
                                        <div className="text-xs font-light" style={{ color: c.text2 }}>{products[0].description}</div>
                                    </div>
                                    <span className="text-xl font-light flex-shrink-0 ml-3.5" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text }}>€{products[0].price.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        {featuredStyle === 'ribbon' && products[0] && (
                            <div className="mx-5 mt-4 mb-4 overflow-hidden flex" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, borderRadius: '5px', boxShadow: '0 1px 4px rgba(100,50,0,0.06)' }}>
                                <div className="w-[100px] flex-shrink-0 flex items-center justify-center text-[40px] relative" style={{ backgroundColor: `${c.accent}22` }}>
                                    🍗
                                    <div className="absolute top-2 left-[-2px] text-[8px] font-semibold uppercase tracking-wider text-white px-2.5 py-0.5" style={{ backgroundColor: c.primary }}>Chef&apos;s pick</div>
                                </div>
                                <div className="flex-1 p-3">
                                    <div className="text-sm font-bold mb-0.5" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text }}>{products[0].name}</div>
                                    <div className="text-[11px] mb-2 leading-relaxed" style={{ color: c.text2 }}>{products[0].description}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-bold" style={{ fontFamily: `'${fontHeading}', serif`, color: c.primary }}>€{products[0].price.toFixed(2)}</span>
                                        <button className="px-3 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: c.primary, borderRadius: '3px' }}>Añadir</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section Label */}
                        {config.show_badges && (
                            <div className="px-5 mt-3 mb-3">
                                {(headerStyle === 'simple' || headerStyle === 'industrial') && (
                                    <div className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-2.5" style={{ color: headerStyle === 'industrial' ? c.primary : c.text2, fontFamily: headerStyle === 'industrial' ? `'${fontHeading}', sans-serif` : 'inherit', fontSize: headerStyle === 'industrial' ? '20px' : '11px', letterSpacing: headerStyle === 'industrial' ? '0.1em' : '0.08em' }}>
                                        {headerStyle === 'industrial' ? '' : '⭐ '}Destacados
                                        {headerStyle === 'industrial' && <span className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${c.border}, transparent)` }} />}
                                    </div>
                                )}
                                {headerStyle === 'hero' && (
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex-1 h-px" style={{ backgroundColor: c.border }} />
                                        <span className="text-[13px] font-semibold italic" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text2 }}>Entrées</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: c.border }} />
                                    </div>
                                )}
                                {headerStyle === 'editorial' && (
                                    <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: c.text2 }}>⭐ Destacados</div>
                                )}
                                {headerStyle === 'ornamental' && (
                                    <div className="text-center">
                                        <div className="text-[15px] font-bold uppercase tracking-wider" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text }}>Nuestra Carta</div>
                                        <div className="h-0.5 mt-1" style={{ background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)` }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Product Cards */}
                        <div className="px-5" style={{ gap: spacing }}>
                            {/* GRID layout */}
                            {(config.layout_type === 'grid' || config.layout_type === 'tabs' || config.layout_type === 'masonry') && (
                                <div className="grid" style={{ gridTemplateColumns: `repeat(${config.grid_columns}, 1fr)`, gap: spacing }}>
                                    {products.slice(featuredStyle !== 'none' ? 1 : 0, 6).map((p, i) => (
                                        <div key={p.id} className={`overflow-hidden ${config.card_style === 'elevated' ? 'shadow-md' : ''}`}
                                            style={{ backgroundColor: c.surface, borderRadius: radius, border: config.card_style === 'outlined' || cardShape === 'sharp' ? `1px solid ${c.border}` : 'none' }}>
                                            {config.show_images && (
                                                <div className="w-full aspect-[4/3] flex items-center justify-center text-3xl relative" style={{ background: `linear-gradient(135deg, ${c.border}55, ${c.border}88)` }}>
                                                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : '🍽️'}
                                                    {config.show_badges && i === 0 && (
                                                        <div className="absolute top-2 left-2 text-[8px] font-bold px-2 py-0.5 text-white" style={{ backgroundColor: c.primary, borderRadius: cardShape === 'sharp' ? '2px' : '4px' }}>Popular</div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="p-2.5">
                                                <div className="text-xs font-semibold mb-1" style={{ color: c.text, fontFamily: headerStyle === 'editorial' || headerStyle === 'ornamental' ? `'${fontHeading}', serif` : 'inherit' }}>{p.name}</div>
                                                {config.show_descriptions && p.description && <div className="text-[10px] mb-2 line-clamp-2" style={{ color: c.text2 }}>{p.description}</div>}
                                                <div className="flex items-center justify-between">
                                                    {config.show_prices && <span className="text-sm font-bold" style={{ color: c.primary, fontFamily: headerStyle === 'hero' || headerStyle === 'editorial' ? `'${fontHeading}', serif` : 'inherit' }}>€{p.price.toFixed(2)}</span>}
                                                    <AddButton shape={cardShape} primary={c.primary} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PHOTO-GRID layout */}
                            {config.layout_type === 'photo-grid' && (
                                <div className="grid grid-cols-2 gap-px -mx-5" style={{ backgroundColor: c.border }}>
                                    {products.slice(featuredStyle !== 'none' ? 1 : 0, 5).map((p) => (
                                        <div key={p.id} style={{ backgroundColor: c.surface }}>
                                            {config.show_images && (
                                                <div className="w-full aspect-square flex items-center justify-center text-[40px]" style={{ backgroundColor: '#F5F5F5' }}>
                                                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : '🍽️'}
                                                </div>
                                            )}
                                            <div className="p-2.5">
                                                <div className="text-sm mb-0.5" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text, fontWeight: '400' }}>{p.name}</div>
                                                {config.show_descriptions && <div className="text-[10px] font-light mb-1.5" style={{ color: c.text2 }}>{p.description}</div>}
                                                <div className="flex items-center justify-between">
                                                    {config.show_prices && <span className="text-sm" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text, fontWeight: '400' }}>€{p.price.toFixed(2)}</span>}
                                                    <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-sm" style={{ border: `1.5px solid ${c.text}`, color: c.text }}>+</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* LIST layout */}
                            {config.layout_type === 'list' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
                                    {products.slice(featuredStyle !== 'none' ? 1 : 0, 6).map((p, i) => (
                                        <div key={p.id} className={`flex gap-3 items-center ${config.card_style === 'elevated' ? 'shadow-md' : ''}`}
                                            style={{
                                                backgroundColor: headerStyle === 'hero' ? c.surface : 'transparent',
                                                borderRadius: headerStyle === 'hero' ? radius : '0',
                                                border: headerStyle === 'hero' ? `1px solid ${c.border}` : 'none',
                                                borderBottom: headerStyle !== 'hero' ? `1px solid ${c.border}` : undefined,
                                                padding: headerStyle === 'hero' ? '12px' : '13px 0',
                                            }}>
                                            {/* Industrial numbered list */}
                                            {headerStyle === 'industrial' && (
                                                <span className="text-[26px] w-8 text-center flex-shrink-0" style={{ fontFamily: `'${fontHeading}', sans-serif`, color: c.border }}>{String(i + 1).padStart(2, '0')}</span>
                                            )}
                                            {config.show_images && (
                                                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden" style={{
                                                    borderRadius: cardShape === 'sharp' ? '3px' : '8px',
                                                    backgroundColor: `${c.border}33`,
                                                    border: headerStyle === 'industrial' ? `1px solid ${c.border}` : 'none',
                                                }}>
                                                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : '🍽️'}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold mb-0.5" style={{ color: c.text, fontFamily: headerStyle === 'industrial' ? `'${fontHeading}', sans-serif` : headerStyle === 'hero' || headerStyle === 'editorial' || headerStyle === 'ornamental' ? `'${fontHeading}', serif` : 'inherit', fontSize: headerStyle === 'industrial' ? '17px' : '13px', letterSpacing: headerStyle === 'industrial' ? '0.05em' : 'normal' }}>{p.name}</div>
                                                {config.show_descriptions && p.description && <div className="text-[11px] line-clamp-1" style={{ color: c.text2 }}>{p.description}</div>}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                {config.show_prices && <span className="text-sm font-bold block mb-1" style={{ color: c.primary, fontFamily: headerStyle === 'industrial' ? `'${fontHeading}', sans-serif` : headerStyle === 'hero' ? `'${fontHeading}', serif` : 'inherit', fontSize: headerStyle === 'industrial' ? '19px' : '14px' }}>€{p.price.toFixed(2)}</span>}
                                                <AddButton shape={cardShape} primary={c.primary} small />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* HORIZONTAL-CARDS layout */}
                            {config.layout_type === 'horizontal-cards' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
                                    {products.slice(featuredStyle !== 'none' ? 1 : 0, 5).map((p) => (
                                        <div key={p.id} className="flex overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, borderRadius: '5px', boxShadow: '0 1px 4px rgba(100,50,0,0.06)' }}>
                                            {config.show_images && (
                                                <div className="w-[100px] flex-shrink-0 flex items-center justify-center text-[40px]" style={{ backgroundColor: `${c.accent}22` }}>
                                                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : '🍽️'}
                                                </div>
                                            )}
                                            <div className="flex-1 p-3">
                                                <div className="text-sm font-bold mb-0.5 leading-tight" style={{ fontFamily: `'${fontHeading}', serif`, color: c.text }}>{p.name}</div>
                                                {config.show_descriptions && <div className="text-[11px] mb-2 leading-relaxed" style={{ color: c.text2 }}>{p.description}</div>}
                                                <div className="flex items-center justify-between">
                                                    {config.show_prices && <span className="text-base font-bold" style={{ fontFamily: `'${fontHeading}', serif`, color: c.primary }}>€{p.price.toFixed(2)}</span>}
                                                    <button className="px-3 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: c.primary, borderRadius: '3px' }}>Añadir</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating Cart */}
                    <div className="absolute bottom-6 left-5 right-5 px-5 py-3.5 flex items-center justify-between shadow-lg z-10"
                        style={{ backgroundColor: c.primary, borderRadius: headerStyle === 'simple' ? '999px' : headerStyle === 'industrial' || headerStyle === 'hero' ? '4px' : headerStyle === 'ornamental' ? '5px' : '0' }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>2</div>
                            <span className="text-sm font-semibold text-white" style={{ fontFamily: headerStyle === 'industrial' ? `'${fontHeading}', sans-serif` : 'inherit', letterSpacing: headerStyle === 'industrial' ? '0.08em' : 'normal' }}>Ver pedido</span>
                        </div>
                        <span className="text-base font-bold text-white" style={{ fontFamily: headerStyle === 'hero' || headerStyle === 'editorial' || headerStyle === 'ornamental' ? `'${fontHeading}', serif` : headerStyle === 'industrial' ? `'${fontHeading}', sans-serif` : 'inherit' }}>€33.40</span>
                    </div>

                    {/* Powered By */}
                    {config.show_powered_by && (
                        <div className="text-center py-1.5 text-[9px] border-t flex-shrink-0"
                            style={{ backgroundColor: headerStyle === 'hero' ? c.primary : c.surface, color: headerStyle === 'hero' ? `${c.accent}88` : c.text2, borderColor: headerStyle === 'hero' ? 'transparent' : c.border }}>
                            Menú digital por <span className="font-semibold" style={{ color: headerStyle === 'hero' ? c.accent : c.primary }}>MyDigitable</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

// ============================================
// Sub-Components
// ============================================

function HamburgerIcon({ color, thin }: { color: string; thin?: boolean }) {
    const h = thin ? '1.5px' : '2px'
    return (
        <div className="flex flex-col gap-1 cursor-pointer">
            <span className="w-5 rounded" style={{ height: h, backgroundColor: color }} />
            <span className="w-5 rounded" style={{ height: h, backgroundColor: color }} />
            <span className="w-5 rounded" style={{ height: h, backgroundColor: color }} />
        </div>
    )
}

function CartIcon({ color }: { color: string }) {
    return <svg className="w-[18px] h-[18px]" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>
}

function CartButton({ bg, border, iconColor, badgeBg, badgeColor }: { bg: string; border?: string; iconColor?: string; badgeBg?: string; badgeColor?: string }) {
    return (
        <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center relative cursor-pointer"
            style={{ backgroundColor: bg, border: border || 'none' }}>
            <svg className="w-[18px] h-[18px]" fill="none" stroke={iconColor || 'white'} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white"
                style={{ backgroundColor: badgeBg || '#EF4444', color: badgeColor || 'white' }}>2</div>
        </div>
    )
}

function AddButton({ shape, primary, small }: { shape: string; primary: string; small?: boolean }) {
    const sz = small ? 'w-[22px] h-[22px]' : 'w-7 h-7'
    const r = shape === 'sharp' ? '2px' : shape === 'square' ? '4px' : shape === 'borderless' ? '50%' : '8px'

    if (shape === 'borderless') {
        return (
            <div className={`${sz} rounded-full flex items-center justify-center text-sm cursor-pointer`}
                style={{ border: `1.5px solid ${primary}`, color: primary }}>+</div>
        )
    }

    return (
        <div className={`${sz} flex items-center justify-center cursor-pointer`}
            style={{ backgroundColor: shape === 'sharp' || shape === 'square' ? 'transparent' : primary, border: shape === 'sharp' || shape === 'square' ? `1.5px solid ${primary}` : 'none', borderRadius: r }}>
            <svg className={small ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill="none" stroke={shape === 'sharp' || shape === 'square' ? primary : 'white'} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        </div>
    )
}
