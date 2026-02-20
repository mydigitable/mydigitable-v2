'use client'

import { useState, useEffect } from 'react'
import { CreateMenuModal } from './CreateMenuModal'
import { EditMenuModal } from './EditMenuModal'
import { getLocalizedText } from '@/lib/utils/i18n'
import { toggleMenuActive, deleteMenu } from '@/app/actions/menu'

// Menu Card Component
function MenuCard({ menu, isSelected, onSelect, onEdit, onRefresh, categoryCounts, productCounts }: any) {
    const [isToggling, setIsToggling] = useState(false)

    async function handleToggle(e: React.MouseEvent) {
        e.stopPropagation()
        setIsToggling(true)
        await toggleMenuActive(menu.id)
        await onRefresh()
        setIsToggling(false)
    }

    const categoryCount = categoryCounts?.[menu.id] || 0
    const productCount = productCounts?.[menu.id] || 0

    // Emoji based on menu type
    const getMenuEmoji = (type: string) => {
        switch (type) {
            case 'breakfast': return '🌅'
            case 'lunch': return '☀️'
            case 'dinner': return '🌙'
            case 'drinks': return '🍷'
            case 'desserts': return '🍰'
            default: return '🍽️'
        }
    }

    return (
        <div
            onClick={() => onSelect(menu)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                ? 'bg-green-50 border-green-500 shadow-md'
                : 'bg-white border-slate-200 hover:border-green-300 hover:shadow-sm'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Icon + Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Emoji Icon */}
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {getMenuEmoji(menu.type)}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-900 mb-1 truncate">
                            {menu.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {categoryCount} cat · {productCount} productos
                        </p>
                    </div>
                </div>

                {/* Toggle ON/OFF */}
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${menu.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                >
                    {menu.is_active ? 'ON' : 'OFF'}
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit(menu)
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                    ✏️ Editar
                </button>
                <button
                    onClick={async (e) => {
                        e.stopPropagation()
                        if (confirm('¿Eliminar este menú y todas sus categorías/productos?')) {
                            await deleteMenu(menu.id)
                            await onRefresh()
                        }
                    }}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                >
                    🗑️
                </button>
            </div>
        </div>
    )
}

export function MenuPanel({ menus, selectedMenu, onSelectMenu, onRefresh, restaurantId, categoryCounts, productCounts }: any) {
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingMenu, setEditingMenu] = useState<any>(null)

    // Use counts from props, not local state


    return (
        <>
            <div className="w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
                {/* Header */}
                <div className="p-4 bg-white border-b border-slate-200">
                    <h2 className="font-bold text-xs uppercase text-slate-600 tracking-wide mb-3">
                        Menús
                    </h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-sm transition-colors shadow-sm"
                    >
                        + Nuevo menú
                    </button>
                </div>

                {/* Lista de Menús */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {menus.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="text-5xl mb-3 opacity-50">📋</div>
                            <p className="text-sm text-slate-500 font-medium">Sin menús</p>
                            <p className="text-xs text-slate-400 mt-2">Crea tu primer menú</p>
                        </div>
                    ) : (
                        menus.map((menu: any) => (
                            <MenuCard
                                key={menu.id}
                                menu={menu}
                                isSelected={selectedMenu?.id === menu.id}
                                onSelect={onSelectMenu}
                                onEdit={(m: any) => {
                                    setEditingMenu(m)
                                    setShowEditModal(true)
                                }}
                                onRefresh={onRefresh}
                                categoryCounts={categoryCounts}
                                productCounts={productCounts}
                            />
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <CreateMenuModal
                    restaurantId={restaurantId}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false)
                        onRefresh()
                    }}
                />
            )}

            {showEditModal && editingMenu && (
                <EditMenuModal
                    menu={editingMenu}
                    restaurantId={restaurantId}
                    onClose={() => {
                        setShowEditModal(false)
                        setEditingMenu(null)
                    }}
                    onSuccess={() => {
                        setShowEditModal(false)
                        setEditingMenu(null)
                        onRefresh()
                    }}
                />
            )}
        </>
    )
}
