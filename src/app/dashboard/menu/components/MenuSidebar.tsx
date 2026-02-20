'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, GripVertical } from 'lucide-react'

export function MenuSidebar({ menus, selection, onSelect, designConfig }: any) {
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
        new Set(menus.map((m: any) => m.id))
    )

    function toggleMenu(menuId: string) {
        const newExpanded = new Set(expandedMenus)
        if (newExpanded.has(menuId)) {
            newExpanded.delete(menuId)
        } else {
            newExpanded.add(menuId)
        }
        setExpandedMenus(newExpanded)
    }

    return (
        <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
            {/* Quick Tabs */}
            <div className="p-4 border-b border-slate-200 space-y-1">
                <button
                    onClick={() => onSelect({ type: 'design' })}
                    className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
            ${selection.type === 'design'
                            ? 'bg-purple-50 text-purple-600 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }
          `}
                >
                    <span className="text-lg">🎨</span>
                    <span>Diseño y Temas</span>
                </button>
            </div>

            {/* Menu Structure */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Estructura del Menú
                    </h3>
                    <button
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Nuevo menú"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-1">
                    {menus.map((menu: any) => {
                        const isExpanded = expandedMenus.has(menu.id)
                        const isSelected = selection.type === 'menu' && selection.menuId === menu.id

                        return (
                            <div key={menu.id}>
                                {/* Menu Header */}
                                <div
                                    className={`
                    group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'}
                  `}
                                >
                                    <button
                                        onClick={() => toggleMenu(menu.id)}
                                        className="p-0.5 hover:bg-slate-200 rounded"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>

                                    <span className="text-lg">{menu.icon || '📋'}</span>

                                    <button
                                        onClick={() => onSelect({ type: 'menu', menuId: menu.id })}
                                        className="flex-1 text-left text-sm font-medium"
                                    >
                                        {menu.name}
                                    </button>

                                    <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                                </div>

                                {/* Categories */}
                                {isExpanded && menu.categories && (
                                    <div className="ml-8 mt-1 space-y-0.5">
                                        {menu.categories.map((category: any) => {
                                            const isCatSelected = selection.type === 'category' && selection.categoryId === category.id
                                            const productCount = category.products?.length || 0

                                            return (
                                                <button
                                                    key={category.id}
                                                    onClick={() => onSelect({
                                                        type: 'category',
                                                        categoryId: category.id,
                                                        menuId: menu.id,
                                                    })}
                                                    className={`
                            w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
                            ${isCatSelected
                                                            ? 'bg-green-50 text-green-900 font-medium'
                                                            : 'text-slate-600 hover:bg-slate-50'
                                                        }
                          `}
                                                >
                                                    <span>{category.name}</span>
                                                    <span className="text-xs text-slate-400">
                                                        {productCount}
                                                    </span>
                                                </button>
                                            )
                                        })}

                                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all">
                                            <Plus className="w-3 h-3" />
                                            <span>Nueva categoría</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700 transition-all">
                    <Plus className="w-4 h-4" />
                    Nuevo Menú
                </button>
            </div>
        </div>
    )
}
