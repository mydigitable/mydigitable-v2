'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { updateMenu } from '@/app/actions/menu'
import { updateDesignConfig, publishDesign } from '@/app/actions/design'
import { MenuMobilePreview } from '@/components/shared/MenuMobilePreview'
import { StepInfo } from './steps/StepInfo'
import { StepCategories } from './steps/StepCategories'
import { StepProducts } from './steps/StepProducts'
import { StepDesign } from './steps/StepDesign'

const STEPS = [
    { id: 1, label: 'Info', icon: '📋' },
    { id: 2, label: 'Categorías', icon: '📂' },
    { id: 3, label: 'Productos', icon: '🍽️' },
    { id: 4, label: 'Diseño', icon: '🎨' },
]

export function MenuWizard({ restaurant, menu: initialMenu, designConfig: initialConfig, themes }: any) {
    const router = useRouter()
    const [menu, setMenu] = useState(initialMenu)
    const [categories, setCategories] = useState(initialMenu.categories || [])
    const [designConfig, setDesignConfig] = useState(initialConfig)
    const [step, setStep] = useState(1)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [publishing, setPublishing] = useState(false)
    const isFirstRender = useRef(true)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Build preview data: wrap this single menu as an array for MenuMobilePreview
    const previewMenus = [{
        ...menu,
        categories: categories.map((cat: any) => ({
            ...cat,
            products: cat.products || [],
        })),
    }]

    // Autosave menu changes (debounced)
    const autoSaveMenu = useCallback(async (menuData: any) => {
        setSaving(true)
        try {
            const result = await updateMenu(menuData.id, {
                name: menuData.name,
                type: menuData.type,
                schedule_type: menuData.schedule_type,
                start_time: menuData.start_time,
                end_time: menuData.end_time,
                schedule: menuData.schedule,
                is_active: menuData.is_active,
            })
            if (result.success) {
                setLastSaved(new Date())
            }
        } catch (err) {
            console.error('Error auto-saving menu:', err)
        }
        setSaving(false)
    }, [])

    // Debounced menu save
    const handleMenuChange = useCallback((updatedMenu: any) => {
        setMenu(updatedMenu)
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => {
            autoSaveMenu(updatedMenu)
        }, 1500)
    }, [autoSaveMenu])

    // Autosave design config
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        if (!designConfig) return
        const timer = setTimeout(async () => {
            setSaving(true)
            try {
                const result = await updateDesignConfig(designConfig)
                if (result.success) setLastSaved(new Date())
            } catch (err) {
                console.error('Error saving design config:', err)
            }
            setSaving(false)
        }, 1500)
        return () => clearTimeout(timer)
    }, [designConfig])

    // Cleanup
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        }
    }, [])

    async function handlePublish() {
        if (!confirm('¿Publicar cambios? Los clientes verán el nuevo diseño inmediatamente.')) return
        setPublishing(true)
        try {
            if (designConfig) await updateDesignConfig(designConfig)
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

    // When categories are updated (from StepCategories or StepProducts)
    const handleCategoriesUpdate = useCallback((updatedCategories: any[]) => {
        setCategories(updatedCategories)
    }, [])

    const renderStep = () => {
        switch (step) {
            case 1:
                return <StepInfo menu={menu} onMenuChange={handleMenuChange} />
            case 2:
                return (
                    <StepCategories
                        menu={menu}
                        categories={categories}
                        onCategoriesUpdate={handleCategoriesUpdate}
                    />
                )
            case 3:
                return (
                    <StepProducts
                        menu={menu}
                        categories={categories}
                        onCategoriesUpdate={handleCategoriesUpdate}
                    />
                )
            case 4:
                return (
                    <StepDesign
                        designConfig={designConfig}
                        themes={themes}
                        onDesignUpdate={setDesignConfig}
                        onPublish={handlePublish}
                        publishing={publishing}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
            {/* Top Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/menu/menus')}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a menús
                    </button>
                    <div className="w-px h-6 bg-slate-200" />
                    <h1 className="text-lg font-bold text-slate-900">{menu.name}</h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Save Status */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        {saving ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Guardando...
                            </>
                        ) : lastSaved ? (
                            <>
                                <Check className="w-3 h-3 text-green-500" />
                                Guardado {lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex-shrink-0">
                <div className="flex items-center gap-1 max-w-2xl mx-auto">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center flex-1">
                            <button
                                onClick={() => setStep(s.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium w-full justify-center
                                    ${step === s.id
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }
                                `}
                            >
                                <span className="text-base">{s.icon}</span>
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className="w-4 h-px bg-slate-200 mx-1 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content — 2 Columns */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left — Wizard Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-2xl mx-auto p-6">
                        {renderStep()}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                            <button
                                onClick={() => setStep(Math.max(1, step - 1))}
                                disabled={step === 1}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${step === 1
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                ← Anterior
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={() => setStep(Math.min(4, step + 1))}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                                >
                                    Siguiente →
                                </button>
                            ) : (
                                <button
                                    onClick={handlePublish}
                                    disabled={publishing}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                                >
                                    {publishing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Publicando...
                                        </>
                                    ) : (
                                        '🚀 Publicar Menú'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — Preview */}
                <div className="w-[380px] bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 border-l border-slate-200 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent" />

                    <div className="relative z-10">
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg whitespace-nowrap">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Vista previa en vivo
                        </div>

                        <MenuMobilePreview
                            restaurant={restaurant}
                            menus={previewMenus}
                            designConfig={designConfig}
                            className="scale-[0.75]"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
