'use client'

import { useState, useRef, useEffect } from 'react'
import { createProductPro, updateProductPro } from '@/app/actions/products'
import { createClient } from '@/lib/supabase/client'
import { Plus, Minus, Trash2, Sparkles, Upload, X, Search } from 'lucide-react'

// ============================================
// Interfaces
// ============================================
interface ProductData {
    id?: string
    category_id: string
    name?: any
    name_es?: string
    description?: any
    description_es?: string | null
    price: number
    image_url?: string | null
    allergens?: string[] | null
    dietary_tags?: string[] | null
    prep_time_minutes?: number | null
    show_prep_time?: boolean
    extras?: any
    options?: any
    metadata?: any
}

interface CategoryData {
    id: string
    name_es?: string
    name?: any
}

interface Props {
    categoryId: string
    categoryName?: string
    categories?: CategoryData[]
    allProducts?: ProductData[]
    product?: ProductData | null  // If provided, edit mode
    onClose: () => void
    onSuccess: () => void
}

// ============================================
// Constants
// ============================================
const ALLERGEN_OPTIONS = [
    { id: 'gluten', label: 'Gluten', emoji: '🌾' },
    { id: 'lacteos', label: 'Lácteos', emoji: '🥛' },
    { id: 'huevos', label: 'Huevos', emoji: '🥚' },
    { id: 'pescado', label: 'Pescado', emoji: '🐟' },
    { id: 'marisco', label: 'Marisco', emoji: '🦐' },
    { id: 'frutos_secos', label: 'Frutos secos', emoji: '🥜' },
    { id: 'soja', label: 'Soja', emoji: '🫘' },
    { id: 'apio', label: 'Apio', emoji: '🥬' },
    { id: 'mostaza', label: 'Mostaza', emoji: '🟡' },
    { id: 'sesamo', label: 'Sésamo', emoji: '⚪' },
    { id: 'sulfitos', label: 'Sulfitos', emoji: '🍇' },
]

const TAG_OPTIONS = [
    { id: 'vegan', label: 'Vegano', emoji: '🌱' },
    { id: 'vegetarian', label: 'Vegetariano', emoji: '🥬' },
    { id: 'gluten_free', label: 'Sin gluten', emoji: '🚫🌾' },
    { id: 'lactose_free', label: 'Sin lactosa', emoji: '🚫🥛' },
    { id: 'spicy', label: 'Picante', emoji: '🌶️' },
    { id: 'organic', label: 'Orgánico', emoji: '🌿' },
]

const EXTRA_TEMPLATES = [
    {
        name: '📏 Porciones / Tamaños',
        description: 'Media, Entera, Familiar...',
        grupo: 'Porción',
        max_selecciones: 1,
        opciones: [
            { nombre: 'Media ración', precio: 0 },
            { nombre: 'Ración entera', precio: 3 },
            { nombre: 'Familiar', precio: 6 },
        ]
    },
    {
        name: '🥗 Guarniciones',
        description: 'Patatas, Ensalada, Arroz...',
        grupo: 'Guarnición',
        max_selecciones: 2,
        opciones: [
            { nombre: 'Patatas fritas', precio: 0 },
            { nombre: 'Ensalada', precio: 0 },
            { nombre: 'Arroz', precio: 0 },
            { nombre: 'Verduras a la plancha', precio: 1.50 },
        ]
    },
    {
        name: '🧀 Ingredientes Extra',
        description: 'Queso, Bacon, Huevo...',
        grupo: 'Extras',
        max_selecciones: 5,
        opciones: [
            { nombre: 'Queso extra', precio: 1.50 },
            { nombre: 'Bacon', precio: 1.50 },
            { nombre: 'Huevo frito', precio: 1.00 },
            { nombre: 'Aguacate', precio: 2.00 },
        ]
    },
    {
        name: '🥤 Bebida incluida',
        description: 'Elige tu bebida',
        grupo: 'Bebida',
        max_selecciones: 1,
        opciones: [
            { nombre: 'Agua', precio: 0 },
            { nombre: 'Refresco', precio: 0 },
            { nombre: 'Cerveza', precio: 1.50 },
            { nombre: 'Copa de vino', precio: 2.00 },
        ]
    },
]

const MODIFIER_TEMPLATES = [
    {
        name: '🔥 Punto de cocción',
        description: 'Poco hecho, Al punto, Muy hecho',
        grupo: {
            nombre: 'Punto de cocción',
            tipo: 'radio' as const,
            obligatorio: false,
            opciones: ['Poco hecho', 'Al punto', 'Muy hecho', 'Bien hecho']
        }
    },
    {
        name: '🚫 Sin ingredientes',
        description: 'Sin lechuga, Sin cebolla...',
        grupo: {
            nombre: 'Sin ingredientes',
            tipo: 'checkbox' as const,
            obligatorio: false,
            opciones: ['Sin lechuga', 'Sin cebolla', 'Sin tomate', 'Sin pepino', 'Sin salsa']
        }
    },
    {
        name: '➕ Con extra de',
        description: 'Con tomate, Con lechuga...',
        grupo: {
            nombre: 'Agregar',
            tipo: 'checkbox' as const,
            obligatorio: false,
            opciones: ['Con tomate', 'Con lechuga', 'Con cebolla', 'Con salsa extra']
        }
    },
    {
        name: '🌶️ Nivel de picante',
        description: 'Suave, Medio, Fuerte',
        grupo: {
            nombre: 'Nivel de picante',
            tipo: 'radio' as const,
            obligatorio: false,
            opciones: ['Sin picante', 'Suave', 'Medio', 'Fuerte', 'Extra fuerte']
        }
    },
]

interface ExtraOption { nombre: string; precio: number }
interface ExtraGroup { grupo: string; max_selecciones: number; opciones: ExtraOption[] }
interface ModifierGroup { nombre: string; tipo: 'radio' | 'checkbox'; obligatorio: boolean; opciones: string[] }

// ============================================
// Helper to extract name from JSONB or string
// ============================================
function extractName(name: any): string {
    if (!name) return ''
    if (typeof name === 'string') return name
    if (typeof name === 'object' && name.es) return name.es
    return String(name)
}

// ============================================
// Main Component
// ============================================
export function CreateProductModalPro({
    categoryId,
    categoryName,
    categories = [],
    allProducts = [],
    product,
    onClose,
    onSuccess
}: Props) {
    const isEditMode = !!product?.id
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)
    const [imageGenerating, setImageGenerating] = useState(false)
    const [imageError, setImageError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const descriptionManuallyEdited = useRef(false)

    // Form fields — pre-fill from product in edit mode
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        product?.category_id ? [product.category_id] : categoryId ? [categoryId] : []
    )
    const [nameEs, setNameEs] = useState(extractName(product?.name) || product?.name_es || '')
    const [description, setDescription] = useState(
        (product?.description?.es || product?.description_es || '')
    )
    const [price, setPrice] = useState<number>(product?.price || 0)
    const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url || null)
    const [allergens, setAllergens] = useState<string[]>(product?.allergens || [])
    const [dietaryTags, setDietaryTags] = useState<string[]>(product?.dietary_tags || [])
    const [prepTime, setPrepTime] = useState<number | undefined>(product?.prep_time_minutes || undefined)
    const [showPrepTime, setShowPrepTime] = useState(product?.show_prep_time || false)

    // Extras & Modifiers — pre-fill from product
    const [extras, setExtras] = useState<ExtraGroup[]>(product?.extras || [])
    const [modifiers, setModifiers] = useState<ModifierGroup[]>(
        product?.options?.modifiers || []
    )

    // Recommendations
    const [enableRecommendations, setEnableRecommendations] = useState(
        !!(product?.metadata?.recommended_products?.length)
    )
    const [recommendedProductIds, setRecommendedProductIds] = useState<string[]>(
        product?.metadata?.recommended_products || []
    )
    const [recSearchQuery, setRecSearchQuery] = useState('')

    // Mark description as manually edited if we pre-filled it
    useEffect(() => {
        if (isEditMode && description) {
            descriptionManuallyEdited.current = true
        }
    }, [])

    // Get category names for display
    const selectedCategoryNames = selectedCategoryIds.map(id => {
        const cat = categories.find(c => c.id === id)
        return cat?.name_es || extractName(cat?.name) || ''
    }).filter(Boolean)
    const selectedCategoryName = selectedCategoryNames[0] || categoryName || ''

    // Toggle category selection
    function toggleCategory(catId: string) {
        setSelectedCategoryIds(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        )
    }

    // =========================================
    // Image upload (direct Supabase)
    // =========================================
    async function handleImageUpload(file: File) {
        if (file.size > 5 * 1024 * 1024) {
            setImageError('Imagen demasiado grande (máx 5MB)')
            return
        }
        setImageUploading(true)
        setImageError(null)

        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop()
            const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, { cacheControl: '3600', upsert: false })

            if (uploadError) {
                if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
                    setImageError('El bucket "product-images" no existe en Supabase. Créalo en Storage → New Bucket → "product-images" (público)')
                } else {
                    setImageError(`Error: ${uploadError.message}`)
                }
                return
            }

            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
            setImageUrl(publicUrl)
        } catch {
            setImageError('Error de conexión al subir imagen')
        } finally {
            setImageUploading(false)
        }
    }

    function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) handleImageUpload(file)
    }

    // =========================================
    // AI Description
    // =========================================
    const [aiStatus, setAiStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
    const [aiError, setAiError] = useState('')

    function handleNameChange(value: string) {
        setNameEs(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (value.trim().length >= 3 && !descriptionManuallyEdited.current) {
            debounceRef.current = setTimeout(() => {
                autoGenerateDescription(value)
            }, 800)
        }
    }

    function handleDescriptionManualChange(value: string) {
        setDescription(value)
        descriptionManuallyEdited.current = value.trim().length > 0
    }

    async function autoGenerateDescription(name: string) {
        if (aiStatus === 'generating') return
        setAiStatus('generating')
        setAiError('')
        try {
            const res = await fetch('/api/ai/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productName: name, category: selectedCategoryName || '' })
            })
            const result = await res.json()
            if (result.success && result.description) {
                setDescription(result.description)
                setAiStatus('done')
            } else {
                setAiStatus('idle')
            }
        } catch {
            setAiStatus('idle')
        }
    }

    async function generateWithAI() {
        if (!nameEs || nameEs.trim().length < 2) {
            alert('Primero escribe el nombre del producto')
            return
        }
        descriptionManuallyEdited.current = false
        setAiStatus('generating')
        setAiError('')
        try {
            const res = await fetch('/api/ai/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productName: nameEs, category: selectedCategoryName || '' })
            })
            const result = await res.json()
            if (result.success && result.description) {
                setDescription(result.description)
                setAiStatus('done')
            } else {
                setAiError(result.error || 'Error al generar descripción')
                setAiStatus('error')
            }
        } catch {
            setAiError('Error de conexión con la IA')
            setAiStatus('error')
        }
    }

    // =========================================
    // AI Image Generation
    // =========================================
    async function generateImageWithAI() {
        if (!nameEs.trim()) {
            alert('Primero escribe el nombre del producto')
            return
        }
        setImageGenerating(true)
        setImageError(null)
        try {
            const res = await fetch('/api/ai/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productName: nameEs, description })
            })
            const result = await res.json()
            if (result.success && result.imageUrl) {
                setImageUrl(result.imageUrl)
            } else {
                setImageError(result.error || 'Error al generar imagen')
            }
        } catch {
            setImageError('Error de conexión al generar imagen')
        } finally {
            setImageGenerating(false)
        }
    }

    // =========================================
    // Toggle helpers
    // =========================================
    function toggleAllergen(id: string) {
        setAllergens(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
    }
    function toggleTag(id: string) {
        setDietaryTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
    }

    // =========================================
    // Extra group handlers
    // =========================================
    function addExtraFromTemplate(template: typeof EXTRA_TEMPLATES[0]) {
        setExtras(prev => [...prev, {
            grupo: template.grupo,
            max_selecciones: template.max_selecciones,
            opciones: template.opciones.map(o => ({ ...o }))
        }])
    }
    function addExtraGroup() {
        setExtras(prev => [...prev, { grupo: '', max_selecciones: 1, opciones: [{ nombre: '', precio: 0 }] }])
    }
    function removeExtraGroup(idx: number) {
        setExtras(prev => prev.filter((_, i) => i !== idx))
    }
    function updateExtraGroup(idx: number, field: string, value: unknown) {
        setExtras(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g))
    }
    function addExtraOption(gi: number) {
        setExtras(prev => prev.map((g, i) => i === gi ? { ...g, opciones: [...g.opciones, { nombre: '', precio: 0 }] } : g))
    }
    function updateExtraOption(gi: number, oi: number, field: string, val: unknown) {
        setExtras(prev => prev.map((g, i) => i === gi ? {
            ...g, opciones: g.opciones.map((o, j) => j === oi ? { ...o, [field]: val } : o)
        } : g))
    }
    function removeExtraOption(gi: number, oi: number) {
        setExtras(prev => prev.map((g, i) => i === gi ? {
            ...g, opciones: g.opciones.filter((_, j) => j !== oi)
        } : g))
    }

    // =========================================
    // Modifier group handlers
    // =========================================
    function addModifierFromTemplate(template: typeof MODIFIER_TEMPLATES[0]) {
        setModifiers(prev => [...prev, {
            nombre: template.grupo.nombre,
            tipo: template.grupo.tipo,
            obligatorio: template.grupo.obligatorio,
            opciones: [...template.grupo.opciones]
        }])
    }
    function addModifierGroup() {
        setModifiers(prev => [...prev, { nombre: '', tipo: 'radio', obligatorio: false, opciones: [''] }])
    }
    function removeModifierGroup(idx: number) {
        setModifiers(prev => prev.filter((_, i) => i !== idx))
    }
    function updateModifierGroup(idx: number, field: string, value: unknown) {
        setModifiers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
    }
    function addModifierOption(gi: number) {
        setModifiers(prev => prev.map((m, i) => i === gi ? { ...m, opciones: [...m.opciones, ''] } : m))
    }
    function updateModifierOption(gi: number, oi: number, val: string) {
        setModifiers(prev => prev.map((m, i) => i === gi ? {
            ...m, opciones: m.opciones.map((o, j) => j === oi ? val : o)
        } : m))
    }
    function removeModifierOption(gi: number, oi: number) {
        setModifiers(prev => prev.map((m, i) => i === gi ? {
            ...m, opciones: m.opciones.filter((_, j) => j !== oi)
        } : m))
    }

    // =========================================
    // Recommendation helpers
    // =========================================
    function toggleRecommendedProduct(productId: string) {
        setRecommendedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    // Filter available products for recommendations (exclude current product)
    const availableForRecommendation = allProducts.filter(p => p.id !== product?.id)
    const filteredRecommendations = recSearchQuery
        ? availableForRecommendation.filter(p => {
            const name = extractName(p.name) || p.name_es || ''
            return name.toLowerCase().includes(recSearchQuery.toLowerCase())
        })
        : availableForRecommendation

    // Group recommendations by category
    const recommendationsByCategory = filteredRecommendations.reduce((acc, p) => {
        const catId = p.category_id
        const catName = categories.find(c => c.id === catId)?.name_es
            || extractName(categories.find(c => c.id === catId)?.name)
            || 'Sin categoría'
        if (!acc[catName]) acc[catName] = []
        acc[catName].push(p)
        return acc
    }, {} as Record<string, ProductData[]>)

    // =========================================
    // Submit — Create or Update
    // =========================================
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!nameEs.trim() || !price) {
            alert('Completa nombre y precio')
            return
        }
        if (selectedCategoryIds.length === 0) {
            alert('Selecciona al menos una categoría')
            return
        }
        setLoading(true)

        try {
            const cleanExtras = extras
                .filter(g => g.grupo && g.opciones.some(o => o.nombre.trim()))
                .map(g => ({ ...g, opciones: g.opciones.filter(o => o.nombre.trim()) }))
            const cleanModifiers = modifiers
                .filter(m => m.nombre && m.opciones.some(o => o.trim()))
                .map(m => ({ ...m, opciones: m.opciones.filter(o => o.trim()) }))

            const formData = {
                name_es: nameEs,
                description_es: description || null,
                price,
                image_url: imageUrl,
                allergens: allergens.length > 0 ? allergens : null,
                dietary_tags: dietaryTags,
                prep_time_minutes: prepTime || null,
                show_prep_time: showPrepTime,
                extras: cleanExtras.length > 0 ? cleanExtras : null,
                options: cleanModifiers.length > 0 ? { modifiers: cleanModifiers } : null,
                recommended_products: enableRecommendations && recommendedProductIds.length > 0
                    ? recommendedProductIds : null,
            }

            if (isEditMode && product?.id) {
                // Update existing product (first category)
                const result = await updateProductPro(product.id, {
                    ...formData,
                    category_id: selectedCategoryIds[0],
                })
                if (!result.success) {
                    alert('Error: ' + result.error)
                    setLoading(false)
                    return
                }
                // Create additional copies for extra categories
                for (let i = 1; i < selectedCategoryIds.length; i++) {
                    await createProductPro({
                        ...formData,
                        category_id: selectedCategoryIds[i],
                        ai_generated_description: false,
                    })
                }
            } else {
                // Create one product per selected category
                for (const catId of selectedCategoryIds) {
                    const result = await createProductPro({
                        ...formData,
                        category_id: catId,
                        ai_generated_description: false,
                    })
                    if (!result.success) {
                        alert('Error: ' + result.error)
                        setLoading(false)
                        return
                    }
                }
            }

            onSuccess()
        } catch (err) {
            alert('Error: ' + (err instanceof Error ? err.message : 'desconocido'))
            setLoading(false)
        }
    }

    const stepTitles = ['Básico', 'Detalles', 'Personalización', 'Revisar']

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEditMode ? '✏️ Editar Producto' : '✨ Nuevo Producto'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">✕</button>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s < step ? 'bg-green-500 text-white' : s === step ? 'bg-green-500 text-white ring-4 ring-green-100' : 'bg-slate-200 text-slate-500'}`}>
                                        {s < step ? '✓' : s}
                                    </div>
                                    <span className={`text-xs font-medium ${s <= step ? 'text-green-700' : 'text-slate-400'}`}>{stepTitles[s - 1]}</span>
                                </div>
                                <div className={`h-1 rounded-full ${s <= step ? 'bg-green-500' : 'bg-slate-200'}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* ============ STEP 1: Básico ============ */}
                    {step === 1 && (
                        <div className="space-y-5">
                            {/* Category multi-select */}
                            {categories.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        📁 Categorías *
                                        {selectedCategoryIds.length > 0 && (
                                            <span className="ml-2 text-xs font-normal text-green-600">
                                                ({selectedCategoryIds.length} seleccionada{selectedCategoryIds.length > 1 ? 's' : ''})
                                            </span>
                                        )}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => {
                                            const catName = cat.name_es || extractName(cat.name)
                                            const isSelected = selectedCategoryIds.includes(cat.id)
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${isSelected
                                                        ? 'bg-green-100 border-green-400 text-green-700 ring-1 ring-green-300'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {isSelected ? '✅ ' : ''}{catName}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {selectedCategoryIds.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">Selecciona al menos una categoría</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del producto *</label>
                                <input
                                    type="text"
                                    value={nameEs}
                                    onChange={e => handleNameChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    placeholder="Ej: Hamburguesa Clásica"
                                    autoFocus={!isEditMode}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Precio (€) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.10"
                                        value={price || ''}
                                        onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder="10.00"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Descripción
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generateWithAI}
                                            disabled={!nameEs.trim() || aiStatus === 'generating'}
                                            className="text-xs px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                        >
                                            {aiStatus === 'generating' ? '✨ Generando...' : '✨ Generar con IA'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={e => handleDescriptionManualChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                                        rows={3}
                                        placeholder={aiStatus === 'generating' ? '✨ Generando descripción...' : 'Descripción del producto...'}
                                    />
                                    {aiStatus === 'done' && (
                                        <p className="text-xs text-green-600 mt-1">✨ Descripción generada por IA</p>
                                    )}
                                    {aiError && (
                                        <p className="text-xs text-red-600 mt-1">⚠️ {aiError}</p>
                                    )}
                                </div>
                            </div>

                            {/* Image upload + AI generate */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">📷 Imagen del producto</label>
                                <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileSelect} />

                                {imageUrl ? (
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                        <img src={imageUrl} alt="Producto" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={generateImageWithAI}
                                                disabled={imageGenerating || !nameEs.trim()}
                                                className="p-2 bg-white/90 text-purple-600 rounded-full shadow hover:bg-white disabled:opacity-50"
                                                title="Generar otra imagen"
                                            >
                                                <Sparkles size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setImageUrl(null); setImageError(null) }}
                                                className="p-2 bg-white/90 text-red-500 rounded-full shadow hover:bg-white"
                                                title="Quitar imagen"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : imageGenerating ? (
                                    <div className="w-full p-8 border-2 border-purple-300 rounded-xl bg-purple-50/50 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="w-10 h-10 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-3" />
                                            <span className="text-sm font-semibold text-purple-700">Generando imagen con IA...</span>
                                            <span className="text-xs text-purple-500 mt-1">Esto puede tardar 10-20 segundos</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={imageUploading}
                                            className="p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-green-400 hover:bg-green-50/50 transition-all text-center"
                                        >
                                            {imageUploading ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="w-6 h-6 border-2 border-green-300 border-t-green-600 rounded-full animate-spin mb-2" />
                                                    <span className="text-xs text-slate-500">Subiendo...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Upload size={24} className="text-slate-400 mb-2" />
                                                    <span className="text-sm font-semibold text-slate-700">Subir foto</span>
                                                    <span className="text-xs text-slate-400 mt-0.5">Desde archivos</span>
                                                </div>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generateImageWithAI}
                                            disabled={!nameEs.trim() || imageGenerating}
                                            className="p-6 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all text-center disabled:opacity-50"
                                        >
                                            <div className="flex flex-col items-center">
                                                <Sparkles size={24} className="text-purple-500 mb-2" />
                                                <span className="text-sm font-semibold text-purple-700">Generar con IA</span>
                                                <span className="text-xs text-purple-400 mt-0.5">Foto profesional</span>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {imageError && (
                                    <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                                        ⚠️ {imageError}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={onClose} className="flex-1 px-5 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium">Cancelar</button>
                                <button type="button" onClick={() => setStep(2)} className="flex-1 px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold">Siguiente →</button>
                            </div>
                        </div>
                    )}

                    {/* ============ STEP 2: Detalles ============ */}
                    {step === 2 && (
                        <div className="space-y-5">
                            {/* Allergens */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">⚠️ Alérgenos</label>
                                <div className="flex flex-wrap gap-2">
                                    {ALLERGEN_OPTIONS.map(a => (
                                        <button key={a.id} type="button" onClick={() => toggleAllergen(a.id)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${allergens.includes(a.id)
                                                ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-slate-200 text-slate-600 hover:border-red-200'
                                                }`}>
                                            {a.emoji} {a.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">🏷️ Etiquetas dietéticas</label>
                                <div className="flex flex-wrap gap-2">
                                    {TAG_OPTIONS.map(t => (
                                        <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${dietaryTags.includes(t.id)
                                                ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:border-green-200'
                                                }`}>
                                            {t.emoji} {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prep time */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={showPrepTime} onChange={e => setShowPrepTime(e.target.checked)}
                                        className="w-4 h-4 accent-green-500" />
                                    <span className="text-sm font-semibold text-slate-700">⏱️ Mostrar tiempo de preparación</span>
                                </label>
                                {showPrepTime && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <input type="number" min={1} max={120} value={prepTime || ''} onChange={e => setPrepTime(parseInt(e.target.value) || undefined)}
                                            className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="15" />
                                        <span className="text-sm text-slate-500">minutos</span>
                                    </div>
                                )}
                            </div>

                            {/* ====== RECOMENDAR PRODUCTOS ====== */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={enableRecommendations}
                                        onChange={e => setEnableRecommendations(e.target.checked)}
                                        className="w-4 h-4 accent-amber-500"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">🔗 Recomendar otros productos</span>
                                </label>
                                <p className="text-xs text-slate-500 mt-1 ml-6">
                                    Sugiere productos complementarios al cliente
                                </p>

                                {enableRecommendations && (
                                    <div className="mt-3 space-y-3">
                                        {/* Search */}
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={recSearchQuery}
                                                onChange={e => setRecSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                                                placeholder="Buscar productos..."
                                            />
                                        </div>

                                        {/* Selected count */}
                                        {recommendedProductIds.length > 0 && (
                                            <p className="text-xs font-semibold text-amber-700">
                                                ✅ {recommendedProductIds.length} producto{recommendedProductIds.length > 1 ? 's' : ''} seleccionado{recommendedProductIds.length > 1 ? 's' : ''}
                                            </p>
                                        )}

                                        {/* Product list grouped by category */}
                                        <div className="max-h-48 overflow-y-auto space-y-3 border border-slate-200 rounded-lg p-2 bg-white">
                                            {Object.entries(recommendationsByCategory).length === 0 ? (
                                                <p className="text-xs text-slate-400 text-center py-4">No hay productos disponibles</p>
                                            ) : (
                                                Object.entries(recommendationsByCategory).map(([catName, prods]) => (
                                                    <div key={catName}>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                                                            {catName}
                                                        </p>
                                                        {prods.map(p => {
                                                            const pName = extractName(p.name) || p.name_es || 'Sin nombre'
                                                            const isSelected = recommendedProductIds.includes(p.id!)
                                                            return (
                                                                <label
                                                                    key={p.id}
                                                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => toggleRecommendedProduct(p.id!)}
                                                                        className="w-3.5 h-3.5 accent-amber-500"
                                                                    />
                                                                    {p.image_url && (
                                                                        <img src={p.image_url} alt="" className="w-7 h-7 rounded object-cover" />
                                                                    )}
                                                                    <span className="text-sm text-slate-700 flex-1 truncate">{pName}</span>
                                                                    <span className="text-xs text-slate-400">€{p.price?.toFixed(2)}</span>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 px-5 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium">← Atrás</button>
                                <button type="button" onClick={() => setStep(3)} className="flex-1 px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold">Siguiente →</button>
                            </div>
                        </div>
                    )}

                    {/* ============ STEP 3: Personalización (Extras + Modifiers) ============ */}
                    {step === 3 && (
                        <div className="space-y-5">
                            {/* Extras section */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">🛒 Suplementos / Extras</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {EXTRA_TEMPLATES.map((t, i) => (
                                        <button key={i} type="button" onClick={() => addExtraFromTemplate(t)}
                                            className="px-3 py-1.5 border border-dashed border-green-300 rounded-lg text-xs text-green-700 hover:bg-green-50 transition-colors">
                                            {t.name}
                                        </button>
                                    ))}
                                </div>

                                {extras.map((grupo, gi) => (
                                    <div key={gi} className="bg-slate-50 rounded-xl p-4 mb-3 border border-slate-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input type="text" value={grupo.grupo}
                                                onChange={e => updateExtraGroup(gi, 'grupo', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                                                placeholder="Nombre del grupo" />
                                            <input type="number" value={grupo.max_selecciones} min={1}
                                                onChange={e => updateExtraGroup(gi, 'max_selecciones', parseInt(e.target.value) || 1)}
                                                className="w-16 px-2 py-2 border border-slate-300 rounded-lg text-sm text-center" title="Máx selecciones" />
                                            <button type="button" onClick={() => removeExtraGroup(gi)} className="p-2 hover:bg-red-50 rounded-lg text-red-400">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {grupo.opciones.map((op, oi) => (
                                            <div key={oi} className="flex items-center gap-2 mb-2">
                                                <input type="text" value={op.nombre}
                                                    onChange={e => updateExtraOption(gi, oi, 'nombre', e.target.value)}
                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                                    placeholder="Nombre opción" />
                                                <div className="flex items-center">
                                                    <span className="text-xs text-slate-400 mr-1">€</span>
                                                    <input type="number" step="0.10" value={op.precio}
                                                        onChange={e => updateExtraOption(gi, oi, 'precio', parseFloat(e.target.value) || 0)}
                                                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center" />
                                                </div>
                                                <button type="button" onClick={() => removeExtraOption(gi, oi)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                                                    <Minus size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addExtraOption(gi)}
                                            className="text-xs text-green-600 font-medium flex items-center gap-1 hover:text-green-700">
                                            <Plus size={12} /> Añadir opción
                                        </button>
                                    </div>
                                ))}

                                <button type="button" onClick={addExtraGroup}
                                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:text-green-600 hover:border-green-300 transition-colors">
                                    <Plus size={16} className="inline mr-1" /> Crear grupo personalizado
                                </button>
                            </div>

                            {/* Modifiers section */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">🎛️ Modificadores</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {MODIFIER_TEMPLATES.map((t, i) => (
                                        <button key={i} type="button" onClick={() => addModifierFromTemplate(t)}
                                            className="px-3 py-1.5 border border-dashed border-purple-300 rounded-lg text-xs text-purple-700 hover:bg-purple-50 transition-colors">
                                            {t.name}
                                        </button>
                                    ))}
                                </div>

                                {modifiers.map((mod, mi) => (
                                    <div key={mi} className="bg-slate-50 rounded-xl p-4 mb-3 border border-slate-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input type="text" value={mod.nombre}
                                                onChange={e => updateModifierGroup(mi, 'nombre', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                                                placeholder="Nombre (ej: Punto de cocción)" />
                                            <select value={mod.tipo}
                                                onChange={e => updateModifierGroup(mi, 'tipo', e.target.value)}
                                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                                                <option value="radio">Radio (1 opción)</option>
                                                <option value="checkbox">Check (varias)</option>
                                            </select>
                                            <label className="flex items-center gap-1 text-xs text-slate-500">
                                                <input type="checkbox" checked={mod.obligatorio}
                                                    onChange={e => updateModifierGroup(mi, 'obligatorio', e.target.checked)}
                                                    className="w-3.5 h-3.5 accent-green-500" />
                                                Oblig.
                                            </label>
                                            <button type="button" onClick={() => removeModifierGroup(mi)} className="p-2 hover:bg-red-50 rounded-lg text-red-400">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {mod.opciones.map((op, oi) => (
                                            <div key={oi} className="flex items-center gap-2 mb-2">
                                                <input type="text" value={op}
                                                    onChange={e => updateModifierOption(mi, oi, e.target.value)}
                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                                    placeholder="Opción..." />
                                                <button type="button" onClick={() => removeModifierOption(mi, oi)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                                                    <Minus size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addModifierOption(mi)}
                                            className="text-xs text-purple-600 font-medium flex items-center gap-1 hover:text-purple-700">
                                            <Plus size={12} /> Añadir opción
                                        </button>
                                    </div>
                                ))}

                                <button type="button" onClick={addModifierGroup}
                                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors">
                                    <Plus size={16} className="inline mr-1" /> Crear modificador personalizado
                                </button>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(2)} className="flex-1 px-5 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium">← Atrás</button>
                                <button type="button" onClick={() => setStep(4)} className="flex-1 px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold">Siguiente →</button>
                            </div>
                        </div>
                    )}

                    {/* ============ STEP 4: Revisar y Crear/Guardar ============ */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <div className="bg-gradient-to-br from-slate-50 to-green-50 p-6 rounded-2xl border border-slate-200">
                                <div className="flex items-start gap-4 mb-4">
                                    {imageUrl && <img src={imageUrl} alt={nameEs} className="w-24 h-24 rounded-xl object-cover border border-slate-200 flex-shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-800">{nameEs}</h3>
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {selectedCategoryNames.map((name, i) => (
                                                        <span key={i} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="font-bold text-2xl text-green-600 flex-shrink-0">€{price?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {description && <p className="text-slate-600 text-sm mb-4">{description}</p>}
                                {prepTime && showPrepTime && <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mb-3">⏱️ {prepTime} min</span>}

                                {allergens.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Alérgenos</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {allergens.map(a => { const info = ALLERGEN_OPTIONS.find(x => x.id === a); return <span key={a} className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">{info?.emoji} {info?.label || a}</span> })}
                                        </div>
                                    </div>
                                )}

                                {dietaryTags.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Etiquetas</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {dietaryTags.map(t => { const info = TAG_OPTIONS.find(x => x.id === t); return <span key={t} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{info?.emoji} {info?.label || t}</span> })}
                                        </div>
                                    </div>
                                )}

                                {extras.filter(g => g.grupo).length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">🛒 Extras</p>
                                        {extras.filter(g => g.grupo).map((g, i) => (
                                            <div key={i} className="bg-white rounded-lg p-2 mb-1 border border-slate-100">
                                                <span className="text-xs font-bold text-slate-700">{g.grupo}</span>
                                                <span className="text-xs text-slate-500 ml-1">
                                                    ({g.opciones.filter(o => o.nombre).map(o => `${o.nombre}${o.precio > 0 ? ` +€${o.precio.toFixed(2)}` : ''}`).join(', ')})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {modifiers.filter(m => m.nombre).length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">🎛️ Modificadores</p>
                                        {modifiers.filter(m => m.nombre).map((m, i) => (
                                            <div key={i} className="bg-white rounded-lg p-2 mb-1 border border-slate-100">
                                                <span className="text-xs font-bold text-slate-700">{m.nombre}</span>
                                                <span className="text-xs text-slate-500 ml-1">({m.opciones.filter(o => o).join(', ')})</span>
                                                {m.obligatorio && <span className="text-xs text-red-500 ml-1">(obligatorio)</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {enableRecommendations && recommendedProductIds.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">🔗 Productos recomendados</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {recommendedProductIds.map(id => {
                                                const p = allProducts.find(x => x.id === id)
                                                const pName = p ? (extractName(p.name) || p.name_es || 'Producto') : 'Producto'
                                                return <span key={id} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">{pName}</span>
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(3)} className="flex-1 px-5 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium">← Atrás</button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all font-semibold shadow-lg shadow-green-500/25">
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {isEditMode ? 'Guardando...' : 'Creando...'}
                                        </span>
                                    ) : isEditMode ? '💾 Guardar Cambios' : '✅ Crear Producto'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
