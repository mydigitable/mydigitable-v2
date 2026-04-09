'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CreateCategoryPanel } from '../../atelier/CreateCategoryPanel'
import { EditCategoryModal } from '../../components/EditCategoryModal'
import { Pencil, Trash2, ChevronDown } from 'lucide-react'
import { t } from '@/lib/utils/translation'

type Category = {
    id: string
    name: string | { es: string; en?: string }
    description?: string | { es: string; en?: string }
    visible: boolean
    display_order: number
}

export default function CategoriasPage() {
    const params = useParams()
    const router = useRouter()
    const menuId = params?.menuId as string
    const supabase = createClient()

    const [categories, setCategories] = useState<Category[]>([])
    const [restaurantId, setRestaurantId] = useState<string>('')
    const [menus, setMenus] = useState<any[]>([])
    const [currentMenu, setCurrentMenu] = useState<any>(null)
    const [showCreatePanel, setShowCreatePanel] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadRestaurantAndCategories()
    }, [menuId])

    async function loadRestaurantAndCategories() {
        // Get restaurant ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (restaurant) {
            setRestaurantId(restaurant.id)
            await Promise.all([
                loadCategories(restaurant.id),
                loadMenus(restaurant.id)
            ])
        }
    }

    async function loadMenus(restId: string) {
        const { data } = await supabase
            .from('menus')
            .select('*')
            .eq('restaurant_id', restId)
            .order('display_order')

        if (data) {
            setMenus(data)
            const current = data.find(m => m.id === menuId)
            setCurrentMenu(current)
        }
    }

    async function loadCategories(restId: string) {
        const { data } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('menu_id', menuId)
            .eq('restaurant_id', restId)
            .order('display_order')

        setCategories(data || [])
        setLoading(false)
    }

    async function handleDeleteCategory(categoryId: string, categoryName: string) {
        if (!confirm(`¿Eliminar la categoría "${categoryName}" y todos sus productos?`)) return

        const { error } = await supabase.from('menu_categories').delete().eq('id', categoryId)
        if (!error) {
            loadCategories(restaurantId)
        }
    }

    async function handleToggleVisible(categoryId: string, currentState: boolean) {
        await supabase
            .from('menu_categories')
            .update({ visible: !currentState })
            .eq('id', categoryId)
        loadCategories(restaurantId)
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-600">Cargando categorías...</p>
            </div>
        )
    }

    return (
        <>
            <div className="h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Organiza tus productos en categorías
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreatePanel(true)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                            + Nueva categoría
                        </button>
                    </div>

                    {/* Categories List */}
                    {categories.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <div className="text-6xl mb-4">📂</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Sin categorías
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Crea tu primera categoría para empezar a organizar productos
                            </p>
                            <button
                                onClick={() => setShowCreatePanel(true)}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            >
                                + Nueva categoría
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {t(category.name)}
                                                </h3>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.visible
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    {category.visible ? 'Visible' : 'Oculta'}
                                                </span>
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-gray-600">
                                                    {t(category.description)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingCategory(category)}
                                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleVisible(category.id, category.visible)}
                                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                title={category.visible ? 'Ocultar' : 'Mostrar'}
                                            >
                                                {category.visible ? '👁️' : '👁️‍🗨️'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id, t(category.name))}
                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showCreatePanel && (
                <CreateCategoryPanel
                    menuId={menuId}
                    restaurantId={restaurantId}
                    onClose={() => setShowCreatePanel(false)}
                    onSuccess={() => {
                        setShowCreatePanel(false)
                        loadCategories(restaurantId)
                    }}
                />
            )}

            {editingCategory && (
                <EditCategoryModal
                    category={editingCategory}
                    menuId={menuId}
                    restaurantId={restaurantId}
                    onClose={() => setEditingCategory(null)}
                    onSuccess={() => {
                        setEditingCategory(null)
                        loadCategories(restaurantId)
                    }}
                />
            )}
        </>
    )
}
