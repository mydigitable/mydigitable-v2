'use client'

import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, GripVertical, Check, X, Loader2 } from 'lucide-react'
import { extractName } from '@/lib/utils'
import {
    createCategory,
    updateCategory,
    deleteCategory as deleteCategoryAction,
    toggleCategoryVisible,
} from '@/app/actions/menu'

export function StepCategories({ menu, categories, onCategoriesUpdate }: {
    menu: any
    categories: any[]
    onCategoriesUpdate: (cats: any[]) => void
}) {
    const [newCatName, setNewCatName] = useState('')
    const [creating, setCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [savingId, setSavingId] = useState<string | null>(null)

    const sortedCategories = [...categories].sort((a, b) =>
        (a.sort_order || a.display_order || 0) - (b.sort_order || b.display_order || 0)
    )

    async function handleCreate() {
        if (!newCatName.trim()) return
        setCreating(true)
        try {
            const result = await createCategory({
                menu_id: menu.id,
                name: newCatName.trim(),
                is_visible: true,
            })
            if (result.success && result.data) {
                onCategoriesUpdate([...categories, { ...result.data, products: [] }])
                setNewCatName('')
            } else {
                alert('Error: ' + (result as any).error)
            }
        } catch (err) {
            console.error('Error creating category:', err)
        }
        setCreating(false)
    }

    async function handleSaveEdit(catId: string) {
        if (!editName.trim()) return
        setSavingId(catId)
        try {
            const result = await updateCategory(catId, { name: editName.trim() })
            if (result.success) {
                onCategoriesUpdate(categories.map(c =>
                    c.id === catId ? { ...c, name: { es: editName.trim() } } : c
                ))
                setEditingId(null)
            }
        } catch (err) {
            console.error('Error updating category:', err)
        }
        setSavingId(null)
    }

    async function handleToggleVisible(catId: string) {
        setSavingId(catId)
        const result = await toggleCategoryVisible(catId)
        if (result.success) {
            onCategoriesUpdate(categories.map(c =>
                c.id === catId ? { ...c, is_visible: !c.is_visible } : c
            ))
        }
        setSavingId(null)
    }

    async function handleDelete(catId: string) {
        setSavingId(catId)
        const result = await deleteCategoryAction(catId)
        if (result.success) {
            onCategoriesUpdate(categories.filter(c => c.id !== catId))
        } else {
            alert('Error: ' + result.error)
        }
        setDeleteConfirm(null)
        setSavingId(null)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Categorías</h2>
                <p className="text-sm text-slate-500">
                    Organizá los productos de <strong>{menu.name}</strong> en categorías
                </p>
            </div>

            {/* Create new category */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nueva categoría..."
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button
                    onClick={handleCreate}
                    disabled={creating || !newCatName.trim()}
                    className="px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Añadir
                </button>
            </div>

            {/* Category List */}
            {sortedCategories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📂</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1 font-medium">Sin categorías aún</p>
                    <p className="text-xs text-slate-400">Creá la primera categoría para organizar los productos</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {sortedCategories.map((cat) => {
                        const name = extractName(cat.name)
                        const productCount = cat.products?.length || 0
                        const isEditing = editingId === cat.id
                        const isDeleting = deleteConfirm === cat.id

                        return (
                            <div
                                key={cat.id}
                                className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${cat.is_visible
                                        ? 'border-slate-200 bg-white hover:shadow-sm'
                                        : 'border-slate-100 bg-slate-50/50 opacity-70'
                                    }`}
                            >
                                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab flex-shrink-0" />

                                {isEditing ? (
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="flex-1 px-3 py-1.5 border border-primary rounded-lg text-sm focus:outline-none"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit(cat.id)
                                                if (e.key === 'Escape') setEditingId(null)
                                            }}
                                        />
                                        <button
                                            onClick={() => handleSaveEdit(cat.id)}
                                            className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg"
                                        >
                                            <Check className="w-4 h-4 text-green-600" />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg"
                                        >
                                            <X className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setEditingId(cat.id); setEditName(name) }}
                                            className="flex-1 text-left"
                                        >
                                            <span className="text-sm font-semibold text-slate-900">{name}</span>
                                            <span className="text-xs text-slate-400 ml-2">
                                                {productCount} producto{productCount !== 1 ? 's' : ''}
                                            </span>
                                        </button>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleToggleVisible(cat.id)}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg"
                                                title={cat.is_visible ? 'Ocultar' : 'Mostrar'}
                                            >
                                                {cat.is_visible
                                                    ? <Eye className="w-4 h-4 text-slate-400" />
                                                    : <EyeOff className="w-4 h-4 text-slate-400" />
                                                }
                                            </button>

                                            {isDeleting ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg"
                                                    >
                                                        <Check className="w-4 h-4 text-red-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg"
                                                    >
                                                        <X className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(cat.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}

                                {savingId === cat.id && (
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-400 flex-shrink-0" />
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
