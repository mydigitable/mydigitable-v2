'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import {
    getProductExtrasComplete,
    createProductExtra,
    createProductExtraGroup,
    updateProductExtra,
    updateProductExtraGroup,
    deleteProductExtra,
    deleteProductExtraGroup,
    type ProductExtra,
    type ProductExtraGroup,
} from '@/app/actions/product-extras'

interface ProductExtrasEditorProps {
    productId: string
    onUpdate?: () => void
}

type TabType = 'simple' | 'groups' | 'cooking'

export function ProductExtrasEditor({ productId, onUpdate }: ProductExtrasEditorProps) {
    const [activeTab, setActiveTab] = useState<TabType>('simple')
    const [standaloneExtras, setStandaloneExtras] = useState<any[]>([])
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadExtras()
    }, [productId])

    async function loadExtras() {
        setLoading(true)
        const data = await getProductExtrasComplete(productId)
        setStandaloneExtras(data.standaloneExtras)
        setGroups(data.groups)
        setLoading(false)
    }

    async function handleAddSimpleExtra() {
        const extra: ProductExtra = {
            product_id: productId,
            name: { es: 'Nuevo extra' },
            price: 0,
            type: 'addon',
        }
        await createProductExtra(extra)
        await loadExtras()
        onUpdate?.()
    }

    async function handleAddGroup() {
        const group: ProductExtraGroup = {
            product_id: productId,
            name: { es: 'Nuevo grupo' },
            min_selections: 0,
            max_selections: 1,
        }
        const created = await createProductExtraGroup(group)
        await loadExtras()
        onUpdate?.()
    }

    async function handleAddCookingPoint() {
        const extra: ProductExtra = {
            product_id: productId,
            name: { es: 'Poco hecho' },
            price: 0,
            type: 'cooking_point',
        }
        await createProductExtra(extra)
        await loadExtras()
        onUpdate?.()
    }

    async function handleDeleteExtra(extraId: string) {
        if (!confirm('¿Eliminar este extra?')) return
        await deleteProductExtra(extraId)
        await loadExtras()
        onUpdate?.()
    }

    async function handleDeleteGroup(groupId: string) {
        if (!confirm('¿Eliminar este grupo y todos sus extras?')) return
        await deleteProductExtraGroup(groupId)
        await loadExtras()
        onUpdate?.()
    }

    if (loading) {
        return <div className="text-sm text-gray-500">Cargando extras...</div>
    }

    const simpleExtras = standaloneExtras.filter(e => e.type === 'addon' || e.type === 'modifier')
    const cookingPoints = standaloneExtras.filter(e => e.type === 'cooking_point')

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('simple')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'simple'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Extras Simples ({simpleExtras.length})
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'groups'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Grupos de Opciones ({groups.length})
                </button>
                <button
                    onClick={() => setActiveTab('cooking')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'cooking'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Puntos de Cocción ({cookingPoints.length})
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[200px]">
                {/* Simple Extras Tab */}
                {activeTab === 'simple' && (
                    <div className="space-y-2">
                        {simpleExtras.map((extra) => (
                            <div
                                key={extra.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                <input
                                    type="text"
                                    value={extra.name?.es || ''}
                                    onChange={async (e) => {
                                        await updateProductExtra(extra.id, {
                                            name: { es: e.target.value }
                                        })
                                        await loadExtras()
                                    }}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                    placeholder="Nombre del extra"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">€</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={extra.price || 0}
                                        onChange={async (e) => {
                                            await updateProductExtra(extra.id, {
                                                price: parseFloat(e.target.value) || 0
                                            })
                                            await loadExtras()
                                        }}
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                    />
                                </div>
                                <select
                                    value={extra.type}
                                    onChange={async (e) => {
                                        await updateProductExtra(extra.id, {
                                            type: e.target.value as any
                                        })
                                        await loadExtras()
                                    }}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded"
                                >
                                    <option value="addon">Extra</option>
                                    <option value="modifier">Modificador</option>
                                </select>
                                <button
                                    onClick={() => handleDeleteExtra(extra.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={handleAddSimpleExtra}
                            className="w-full px-4 py-2 text-sm text-green-600 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            Añadir extra simple
                        </button>
                    </div>
                )}

                {/* Option Groups Tab */}
                {activeTab === 'groups' && (
                    <div className="space-y-4">
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={group.name?.es || ''}
                                        onChange={async (e) => {
                                            await updateProductExtraGroup(group.id, {
                                                name: { es: e.target.value }
                                            })
                                            await loadExtras()
                                        }}
                                        className="flex-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded"
                                        placeholder="Nombre del grupo (ej: Elige tu proteína)"
                                    />
                                    <button
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex gap-4 text-xs">
                                    <label className="flex items-center gap-2">
                                        <span className="text-gray-600">Mín:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={group.min_selections || 0}
                                            onChange={async (e) => {
                                                await updateProductExtraGroup(group.id, {
                                                    min_selections: parseInt(e.target.value) || 0
                                                })
                                                await loadExtras()
                                            }}
                                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                                        />
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <span className="text-gray-600">Máx:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={group.max_selections || 1}
                                            onChange={async (e) => {
                                                await updateProductExtraGroup(group.id, {
                                                    max_selections: parseInt(e.target.value) || 1
                                                })
                                                await loadExtras()
                                            }}
                                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                                        />
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={group.is_required || false}
                                            onChange={async (e) => {
                                                await updateProductExtraGroup(group.id, {
                                                    is_required: e.target.checked
                                                })
                                                await loadExtras()
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-gray-600">Obligatorio</span>
                                    </label>
                                </div>

                                {/* Options in this group */}
                                <div className="space-y-2 pl-4 border-l-2 border-green-200">
                                    {group.extras?.map((extra: any) => (
                                        <div key={extra.id} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={extra.name?.es || ''}
                                                onChange={async (e) => {
                                                    await updateProductExtra(extra.id, {
                                                        name: { es: e.target.value }
                                                    })
                                                    await loadExtras()
                                                }}
                                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                                placeholder="Opción"
                                            />
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-500">€</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={extra.price || 0}
                                                    onChange={async (e) => {
                                                        await updateProductExtra(extra.id, {
                                                            price: parseFloat(e.target.value) || 0
                                                        })
                                                        await loadExtras()
                                                    }}
                                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleDeleteExtra(extra.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={async () => {
                                            await createProductExtra({
                                                product_id: productId,
                                                group_id: group.id,
                                                name: { es: 'Nueva opción' },
                                                price: 0,
                                                type: 'option',
                                            })
                                            await loadExtras()
                                        }}
                                        className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                                    >
                                        <Plus size={14} />
                                        Añadir opción
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleAddGroup}
                            className="w-full px-4 py-2 text-sm text-green-600 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            Añadir grupo de opciones
                        </button>
                    </div>
                )}

                {/* Cooking Points Tab */}
                {activeTab === 'cooking' && (
                    <div className="space-y-2">
                        {cookingPoints.map((point) => (
                            <div
                                key={point.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                <input
                                    type="text"
                                    value={point.name?.es || ''}
                                    onChange={async (e) => {
                                        await updateProductExtra(point.id, {
                                            name: { es: e.target.value }
                                        })
                                        await loadExtras()
                                    }}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                    placeholder="Punto de cocción"
                                />
                                <button
                                    onClick={() => handleDeleteExtra(point.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {cookingPoints.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No hay puntos de cocción definidos
                            </div>
                        )}

                        <button
                            onClick={handleAddCookingPoint}
                            className="w-full px-4 py-2 text-sm text-green-600 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            Añadir punto de cocción
                        </button>

                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700">
                                💡 <strong>Sugerencias:</strong> Poco hecho, Al punto, Bien hecho, Muy hecho
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
