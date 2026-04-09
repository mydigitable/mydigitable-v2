'use client'

import { useState, useRef } from 'react'
import { createProduct, uploadProductImage } from '@/app/actions/menu'
import { generateProductDescription, detectAllergens, generateProductImage } from '@/app/actions/ai'
import { ALLERGENS, DIETARY_LABELS } from '@/lib/constants/menu'
import { AIButton } from './AIButton'

export function CreateProductModal({ categoryId, restaurantId, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        is_available: true,
        allergens: [] as string[],
        labels: [] as string[],
    })

    function toggleAllergen(allergenId: string) {
        setFormData(prev => ({
            ...prev,
            allergens: prev.allergens.includes(allergenId)
                ? prev.allergens.filter(a => a !== allergenId)
                : [...prev.allergens, allergenId]
        }))
    }

    function toggleLabel(labelId: string) {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.includes(labelId)
                ? prev.labels.filter(l => l !== labelId)
                : [...prev.labels, labelId]
        }))
    }

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            let imageUrl = null

            // 1. Subir imagen si existe
            if (imageFile) {
                const formDataImg = new FormData()
                formDataImg.append('file', imageFile)
                const uploadResult = await uploadProductImage(formDataImg)

                if (uploadResult.success) {
                    imageUrl = uploadResult.data
                }
            }

            // 2. Crear producto
            const result = await createProduct({
                name: formData.name,
                description: formData.description || null,
                price: parseFloat(formData.price),
                image_url: imageUrl,
                is_available: formData.is_available,
                allergens: formData.allergens,
                labels: formData.labels,
                extras: [],
                options: [],
                category_id: categoryId
            })

            if (result.success) {
                onSuccess()
            } else {
                alert('Error: ' + result.error)
            }
        } catch (error: any) {
            alert('Error al crear producto: ' + error.message)
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full my-8 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Nuevo Producto</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Upload Imagen */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Imagen del producto
                            </label>
                            <AIButton
                                label="Generar con IA"
                                size="sm"
                                onClick={async () => {
                                    if (!formData.name) {
                                        alert('Primero ingresa el nombre del producto')
                                        return
                                    }
                                    const result = await generateProductImage(formData.name, formData.description)
                                    if (result.success && result.imageUrl) {
                                        setImagePreview(result.imageUrl)
                                        // Note: This is a URL, not a File. Need to handle differently in submit
                                    } else {
                                        alert('Error: ' + result.error)
                                    }
                                }}
                            />
                        </div>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition-colors bg-slate-50 hover:bg-slate-100"
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-64 mx-auto rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setImagePreview(null)
                                            setImageFile(null)
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="text-slate-400">
                                    <div className="text-6xl mb-3">📷</div>
                                    <p className="font-medium">Haz clic para subir una imagen</p>
                                    <p className="text-sm mt-1">JPG, PNG o WEBP (máx. 5MB)</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                            Nombre del producto *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Ej: Pizza Margarita, Ensalada César..."
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Descripción
                            </label>
                            <AIButton
                                label="Generar con IA"
                                size="sm"
                                onClick={async () => {
                                    if (!formData.name) {
                                        alert('Primero ingresa el nombre del producto')
                                        return
                                    }
                                    const result = await generateProductDescription(formData.name)
                                    if (result.success && result.description) {
                                        setFormData({ ...formData, description: result.description })
                                    } else {
                                        alert('Error: ' + result.error)
                                    }
                                }}
                            />
                        </div>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                            rows={3}
                            placeholder="Ingredientes, preparación, información adicional..."
                        />
                    </div>

                    {/* Precio */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                            Precio (€) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="12.50"
                        />
                    </div>

                    {/* Alérgenos */}
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-slate-700">
                                Alérgenos
                            </label>
                            <AIButton
                                label="Detectar con IA"
                                size="sm"
                                onClick={async () => {
                                    if (!formData.name) {
                                        alert('Primero ingresa el nombre del producto')
                                        return
                                    }
                                    const result = await detectAllergens(formData.name, formData.description)
                                    if (result.success && result.allergens) {
                                        setFormData({ ...formData, allergens: result.allergens })
                                    } else {
                                        alert('Error: ' + result.error)
                                    }
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {ALLERGENS.map(allergen => (
                                <label
                                    key={allergen.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border-2 ${formData.allergens.includes(allergen.id)
                                        ? 'bg-white border-green-500 shadow-sm'
                                        : 'bg-white border-transparent hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.allergens.includes(allergen.id)}
                                        onChange={() => toggleAllergen(allergen.id)}
                                        className="w-4 h-4 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                                    />
                                    <span className="text-lg">{allergen.emoji}</span>
                                    <span className="text-xs font-medium text-slate-700 flex-1">
                                        {allergen.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {formData.allergens.length > 0 && (
                            <p className="text-xs text-slate-500 mt-2">
                                {formData.allergens.length} alérgeno(s) seleccionado(s)
                            </p>
                        )}
                    </div>

                    {/* Etiquetas Dietéticas */}
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <label className="block text-sm font-semibold mb-3 text-slate-700">
                            Etiquetas
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {DIETARY_LABELS.map(label => (
                                <label
                                    key={label.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border-2 ${formData.labels.includes(label.id)
                                        ? 'bg-white border-green-500 shadow-sm'
                                        : 'bg-white border-transparent hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.labels.includes(label.id)}
                                        onChange={() => toggleLabel(label.id)}
                                        className="w-4 h-4 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                                    />
                                    <span className="text-lg">{label.emoji}</span>
                                    <span className="text-xs font-medium text-slate-700 flex-1">
                                        {label.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {formData.labels.length > 0 && (
                            <p className="text-xs text-slate-500 mt-2">
                                {formData.labels.length} etiqueta(s) seleccionada(s)
                            </p>
                        )}
                    </div>

                    {/* Nota sobre extras */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            💡 <strong>Extras y opciones:</strong> Podrás añadir extras, modificadores y puntos de cocción después de crear el producto.
                        </p>
                    </div>

                    {/* Disponibilidad */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="is_available"
                            checked={formData.is_available}
                            onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                            className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <label htmlFor="is_available" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Producto disponible
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
                            {loading ? 'Creando...' : 'Crear producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
