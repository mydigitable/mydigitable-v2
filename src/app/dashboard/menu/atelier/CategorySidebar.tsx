'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreateCategoryPanel } from './CreateCategoryPanel'
import { t } from '@/lib/utils/translation'

type Menu = {
    id: string
    name: string
}

type Category = {
    id: string
    name: string
    description?: string
    visible: boolean
}

type Props = {
    menu: Menu
    categories: Category[]
    selectedCategory: Category | null
    onSelectCategory: (category: Category) => void
    onCategoryCreated: () => void
    onCategoryDeleted: () => void
    onBack: () => void
    restaurantId: string
}

export function CategorySidebar({
    menu,
    categories,
    selectedCategory,
    onSelectCategory,
    onCategoryCreated,
    onCategoryDeleted,
    onBack,
    restaurantId,
}: Props) {
    const [showCreatePanel, setShowCreatePanel] = useState(false)
    const supabase = createClient()

    async function handleDeleteCategory(categoryId: string) {
        if (!confirm('¿Eliminar esta categoría y todos sus productos?')) return

        const { error } = await supabase.from('menu_categories').delete().eq('id', categoryId)
        if (!error) {
            onCategoryDeleted()
        }
    }

    return (
        <>
            <div
                className="flex-shrink-0 flex flex-col"
                style={{
                    width: '240px',
                    background: 'var(--atelier-surface2)',
                    borderRight: '1px solid var(--atelier-border)',
                }}
            >
                {/* Back button */}
                <div className="p-4" style={{ borderBottom: '1px solid var(--atelier-border)' }}>
                    <button
                        onClick={onBack}
                        className="atelier-sans flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--atelier-ink2)' }}
                    >
                        <span>←</span>
                        Todas las cartas
                    </button>
                </div>

                {/* Menu name */}
                <div className="px-4 py-6" style={{ borderBottom: '1px solid var(--atelier-border)' }}>
                    <h2 className="atelier-serif text-xl font-bold" style={{ color: 'var(--atelier-ink)' }}>
                        {t(menu.name)}
                    </h2>
                </div>

                {/* Categories list */}
                <div className="flex-1 overflow-y-auto p-3">
                    {categories.length === 0 ? (
                        <div className="text-center py-8 px-3">
                            <p className="atelier-sans text-sm" style={{ color: 'var(--atelier-ink3)' }}>
                                Sin categorías
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="group relative"
                                >
                                    <button
                                        onClick={() => onSelectCategory(category)}
                                        className="atelier-sans w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                                        style={{
                                            background:
                                                selectedCategory?.id === category.id
                                                    ? 'var(--atelier-accent-l)'
                                                    : 'transparent',
                                            color:
                                                selectedCategory?.id === category.id
                                                    ? 'var(--atelier-accent)'
                                                    : 'var(--atelier-ink)',
                                        }}
                                    >
                                        {t(category.name)}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center hover:bg-red-100 transition-all"
                                        style={{ color: 'var(--atelier-red)' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add category button */}
                <div className="p-3" style={{ borderTop: '1px solid var(--atelier-border)' }}>
                    <button
                        onClick={() => setShowCreatePanel(true)}
                        className="atelier-sans w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                        style={{
                            background: 'var(--atelier-accent)',
                            color: 'white',
                        }}
                    >
                        + Nueva categoría
                    </button>
                </div>
            </div>

            {showCreatePanel && (
                <CreateCategoryPanel
                    menuId={menu.id}
                    restaurantId={restaurantId}
                    onClose={() => setShowCreatePanel(false)}
                    onSuccess={() => {
                        setShowCreatePanel(false)
                        onCategoryCreated()
                    }}
                />
            )}
        </>
    )
}
