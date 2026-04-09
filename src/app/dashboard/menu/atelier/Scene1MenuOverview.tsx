'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CreateMenuPanel } from './CreateMenuPanel'
import { EditScheduleModal } from '../components/EditScheduleModal'
import { EditMenuNameScheduleModal } from '../components/EditMenuNameScheduleModal'
import { t, ensureArray } from '@/lib/utils/translation'

type Menu = {
    id: string
    name: string
    type: string
    is_active: boolean
    schedule: any
    restaurant_id: string
    display_order: number
    created_at: string
}

type Props = {
    restaurantId: string
    onSelectMenu: (menu: Menu) => void
}

const MENU_TYPES = [
    { id: 'general', label: 'General', emoji: '🍽️' },
    { id: 'breakfast', label: 'Desayunos', emoji: '🌅' },
    { id: 'lunch', label: 'Almuerzos', emoji: '☀️' },
    { id: 'dinner', label: 'Cenas', emoji: '🌙' },
    { id: 'tasting', label: 'Degustación', emoji: '✨' },
    { id: 'wine', label: 'Carta de vinos', emoji: '🍷' },
    { id: 'desserts', label: 'Postres', emoji: '🍰' },
    { id: 'seasonal', label: 'Temporada', emoji: '🍂' },
]

export function Scene1MenuOverview({ restaurantId, onSelectMenu }: Props) {
    const router = useRouter()
    const [menus, setMenus] = useState<Menu[]>([])
    const [showCreatePanel, setShowCreatePanel] = useState(false)
    const [editingScheduleMenu, setEditingScheduleMenu] = useState<Menu | null>(null)
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
    const [stats, setStats] = useState<Record<string, { categoryNames: string[]; products: number }>>({})
    const supabase = createClient()

    useEffect(() => {
        loadMenus()
    }, [restaurantId])

    async function loadMenus() {
        const { data } = await supabase
            .from('menus')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('display_order')

        if (data) {
            setMenus(data)
            await loadStats(data)
        }
    }

    async function loadStats(menuList: Menu[]) {
        const statsMap: Record<string, { categoryNames: string[]; products: number }> = {}

        for (const menu of menuList) {
            // Get category names
            const { data: cats } = await supabase
                .from('menu_categories')
                .select('id, name')
                .eq('menu_id', menu.id)
                .eq('restaurant_id', restaurantId)
                .order('display_order')

            const categoryNames = ensureArray(cats).map(c => t(c.name)).filter(name => name && name !== 'null' && name !== 'undefined')

            // Count products
            let productCount = 0
            if (cats && cats.length > 0) {
                for (const cat of cats) {
                    const { data: prods } = await supabase
                        .from('products')
                        .select('id')
                        .eq('category_id', cat.id)
                        .eq('restaurant_id', restaurantId)
                    productCount += prods?.length || 0
                }
            }

            statsMap[menu.id] = {
                categoryNames,
                products: productCount,
            }
        }

        setStats(statsMap)
    }

    async function handleToggleActive(menuId: string, currentState: boolean) {
        await supabase
            .from('menus')
            .update({ is_active: !currentState })
            .eq('id', menuId)

        await loadMenus()
    }

    async function handleDeleteMenu(menuId: string, menuName: any) {
        const name = t(menuName)
        if (!confirm(`¿Estás seguro de eliminar la carta "${name}"? Esta acción no se puede deshacer.`)) {
            return
        }

        // Delete menu (categories and products will cascade)
        await supabase
            .from('menus')
            .delete()
            .eq('id', menuId)

        await loadMenus()
    }

    function getMenuTypeLabel(type: string) {
        return MENU_TYPES.find(t => t.id === type)?.label || 'General'
    }

    function getMenuTypeEmoji(type: string) {
        return MENU_TYPES.find(t => t.id === type)?.emoji || '🍽️'
    }

    function getScheduleLabel(schedule: any): string {
        // Handle null or undefined
        if (!schedule) return 'Sin horario'

        // Handle new object format {monday: {enabled, start, end}, ...}
        if (typeof schedule === 'object' && !Array.isArray(schedule)) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            const enabledDays = days.filter(day => schedule[day]?.enabled)

            if (enabledDays.length === 0) return 'Cerrado'
            if (enabledDays.length === 7) {
                // All days enabled, check if same hours
                const firstDay = schedule[enabledDays[0]]
                const allSame = enabledDays.every(day =>
                    schedule[day].start === firstDay.start &&
                    schedule[day].end === firstDay.end
                )

                if (allSame) {
                    if (firstDay.start === '00:00' && firstDay.end === '23:59') {
                        return '24/7'
                    }
                    return `${firstDay.start}-${firstDay.end}`
                }
            }

            // Show first enabled day's hours
            const firstEnabledDay = schedule[enabledDays[0]]
            return `${firstEnabledDay.start}-${firstEnabledDay.end}`
        }

        // Legacy array format support
        if (Array.isArray(schedule) && schedule.length > 0) {
            const enabledDays = schedule.filter((d: any) => d.enabled)
            if (enabledDays.length === 0) return 'Inactivo'

            const firstDay = enabledDays[0]
            const allSame = enabledDays.every((d: any) =>
                d.open === firstDay.open && d.close === firstDay.close
            )

            if (allSame) {
                if (firstDay.open === '00:00' && firstDay.close === '23:59') {
                    return 'Todo el día'
                }
                return `${firstDay.open}-${firstDay.close}`
            }

            return `${enabledDays.length} horarios`
        }

        return 'Sin horario'
    }

    return (
        <>
            {/* Header */}
            <header className="flex-shrink-0 px-8 py-6" style={{ background: 'var(--atelier-surface2)', borderBottom: '1px solid var(--atelier-border)' }}>
                <div className="flex items-center justify-between">
                    <h1 className="font-sans text-4xl font-bold" style={{ color: 'var(--atelier-ink)' }}>
                        Gestión de Menús
                    </h1>
                    <button
                        onClick={() => setShowCreatePanel(true)}
                        className="atelier-btn-primary font-sans text-sm"
                    >
                        + Nueva carta
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
                {menus.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-8xl mb-6 opacity-30">🍽️</div>
                        <h2 className="font-sans text-2xl font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            No hay cartas creadas
                        </h2>
                        <p className="font-sans text-base mb-6" style={{ color: 'var(--atelier-ink2)' }}>
                            Comienza creando tu primera carta de menú
                        </p>
                        <button
                            onClick={() => setShowCreatePanel(true)}
                            className="atelier-btn-primary font-sans text-sm"
                        >
                            + Nueva carta
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                        {menus.map((menu, index) => {
                            const menuStats = stats[menu.id] || { categoryNames: [], products: 0 }
                            return (
                                <div
                                    key={menu.id}
                                    className="atelier-card atelier-grid-item overflow-hidden cursor-pointer"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => onSelectMenu(menu)}
                                >
                                    {/* Color strip */}
                                    <div className={menu.is_active ? 'atelier-strip-active' : 'atelier-strip-inactive'} />

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Header with toggle */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <p className="font-sans text-xs uppercase font-semibold tracking-wide mb-2" style={{ color: 'var(--atelier-ink3)' }}>
                                                    {getMenuTypeLabel(menu.type)}
                                                </p>
                                                <h3 className="font-sans text-2xl font-bold mb-1" style={{ color: 'var(--atelier-ink)' }}>
                                                    {t(menu.name)}
                                                </h3>
                                                {/* Schedule badge - clickable */}
                                                <div
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                                                    style={{ background: 'var(--atelier-accent-l)', border: '1px solid var(--atelier-accent)' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditingScheduleMenu(menu)
                                                    }}
                                                    title="Click para editar horarios"
                                                >
                                                    <span className="text-xs">🕐</span>
                                                    <span className="font-sans text-xs font-medium" style={{ color: 'var(--atelier-accent)' }}>
                                                        {getScheduleLabel(menu.schedule)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className={`atelier-toggle ${menu.is_active ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleToggleActive(menu.id, menu.is_active)
                                                }}
                                            >
                                                <div className="atelier-toggle-knob" />
                                            </div>
                                        </div>

                                        {/* Categories Preview - clickable */}
                                        <div
                                            className="mb-4 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                router.push(`/dashboard/menu/${menu.id}/categorias`)
                                            }}
                                            title="Click para gestionar categorías"
                                        >
                                            <p className="font-sans text-xs font-semibold mb-2" style={{ color: 'var(--atelier-ink2)' }}>
                                                Categorías ({menuStats.categoryNames.length})
                                            </p>
                                            {menuStats.categoryNames.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {menuStats.categoryNames.slice(0, 3).map((catName, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="font-sans text-xs px-2 py-1 rounded-full"
                                                            style={{ background: 'var(--atelier-accent-l)', color: 'var(--atelier-accent)' }}
                                                        >
                                                            {t(catName)}
                                                        </span>
                                                    ))}
                                                    {menuStats.categoryNames.length > 3 && (
                                                        <span
                                                            className="font-sans text-xs px-2 py-1 rounded-full"
                                                            style={{ background: 'var(--atelier-surface)', color: 'var(--atelier-ink3)' }}
                                                        >
                                                            +{menuStats.categoryNames.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="font-sans text-xs" style={{ color: 'var(--atelier-ink3)' }}>
                                                    Sin categorías
                                                </p>
                                            )}
                                        </div>

                                        {/* Products count - clickable */}
                                        <div
                                            className="mb-4 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                router.push(`/dashboard/menu/${menu.id}/productos`)
                                            }}
                                            title="Click para gestionar productos"
                                        >
                                            <p className="font-sans text-xs font-semibold" style={{ color: 'var(--atelier-ink2)' }}>
                                                {menuStats.products} productos
                                            </p>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="pt-4 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--atelier-border)' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingMenu(menu)
                                                }}
                                                className="font-sans text-sm font-medium inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
                                                style={{ color: 'var(--atelier-accent)' }}
                                            >
                                                Editar carta
                                                <span>→</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteMenu(menu.id, menu.name)
                                                }}
                                                className="font-sans text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:bg-red-50"
                                                style={{ color: 'var(--atelier-red)', border: '1px solid var(--atelier-red)' }}
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Create Menu Panel */}
            {showCreatePanel && (
                <CreateMenuPanel
                    restaurantId={restaurantId}
                    onClose={() => setShowCreatePanel(false)}
                    onSuccess={() => {
                        setShowCreatePanel(false)
                        loadMenus()
                    }}
                />
            )}

            {/* Edit Schedule Modal */}
            {editingScheduleMenu && (
                <EditScheduleModal
                    menuId={editingScheduleMenu.id}
                    menuName={t(editingScheduleMenu.name)}
                    onClose={() => setEditingScheduleMenu(null)}
                    onSuccess={() => {
                        setEditingScheduleMenu(null)
                        loadMenus()
                    }}
                />
            )}

            {/* Edit Menu Name & Schedule Modal */}
            {editingMenu && (
                <EditMenuNameScheduleModal
                    menuId={editingMenu.id}
                    menuName={t(editingMenu.name)}
                    onClose={() => setEditingMenu(null)}
                    onSuccess={() => {
                        setEditingMenu(null)
                        loadMenus()
                    }}
                />
            )}
        </>
    )
}
