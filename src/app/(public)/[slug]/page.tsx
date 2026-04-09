import { createClient } from '@/lib/supabase/server'
import { getThemeById } from '@/lib/theme/themes'
import { buildCSSVariables } from '@/lib/theme/apply-theme'
import { notFound } from 'next/navigation'

interface Props {
    params: { slug: string }
}

export default async function MenuPublicPage({ params }: Props) {
    const supabase = await createClient()

    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', params.slug)
        .single()

    if (error || !restaurant) {
        notFound()
    }

    const theme = getThemeById(restaurant.theme_id ?? 'modern-minimal')
    const cssVars = buildCSSVariables(theme, {
        primaryColor: restaurant.theme_primary_color ?? undefined,
        fontFamily: restaurant.theme_font ?? undefined,
        fontSize: (restaurant.theme_font_size as 'sm' | 'md' | 'lg') ?? 'md',
    })

    return (
        <div style={cssVars as React.CSSProperties}>
            <div className="theme-bg theme-text min-h-screen">
                {/* Header */}
                <header
                    className="p-6 shadow-md"
                    style={{ background: 'var(--header-bg)' }}
                >
                    <div className="max-w-4xl mx-auto">
                        <h1
                            className="theme-font-heading text-3xl font-bold mb-2"
                            style={{ color: `rgb(var(--header-text))` }}
                        >
                            {restaurant.name}
                        </h1>
                        <p className="theme-text-secondary text-sm">
                            {restaurant.address && `${restaurant.address} • `}
                            {restaurant.city}
                        </p>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-4xl mx-auto p-6">
                    {/* Theme info card */}
                    <div className="theme-surface rounded-2xl p-8 theme-shadow-md mb-6">
                        <h2 className="theme-font-heading text-2xl font-bold mb-4">
                            Vista previa del tema
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg"
                                    style={{ background: `rgb(var(--color-primary))` }}
                                />
                                <div>
                                    <p className="font-semibold">Tema: {theme.name}</p>
                                    <p className="theme-text-secondary text-sm">{theme.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="theme-border border rounded-lg p-4">
                                    <p className="theme-text-muted text-xs mb-1">Color primario</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded"
                                            style={{ background: `rgb(var(--color-primary))` }}
                                        />
                                        <span className="text-sm font-mono">
                                            {restaurant.theme_primary_color ?? 'Por defecto'}
                                        </span>
                                    </div>
                                </div>

                                <div className="theme-border border rounded-lg p-4">
                                    <p className="theme-text-muted text-xs mb-1">Tipografía</p>
                                    <p className="text-sm theme-font-heading">
                                        {restaurant.theme_font ?? 'Por defecto del tema'}
                                    </p>
                                </div>

                                <div className="theme-border border rounded-lg p-4">
                                    <p className="theme-text-muted text-xs mb-1">Tamaño de texto</p>
                                    <p className="text-sm">
                                        {restaurant.theme_font_size === 'sm' && 'Pequeño (14px)'}
                                        {restaurant.theme_font_size === 'md' && 'Normal (16px)'}
                                        {restaurant.theme_font_size === 'lg' && 'Grande (18px)'}
                                    </p>
                                </div>

                                <div className="theme-border border rounded-lg p-4">
                                    <p className="theme-text-muted text-xs mb-1">Target</p>
                                    <p className="text-sm">{theme.targetRestaurant}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sample menu items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'Avocado Toast', price: '€14.50', desc: 'Pan artesanal, aguacate, tomate cherry' },
                            { name: 'Salmon Bowl', price: '€18.90', desc: 'Salmón marinado, quinoa, edamame' },
                            { name: 'Burger Clásica', price: '€16.00', desc: 'Carne angus, queso cheddar, bacon' },
                            { name: 'Pasta Carbonara', price: '€15.50', desc: 'Receta tradicional italiana' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="theme-surface rounded-xl p-5 theme-shadow-sm hover:theme-shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="theme-font-heading font-bold text-lg">
                                        {item.name}
                                    </h3>
                                    <span
                                        className="theme-font-price font-bold text-lg"
                                        style={{ color: `rgb(var(--color-primary))` }}
                                    >
                                        {item.price}
                                    </span>
                                </div>
                                <p className="theme-text-secondary text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Floating cart button */}
                    <div className="fixed bottom-6 right-6">
                        <button
                            className="px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                            style={{
                                background: `rgb(var(--cart-bg))`,
                                color: `rgb(var(--cart-text))`,
                            }}
                        >
                            🛒 Ver carrito
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}
