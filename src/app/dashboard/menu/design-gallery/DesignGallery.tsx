'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { MenuMobilePreview } from '@/components/shared/MenuMobilePreview'
import { MenuPreview } from '@/app/dashboard/menu/design/components/MenuPreview'
import { MobilePreview } from '@/app/dashboard/menu/design/components/MobilePreview'
import type { RestaurantDesignConfig, MenuTheme } from '@/types/design'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    restaurant: { id: string; name?: string; business_name?: string; slug?: string } & Record<string, unknown>
    realMenus: Record<string, unknown>[]
}

type GroupId = 'all' | '1' | '2' | '3' | '4'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_MENUS = [
    {
        id: 'mock-menu-1',
        name: 'Carta',
        categories: [
            {
                id: 'cat-1',
                name: 'Entrantes',
                display_order: 1,
                layout_type: 'grid',
                grid_columns: 2,
                show_images: true,
                show_prices: true,
                show_descriptions: true,
                products: [
                    { id: 'p1', name: 'Croquetas de jamón ibérico', description: 'Receta tradicional de la casa', price: 8.50, image_url: null, is_available: true, is_featured: true, featured_badge: 'Popular' },
                    { id: 'p2', name: 'Ensalada César', description: 'Lechuga romana, pollo, parmesano', price: 12.00, image_url: null, is_available: true, is_featured: false, featured_badge: null },
                    { id: 'p3', name: 'Gazpacho andaluz', description: 'Fresco y aromático, receta original', price: 7.00, image_url: null, is_available: true, is_featured: false, featured_badge: null },
                ],
            },
            {
                id: 'cat-2',
                name: 'Principales',
                display_order: 2,
                layout_type: 'grid',
                grid_columns: 2,
                show_images: true,
                show_prices: true,
                show_descriptions: true,
                products: [
                    { id: 'p4', name: 'Lubina a la sal', description: 'Con guarnición de temporada', price: 28.00, image_url: null, is_available: true, is_featured: true, featured_badge: 'Del Chef' },
                    { id: 'p5', name: 'Chuletón de buey', description: 'A la brasa, 400g, con patatas', price: 34.00, image_url: null, is_available: true, is_featured: false, featured_badge: null },
                    { id: 'p6', name: 'Arroz meloso de gambas', description: 'Con caldo casero de marisco', price: 22.00, image_url: null, is_available: true, is_featured: false, featured_badge: null },
                ],
            },
            {
                id: 'cat-3',
                name: 'Postres',
                display_order: 3,
                layout_type: 'grid',
                grid_columns: 2,
                show_images: true,
                show_prices: true,
                show_descriptions: true,
                products: [
                    { id: 'p7', name: 'Tarta de queso', description: 'Estilo vasco, textura cremosa', price: 7.50, image_url: null, is_available: true, is_featured: false, featured_badge: null },
                    { id: 'p8', name: 'Crema catalana', description: 'Receta tradicional con azúcar quemado', price: 6.00, image_url: null, is_available: true, is_featured: false, featured_badge: null },
                ],
            },
        ],
    },
]

// ─── Config factory ───────────────────────────────────────────────────────────

const MOCK_THEME_BASE: Omit<MenuTheme, 'header_style' | 'category_style' | 'colors' | 'fonts' | 'name' | 'slug'> = {
    id: 'gallery-mock',
    description: '',
    card_shape: 'rounded',
    featured_style: 'dark-banner',
    layout_type: 'grid',
    best_for: [],
    is_premium: false,
    display_order: 0,
    created_at: '',
    updated_at: '',
}

function makeConfig(
    theme: Pick<MenuTheme, 'name' | 'slug' | 'colors' | 'fonts' | 'header_style' | 'category_style'> & Partial<MenuTheme>,
    overrides?: Partial<RestaurantDesignConfig>
): RestaurantDesignConfig {
    return {
        id: 'gallery-mock',
        restaurant_id: 'gallery-mock',
        selected_theme: { ...MOCK_THEME_BASE, ...theme } as MenuTheme,
        layout_type: 'grid',
        grid_columns: 2,
        card_style: 'elevated',
        spacing: 'normal',
        border_radius: 12,
        show_search: true,
        show_categories: true,
        show_images: true,
        show_prices: true,
        show_descriptions: true,
        show_badges: true,
        show_prep_time: false,
        show_allergens: false,
        show_logo: true,
        show_header: true,
        show_powered_by: false,
        created_at: '',
        updated_at: '',
        ...overrides,
    }
}

// ─── Theme color presets ──────────────────────────────────────────────────────

const COLORS_MODERN = {
    primary: '#16A34A', accent: '#16A34A',
    background: '#FAFAF9', surface: '#FFFFFF',
    border: '#E7E5E4', text: '#1C1917', text_secondary: '#78716C',
}
const COLORS_BISTRO = {
    primary: '#1E3A8A', accent: '#D4AF37',
    background: '#FEFCF3', surface: '#FFFFFF',
    border: '#DCD7C9', text: '#0F172A', text_secondary: '#64748B',
}
const COLORS_CRAFT = {
    primary: '#C27831', accent: '#C27831',
    background: '#1A1815', surface: '#26231E',
    border: '#3A362E', text: '#F5F0E6', text_secondary: '#A89C86',
}
const COLORS_NORDIC = {
    primary: '#525252', accent: '#525252',
    background: '#FFFFFF', surface: '#FAFAFA',
    border: '#F0F0F0', text: '#171717', text_secondary: '#737373',
}
const COLORS_RUSTIC = {
    primary: '#B45309', accent: '#B45309',
    background: '#FEF7EC', surface: '#FFF8F2',
    border: '#E7D5BC', text: '#451A03', text_secondary: '#92400E',
}

// ─── Group 1: MenuMobilePreview — 5 temas ─────────────────────────────────────

interface Group1Item {
    label: string
    slug: string
    colors: typeof COLORS_MODERN
    fonts: { heading: string; body: string }
}

const GROUP1_ITEMS: Group1Item[] = [
    { label: 'Modern Minimal', slug: 'modern-minimal', colors: COLORS_MODERN, fonts: { heading: 'DM Sans', body: 'DM Sans' } },
    { label: 'Classic Bistro', slug: 'classic-bistro', colors: COLORS_BISTRO, fonts: { heading: 'Playfair Display', body: 'Lato' } },
    { label: 'Craft & Bold', slug: 'craft-bold', colors: COLORS_CRAFT, fonts: { heading: 'Bebas Neue', body: 'Barlow' } },
    { label: 'Nordic Clean', slug: 'nordic-clean', colors: COLORS_NORDIC, fonts: { heading: 'Cormorant Garamond', body: 'Outfit' } },
    { label: 'Warm Rustic', slug: 'warm-rustic', colors: COLORS_RUSTIC, fonts: { heading: 'Libre Baskerville', body: 'Source Sans 3' } },
]

// ─── Group 2: MenuPreview — 5 estilos de header ───────────────────────────────

const GROUP2_CONFIGS: Array<{ label: string; config: RestaurantDesignConfig }> = [
    {
        label: 'Header: Simple',
        config: makeConfig({ name: 'Simple', slug: 'simple', colors: COLORS_MODERN, fonts: { heading: 'DM Sans', body: 'DM Sans' }, header_style: 'simple', category_style: 'pills', card_shape: 'rounded', featured_style: 'dark-banner' }),
    },
    {
        label: 'Header: Hero',
        config: makeConfig({ name: 'Hero', slug: 'hero', colors: COLORS_BISTRO, fonts: { heading: 'Playfair Display', body: 'Lato' }, header_style: 'hero', category_style: 'pills', card_shape: 'rounded', featured_style: 'dark-banner' }),
    },
    {
        label: 'Header: Industrial',
        config: makeConfig({ name: 'Industrial', slug: 'industrial', colors: COLORS_CRAFT, fonts: { heading: 'Bebas Neue', body: 'Barlow' }, header_style: 'industrial', category_style: 'tags', card_shape: 'sharp', featured_style: 'dark-banner' }),
    },
    {
        label: 'Header: Editorial',
        config: makeConfig({ name: 'Editorial', slug: 'editorial', colors: COLORS_NORDIC, fonts: { heading: 'Cormorant Garamond', body: 'Outfit' }, header_style: 'editorial', category_style: 'underline', card_shape: 'borderless', featured_style: 'hero-image' }),
    },
    {
        label: 'Header: Ornamental',
        config: makeConfig({ name: 'Ornamental', slug: 'ornamental', colors: COLORS_RUSTIC, fonts: { heading: 'Libre Baskerville', body: 'Source Sans 3' }, header_style: 'ornamental', category_style: 'italic-tags', card_shape: 'soft', featured_style: 'ribbon' }),
    },
]

// ─── Group 3: MenuPreview — 5 estilos de categorías ──────────────────────────

const GROUP3_CONFIGS: Array<{ label: string; config: RestaurantDesignConfig }> = [
    {
        label: 'Categorías: Pills',
        config: makeConfig({ name: 'Pills', slug: 'pills', colors: COLORS_MODERN, fonts: { heading: 'DM Sans', body: 'DM Sans' }, header_style: 'simple', category_style: 'pills', card_shape: 'rounded', featured_style: 'none' }),
    },
    {
        label: 'Categorías: Tabs',
        config: makeConfig({ name: 'Tabs', slug: 'tabs', colors: COLORS_BISTRO, fonts: { heading: 'Playfair Display', body: 'Lato' }, header_style: 'simple', category_style: 'tabs', card_shape: 'rounded', featured_style: 'none' }),
    },
    {
        label: 'Categorías: Tags',
        config: makeConfig({ name: 'Tags', slug: 'tags', colors: COLORS_CRAFT, fonts: { heading: 'Bebas Neue', body: 'Barlow' }, header_style: 'simple', category_style: 'tags', card_shape: 'sharp', featured_style: 'none' }),
    },
    {
        label: 'Categorías: Underline',
        config: makeConfig({ name: 'Underline', slug: 'underline', colors: COLORS_NORDIC, fonts: { heading: 'Cormorant Garamond', body: 'Outfit' }, header_style: 'simple', category_style: 'underline', card_shape: 'borderless', featured_style: 'none' }),
    },
    {
        label: 'Categorías: Italic Tags',
        config: makeConfig({ name: 'Italic Tags', slug: 'italic-tags', colors: COLORS_RUSTIC, fonts: { heading: 'Libre Baskerville', body: 'Source Sans 3' }, header_style: 'simple', category_style: 'italic-tags', card_shape: 'soft', featured_style: 'none' }),
    },
]

// ─── Group 4: design/components/MobilePreview — 3 variantes ──────────────────

const GROUP4_CONFIGS: Array<{ label: string; config: RestaurantDesignConfig }> = [
    {
        label: 'iPhone 14 · Grid + Destacados',
        config: makeConfig(
            { name: 'Grid Destacados', slug: 'modern-minimal', colors: COLORS_MODERN, fonts: { heading: 'DM Sans', body: 'DM Sans' }, header_style: 'simple', category_style: 'pills', card_shape: 'rounded', featured_style: 'dark-banner' },
            { layout_type: 'grid', grid_columns: 2 }
        ),
    },
    {
        label: 'iPhone 14 · Lista',
        config: makeConfig(
            { name: 'Lista', slug: 'classic-bistro', colors: COLORS_BISTRO, fonts: { heading: 'Playfair Display', body: 'Lato' }, header_style: 'simple', category_style: 'pills', card_shape: 'rounded', featured_style: 'none' },
            { layout_type: 'list', grid_columns: 1 }
        ),
    },
    {
        label: 'iPhone 14 · Grid Minimalista',
        config: makeConfig(
            { name: 'Grid Minimalista', slug: 'nordic-clean', colors: COLORS_NORDIC, fonts: { heading: 'Cormorant Garamond', body: 'Outfit' }, header_style: 'simple', category_style: 'pills', card_shape: 'borderless', featured_style: 'none' },
            { layout_type: 'grid', grid_columns: 2, show_images: false, show_descriptions: false, card_style: 'outlined' }
        ),
    },
]

// ─── Scale wrapper ────────────────────────────────────────────────────────────

function ScaledPhone({ children, nativeWidth, nativeHeight }: {
    children: React.ReactNode
    nativeWidth: number
    nativeHeight: number
}) {
    const scale = 240 / nativeWidth
    const scaledHeight = Math.round(nativeHeight * scale)
    return (
        <div style={{ width: 240, height: scaledHeight, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: nativeWidth, height: nativeHeight, pointerEvents: 'none' }}>
                {children}
            </div>
        </div>
    )
}

// Phone shell for MenuMobilePreview (which has no built-in frame)
function PhoneShell({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                width: 375,
                height: 812,
                borderRadius: 44,
                border: '14px solid #1e293b',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 0 0 2px #0f172a',
            }}
        >
            {/* Notch */}
            <div
                style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 140, height: 28, backgroundColor: '#1e293b', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, zIndex: 10,
                }}
            />
            <div style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                {children}
            </div>
        </div>
    )
}

// ─── Design card ──────────────────────────────────────────────────────────────

function DesignCard({ label, source, children }: {
    label: string
    source: string
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-slate-800 text-center">{label}</p>
            <div className="flex-1 flex items-start justify-center">
                {children}
            </div>
            <p className="text-[11px] text-slate-400 font-mono text-center leading-tight">{source}</p>
            <button
                onClick={() => toast('Próximamente — esta función estará disponible pronto.', { duration: 2500 })}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors"
            >
                Seleccionar este
            </button>
        </div>
    )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, description, count }: { title: string; description: string; count: number }) {
    return (
        <div className="mb-6">
            <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <span className="text-xs text-slate-400 font-mono">{count} diseños</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DesignGallery({ restaurant, realMenus }: Props) {
    const [activeGroup, setActiveGroup] = useState<GroupId>('all')

    const restName = restaurant.business_name || restaurant.name || 'Mi Restaurante'
    const restInfo = { name: restName, business_name: restName, tagline: 'Cocina tradicional' }
    const menus = realMenus.length > 0 ? realMenus : MOCK_MENUS
    const hasMock = realMenus.length === 0

    const FILTER_TABS: { id: GroupId; label: string }[] = [
        { id: 'all', label: 'Todos' },
        { id: '1', label: 'Temas heredados' },
        { id: '2', label: 'Estilos de header' },
        { id: '3', label: 'Estilos de categorías' },
        { id: '4', label: 'Preview moderno' },
    ]

    const showGroup = (id: GroupId) => activeGroup === 'all' || activeGroup === id

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* ── Page header ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Galería de Diseños</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Todos los diseños de menú disponibles en el proyecto — activos y abandonados. Solo lectura.
                </p>
                {hasMock && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                        <span>⚠</span>
                        <span>No hay productos reales. Se muestran datos de ejemplo.</span>
                    </div>
                )}
            </div>

            {/* ── Filter tabs ── */}
            <div className="flex gap-2 flex-wrap mb-10">
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveGroup(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeGroup === tab.id
                            ? 'bg-slate-900 text-white shadow'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ════════════════════════════════════════════════════
                GRUPO 1 — MenuMobilePreview (shared) · 5 temas
            ════════════════════════════════════════════════════ */}
            {showGroup('1') && (
                <section className="mb-16">
                    <SectionHeader
                        title="Grupo 1 — Temas de MenuMobilePreview"
                        description="Activo · Usado en sidebar del dashboard, Design Studio y wizard. Detecta el tema por slug."
                        count={GROUP1_ITEMS.length}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {GROUP1_ITEMS.map((item) => {
                            const designConfig = {
                                selected_theme: {
                                    slug: item.slug,
                                    colors: item.colors,
                                    fonts: item.fonts,
                                    header_style: 'simple',
                                    category_style: 'pills',
                                    card_shape: 'rounded',
                                    featured_style: 'banner',
                                    layout_type: 'grid',
                                },
                                custom_colors: {},
                                layout_type: 'grid',
                                grid_columns: 2,
                                card_style: 'elevated',
                                spacing: 'normal',
                                border_radius: 12,
                                show_search: true,
                                show_categories: true,
                                show_images: false,
                                show_prices: true,
                                show_descriptions: true,
                                show_badges: true,
                                show_logo: true,
                                show_header: true,
                                show_powered_by: false,
                            }
                            return (
                                <DesignCard
                                    key={item.slug}
                                    label={item.label}
                                    source="MenuMobilePreview.tsx"
                                >
                                    <ScaledPhone nativeWidth={375} nativeHeight={812}>
                                        <PhoneShell>
                                            <MenuMobilePreview
                                                restaurant={restInfo}
                                                menus={menus as Array<Record<string, unknown>>}
                                                designConfig={designConfig as never}
                                            />
                                        </PhoneShell>
                                    </ScaledPhone>
                                </DesignCard>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* ════════════════════════════════════════════════════
                GRUPO 2 — MenuPreview · 5 estilos de header
            ════════════════════════════════════════════════════ */}
            {showGroup('2') && (
                <section className="mb-16">
                    <SectionHeader
                        title="Grupo 2 — Estilos de header (MenuPreview)"
                        description="Huérfano · Definido en design/components/MenuPreview.tsx pero sin ninguna importación activa. El componente más avanzado visualmente del proyecto."
                        count={GROUP2_CONFIGS.length}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {GROUP2_CONFIGS.map(({ label, config }) => (
                            <DesignCard key={label} label={label} source="design/components/MenuPreview.tsx">
                                <ScaledPhone nativeWidth={390} nativeHeight={844}>
                                    <MenuPreview
                                        restaurant={restInfo}
                                        menus={menus as never}
                                        config={config}
                                    />
                                </ScaledPhone>
                            </DesignCard>
                        ))}
                    </div>
                </section>
            )}

            {/* ════════════════════════════════════════════════════
                GRUPO 3 — MenuPreview · 5 estilos de categorías
            ════════════════════════════════════════════════════ */}
            {showGroup('3') && (
                <section className="mb-16">
                    <SectionHeader
                        title="Grupo 3 — Estilos de categorías (MenuPreview)"
                        description="Huérfano · Mismo componente que Grupo 2. Muestra las 5 variantes del navegador de categorías."
                        count={GROUP3_CONFIGS.length}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {GROUP3_CONFIGS.map(({ label, config }) => (
                            <DesignCard key={label} label={label} source="design/components/MenuPreview.tsx">
                                <ScaledPhone nativeWidth={390} nativeHeight={844}>
                                    <MenuPreview
                                        restaurant={restInfo}
                                        menus={menus as never}
                                        config={config}
                                    />
                                </ScaledPhone>
                            </DesignCard>
                        ))}
                    </div>
                </section>
            )}

            {/* ════════════════════════════════════════════════════
                GRUPO 4 — design/components/MobilePreview · 3 variantes
            ════════════════════════════════════════════════════ */}
            {showGroup('4') && (
                <section className="mb-16">
                    <SectionHeader
                        title="Grupo 4 — Preview moderno iPhone 14 (MobilePreview)"
                        description="Huérfano · Definido en design/components/MobilePreview.tsx. Marco Dynamic Island. Sin importaciones activas."
                        count={GROUP4_CONFIGS.length}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {GROUP4_CONFIGS.map(({ label, config }) => (
                            <DesignCard key={label} label={label} source="design/components/MobilePreview.tsx">
                                <ScaledPhone nativeWidth={430} nativeHeight={880}>
                                    <MobilePreview
                                        restaurant={restInfo}
                                        menus={menus as never}
                                        config={config}
                                        selectedCategory={null}
                                        onSelectProduct={() => { }}
                                    />
                                </ScaledPhone>
                            </DesignCard>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Footer note ── */}
            <div className="border-t border-slate-100 pt-8 mt-4">
                <p className="text-xs text-slate-400 text-center">
                    Esta galería es de solo lectura. No modifica ningún dato. Los diseños huérfanos existen en el código pero no están conectados al sistema activo.
                </p>
            </div>
        </div>
    )
}
