'use client'

import { useState, useEffect, useRef } from 'react'
import { MenuSidebar } from './MenuSidebar'
import { MenuMobilePreview } from '@/components/shared/MenuMobilePreview'
import { ActionPanel } from './ActionPanel'
import { updateDesignConfig, publishDesign } from '@/app/actions/design'

export type SelectionType =
    | { type: 'none' }
    | { type: 'design' }
    | { type: 'menu'; menuId: string }
    | { type: 'category'; categoryId: string; menuId: string }
    | { type: 'product'; productId: string; categoryId: string }

export function UnifiedMenuManager({
    restaurant,
    menus: initialMenus,
    designConfig: initialConfig,
    themes,
}: any) {
    const [menus, setMenus] = useState(initialMenus)
    const [designConfig, setDesignConfig] = useState(initialConfig)
    const [selection, setSelection] = useState<SelectionType>({ type: 'none' })
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const isFirstRender = useRef(true)

    // Auto-save design config (skip first render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        const timer = setTimeout(() => {
            handleSave(true)
        }, 1500)
        return () => clearTimeout(timer)
    }, [designConfig])

    async function handleSave(silent = false) {
        if (!designConfig) return
        setSaving(true)
        try {
            const result = await updateDesignConfig(designConfig)
            if (result.success) {
                setLastSaved(new Date())
            }
        } catch (err) {
            console.error('Error saving design config:', err)
        }
        setSaving(false)
    }

    async function handlePublish() {
        if (!confirm('¿Publicar cambios? Los clientes verán el nuevo diseño inmediatamente.')) {
            return
        }

        setPublishing(true)
        try {
            if (designConfig) {
                await updateDesignConfig(designConfig)
            }
            const result = await publishDesign()

            if (result.success) {
                alert('🚀 ¡Menú publicado!')
            } else {
                alert('❌ Error: ' + result.error)
            }
        } catch (err) {
            console.error('Error publishing:', err)
            alert('❌ Error al publicar')
        }
        setPublishing(false)
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <span className="text-white text-xl">🍽️</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Mi Menú Digital</h1>
                            <p className="text-xs text-slate-500">{restaurant.name}</p>
                        </div>
                    </div>

                    {saving && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            Guardando...
                        </div>
                    )}

                    {lastSaved && !saving && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                            <span>✓</span>
                            Guardado {lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>

                <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 font-semibold text-sm transition-all shadow-lg shadow-green-500/30"
                >
                    {publishing ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Publicando...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            🚀 Publicar
                        </span>
                    )}
                </button>
            </div>

            {/* Main Content - 3 Columns */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <MenuSidebar
                    menus={menus}
                    selection={selection}
                    onSelect={setSelection}
                    designConfig={designConfig}
                />

                {/* Center - Preview */}
                <div className="flex-1 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent" />

                    <div className="relative z-10">
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg whitespace-nowrap">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Vista previa en vivo
                        </div>

                        <MenuMobilePreview
                            restaurant={restaurant}
                            menus={menus}
                            designConfig={designConfig}
                            className="scale-[0.85]"
                        />
                    </div>
                </div>

                {/* Right Panel - Contextual Actions */}
                <ActionPanel
                    selection={selection}
                    menus={menus}
                    designConfig={designConfig}
                    themes={themes}
                    onMenusUpdate={setMenus}
                    onDesignUpdate={setDesignConfig}
                />
            </div>
        </div>
    )
}
