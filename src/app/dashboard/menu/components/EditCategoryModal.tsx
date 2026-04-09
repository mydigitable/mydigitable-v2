'use client'

import { useState } from 'react'
import { updateCategory } from '@/app/actions/menu'
import { getLocalizedText } from '@/lib/utils/i18n'

export function EditCategoryModal({ category, menuId, restaurantId, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: getLocalizedText(category.name) || '',
        description: getLocalizedText(category.description) || '',
        is_visible: category.is_visible ?? true
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const result = await updateCategory(category.id, {
            name: formData.name,
            description: formData.description || null,
            is_visible: formData.is_visible
        })

        if (result.success) {
            onSuccess()
        } else {
            alert('Error: ' + result.error)
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Editar Categoría</h2>

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
                            placeholder="Ej: Entrantes, Principales, Postres..."
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
                            Categoría visible en el menú
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
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                        >
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
