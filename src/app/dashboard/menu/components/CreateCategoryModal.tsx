'use client'

import { useState, useEffect } from 'react'
import { createCategory, createCategoryInMultipleMenus } from '@/app/actions/menu'
import { createClient } from '@/lib/supabase/client'

export function CreateCategoryModal({ menuId, restaurantId, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false)
    const [allMenus, setAllMenus] = useState<any[]>([])
    const [selectedMenus, setSelectedMenus] = useState<string[]>([menuId])
    const [showMultiMenu, setShowMultiMenu] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_visible: true
    })

    useEffect(() => {
        loadMenus()
    }, [restaurantId])

    async function loadMenus() {
        if (!restaurantId) return
        const supabase = createClient()
        const { data } = await supabase
            .from('menus')
            .select('id, name, emoji')
            .eq('restaurant_id', restaurantId)
            .order('display_order')

        if (data) {
            setAllMenus(data)
        }
    }

    function toggleMenu(id: string) {
        setSelectedMenus(prev =>
            prev.includes(id)
                ? prev.filter(m => m !== id)
                : [...prev, id]
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!menuId && selectedMenus.length === 0) {
            alert('Error: Debes seleccionar al menos un menú')
            return
        }

        setLoading(true)

        // Si solo hay un menú seleccionado, usar la función simple
        if (selectedMenus.length === 1 || !showMultiMenu) {
            const result = await createCategory({
                ...formData,
                menu_id: menuId
            })

            if (result.success) {
                onSuccess()
            } else {
                alert('Error: ' + (result.error || JSON.stringify(result)))
            }
        } else {
            // Multi-menu creation
            const result = await createCategoryInMultipleMenus(selectedMenus, formData)

            if (result.success) {
                onSuccess()
            } else {
                alert('Error: ' + (result.error || JSON.stringify(result)))
            }
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Nueva Categoría</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                            Nombre de la categoría *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Ej: Entrantes, Platos principales, Postres..."
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                            rows={3}
                            placeholder="Describe esta categoría..."
                        />
                    </div>

                    {/* Multi-Menu Selection */}
                    {allMenus.length > 1 && (
                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-slate-700">
                                    Compartir con otros menús
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowMultiMenu(!showMultiMenu)}
                                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                                >
                                    {showMultiMenu ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>

                            {showMultiMenu && (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {allMenus.map(menu => (
                                        <label
                                            key={menu.id}
                                            className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMenus.includes(menu.id)}
                                                onChange={() => toggleMenu(menu.id)}
                                                className="w-4 h-4 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                                            />
                                            <span className="text-sm">
                                                {menu.emoji} {menu.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {showMultiMenu && selectedMenus.length > 0 && (
                                <p className="text-xs text-slate-500 mt-2">
                                    {selectedMenus.length} menú(s) seleccionado(s)
                                </p>
                            )}
                        </div>
                    )}

                    {/* Visibilidad */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="is_visible"
                            checked={formData.is_visible}
                            onChange={e => setFormData({ ...formData, is_visible: e.target.checked })}
                            className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <label htmlFor="is_visible" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Hacer visible a los clientes
                        </label>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (showMultiMenu && selectedMenus.length === 0)}
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                        >
                            {loading ? 'Creando...' : 'Crear categoría'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
