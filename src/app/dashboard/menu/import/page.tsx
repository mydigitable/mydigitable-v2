"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Upload,
    FileText,
    Image as ImageIcon,
    Camera,
    Loader2,
    Check,
    X,
    Wand2,
    Sparkles,
    AlertTriangle,
    Eye,
    Edit3,
    Trash2,
    Plus,
    ChevronDown,
    Euro,
} from "lucide-react";
import Link from "next/link";

interface DetectedProduct {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    selected: boolean;
}

interface DetectedCategory {
    id: string;
    name: string;
    productCount: number;
}

export default function ImportMenuPage() {
    const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'importing' | 'done'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [detectedProducts, setDetectedProducts] = useState<DetectedProduct[]>([]);
    const [detectedCategories, setDetectedCategories] = useState<DetectedCategory[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supabase = createClient();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Formato no soportado. Usa JPG, PNG, WebP o PDF.');
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('El archivo es demasiado grande. Máximo 10MB.');
            return;
        }

        setFile(selectedFile);
        setError(null);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target?.result as string);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreviewUrl(null);
        }
    };

    const processMenu = async () => {
        if (!file) return;

        setStep('processing');
        setProgress(0);

        // Simulate OCR/AI processing
        // In production, this would call an AI API like OpenAI Vision or Google Vision
        const processingSteps = [
            { progress: 20, message: 'Analizando documento...' },
            { progress: 40, message: 'Detectando texto...' },
            { progress: 60, message: 'Identificando productos...' },
            { progress: 80, message: 'Extrayendo precios...' },
            { progress: 100, message: 'Organizando categorías...' },
        ];

        for (const step of processingSteps) {
            await new Promise(resolve => setTimeout(resolve, 800));
            setProgress(step.progress);
        }

        // Simulate detected products (in production, this comes from AI)
        const mockCategories: DetectedCategory[] = [
            { id: '1', name: 'Entrantes', productCount: 5 },
            { id: '2', name: 'Ensaladas', productCount: 4 },
            { id: '3', name: 'Platos Principales', productCount: 8 },
            { id: '4', name: 'Postres', productCount: 6 },
            { id: '5', name: 'Bebidas', productCount: 10 },
        ];

        const mockProducts: DetectedProduct[] = [
            // Entrantes
            { id: '1', name: 'Patatas Bravas', description: 'Con salsa brava casera', price: 6.50, category: 'Entrantes', selected: true },
            { id: '2', name: 'Croquetas de Jamón', description: '6 unidades', price: 8.00, category: 'Entrantes', selected: true },
            { id: '3', name: 'Pan con Tomate', description: 'Aceite y ajo', price: 3.50, category: 'Entrantes', selected: true },
            { id: '4', name: 'Gazpacho', description: 'Receta tradicional', price: 5.00, category: 'Entrantes', selected: true },
            { id: '5', name: 'Jamón Ibérico', description: 'Cortado a mano', price: 18.00, category: 'Entrantes', selected: true },
            // Ensaladas
            { id: '6', name: 'Ensalada César', description: 'Pollo, parmesano, croutons', price: 12.00, category: 'Ensaladas', selected: true },
            { id: '7', name: 'Ensalada Mixta', description: 'Lechuga, tomate, cebolla', price: 8.00, category: 'Ensaladas', selected: true },
            { id: '8', name: 'Ensalada de Burrata', description: 'Tomate cherry, albahaca', price: 14.00, category: 'Ensaladas', selected: true },
            { id: '9', name: 'Ensalada Caprese', description: 'Mozzarella, tomate, pesto', price: 11.00, category: 'Ensaladas', selected: true },
            // Platos Principales
            { id: '10', name: 'Entrecot', description: '300g con guarnición', price: 22.00, category: 'Platos Principales', selected: true },
            { id: '11', name: 'Lubina a la plancha', description: 'Con verduras', price: 18.00, category: 'Platos Principales', selected: true },
            { id: '12', name: 'Paella Valenciana', description: 'Mínimo 2 personas', price: 15.00, category: 'Platos Principales', selected: true },
            { id: '13', name: 'Solomillo de cerdo', description: 'Salsa de setas', price: 16.00, category: 'Platos Principales', selected: true },
            // Postres
            { id: '14', name: 'Tarta de Queso', description: 'Estilo vasco', price: 6.00, category: 'Postres', selected: true },
            { id: '15', name: 'Coulant de Chocolate', description: 'Con helado de vainilla', price: 7.00, category: 'Postres', selected: true },
            { id: '16', name: 'Crema Catalana', description: 'Tradicional', price: 5.50, category: 'Postres', selected: true },
            // Bebidas
            { id: '17', name: 'Agua Mineral', description: '50cl', price: 2.50, category: 'Bebidas', selected: true },
            { id: '18', name: 'Coca-Cola', description: '33cl', price: 3.00, category: 'Bebidas', selected: true },
            { id: '19', name: 'Cerveza', description: 'Caña', price: 2.50, category: 'Bebidas', selected: true },
            { id: '20', name: 'Vino de la Casa', description: 'Copa', price: 3.50, category: 'Bebidas', selected: true },
        ];

        setDetectedCategories(mockCategories);
        setDetectedProducts(mockProducts);
        setStep('review');
    };

    const toggleProduct = (productId: string) => {
        setDetectedProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, selected: !p.selected } : p)
        );
    };

    const updateProduct = (productId: string, field: keyof DetectedProduct, value: any) => {
        setDetectedProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, [field]: value } : p)
        );
    };

    const importProducts = async () => {
        setStep('importing');

        const selectedProducts = detectedProducts.filter(p => p.selected);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated');

            const { data: restaurant } = await supabase
                .from("restaurants")
                .select("id")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

            if (!restaurant) throw new Error('No restaurant found');

            // Get or create categories
            const uniqueCategories = Array.from(new Set(selectedProducts.map(p => p.category)));
            const categoryMap: Record<string, string> = {};

            for (const catName of uniqueCategories) {
                // Check if category exists
                const { data: existing } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("restaurant_id", restaurant.id)
                    .eq("name_es", catName)
                    .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

                if (existing) {
                    categoryMap[catName] = existing.id;
                } else {
                    // Create new category
                    const { data: newCat } = await supabase
                        .from("categories")
                        .insert({
                            restaurant_id: restaurant.id,
                            name_es: catName,
                            is_active: true,
                        })
                        .select("id")
                        .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

                    if (newCat) {
                        categoryMap[catName] = newCat.id;
                    }
                }
            }

            // Import products
            for (const product of selectedProducts) {
                await supabase
                    .from("products")
                    .insert({
                        restaurant_id: restaurant.id,
                        category_id: categoryMap[product.category],
                        name_es: product.name,
                        description_es: product.description || null,
                        price: product.price,
                        is_available: true,
                    });
            }

            setStep('done');
        } catch (err) {
            console.error('Error importing:', err);
            setError('Error al importar los productos');
            setStep('review');
        }
    };

    const selectedCount = detectedProducts.filter(p => p.selected).length;

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 mb-2">Importar Menú</h1>
                <p className="text-slate-500">
                    Sube una foto o PDF de tu menú y la IA detectará automáticamente los productos
                </p>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-8">
                {['Subir', 'Procesar', 'Revisar', 'Importar'].map((label, i) => {
                    const stepIndex = ['upload', 'processing', 'review', 'importing'].indexOf(step);
                    const isActive = i === stepIndex;
                    const isDone = i < stepIndex || step === 'done';

                    return (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDone ? 'bg-green-500 text-white' :
                                isActive ? 'bg-primary text-white' :
                                    'bg-slate-100 text-slate-400'
                                }`}>
                                {isDone ? <Check size={16} /> : i + 1}
                            </div>
                            <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                {label}
                            </span>
                            {i < 3 && <div className="w-8 h-0.5 bg-slate-200" />}
                        </div>
                    );
                })}
            </div>

            {/* Upload Step */}
            {step === 'upload' && (
                <div className="space-y-6">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${file ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {previewUrl ? (
                            <div className="space-y-4">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-64 mx-auto rounded-xl"
                                />
                                <p className="font-medium text-slate-700">{file?.name}</p>
                            </div>
                        ) : file ? (
                            <div className="space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                                    <FileText size={40} className="text-primary" />
                                </div>
                                <p className="font-medium text-slate-700">{file.name}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <Upload size={32} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 mb-1">
                                        Arrastra tu menú aquí o haz clic para seleccionar
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Soporta JPG, PNG, WebP, PDF (máx. 10MB)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            <AlertTriangle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-colors"
                        >
                            <Camera size={20} />
                            Tomar Foto
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-colors"
                        >
                            <ImageIcon size={20} />
                            Seleccionar Imagen
                        </button>
                    </div>

                    <button
                        onClick={processMenu}
                        disabled={!file}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Wand2 size={20} />
                        Analizar con IA
                    </button>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Consejo:</strong> Para mejores resultados, usa una foto clara y bien iluminada
                            de tu menú físico, o sube el PDF original.
                        </p>
                    </div>
                </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
                <div className="text-center py-12">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center"
                    >
                        <Sparkles size={40} className="text-white" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Analizando tu menú...
                    </h2>
                    <p className="text-slate-500 mb-6">
                        La IA está detectando productos, precios y categorías
                    </p>
                    <div className="max-w-md mx-auto">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                        <p className="text-sm text-slate-500 mt-2">{progress}%</p>
                    </div>
                </div>
            )}

            {/* Review Step */}
            {step === 'review' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                {detectedProducts.length} productos detectados
                            </h2>
                            <p className="text-sm text-slate-500">
                                Revisa y edita antes de importar
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Seleccionados</p>
                            <p className="text-xl font-bold text-primary">{selectedCount}</p>
                        </div>
                    </div>

                    {/* Categories & Products */}
                    <div className="space-y-4">
                        {detectedCategories.map((category) => {
                            const categoryProducts = detectedProducts.filter(p => p.category === category.name);

                            return (
                                <div key={category.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900">{category.name}</h3>
                                        <span className="text-sm text-slate-500">
                                            {categoryProducts.filter(p => p.selected).length}/{categoryProducts.length}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {categoryProducts.map((product) => (
                                            <div key={product.id} className={`p-4 flex items-center gap-4 ${!product.selected ? 'opacity-50' : ''
                                                }`}>
                                                <button
                                                    onClick={() => toggleProduct(product.id)}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${product.selected
                                                        ? 'bg-primary border-primary'
                                                        : 'border-slate-300'
                                                        }`}
                                                >
                                                    {product.selected && <Check size={14} className="text-white" />}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        type="text"
                                                        value={product.name}
                                                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                                        className="font-bold text-slate-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 w-full"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={product.description || ''}
                                                        onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                                                        placeholder="Descripción..."
                                                        className="text-sm text-slate-500 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 w-full"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Euro size={16} className="text-slate-400" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={product.price}
                                                        onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value))}
                                                        className="w-16 font-bold text-primary bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-right"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep('upload')}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-colors"
                        >
                            Volver
                        </button>
                        <button
                            onClick={importProducts}
                            disabled={selectedCount === 0}
                            className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            Importar {selectedCount} productos
                        </button>
                    </div>
                </div>
            )}

            {/* Importing Step */}
            {step === 'importing' && (
                <div className="text-center py-12">
                    <Loader2 size={48} className="mx-auto mb-6 text-primary animate-spin" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Importando productos...
                    </h2>
                    <p className="text-slate-500">
                        Esto puede tardar unos segundos
                    </p>
                </div>
            )}

            {/* Done Step */}
            {step === 'done' && (
                <div className="text-center py-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center"
                    >
                        <Check size={40} className="text-white" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        ¡Importación completada!
                    </h2>
                    <p className="text-slate-500 mb-8">
                        Se han importado {selectedCount} productos a tu menú
                    </p>
                    <div className="flex gap-4 max-w-md mx-auto">
                        <Link
                            href="/dashboard/menu/products"
                            className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-center transition-colors"
                        >
                            Ver Productos
                        </Link>
                        <button
                            onClick={() => {
                                setStep('upload');
                                setFile(null);
                                setPreviewUrl(null);
                                setDetectedProducts([]);
                            }}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-colors"
                        >
                            Importar Otro
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

