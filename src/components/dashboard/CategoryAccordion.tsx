"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    Plus,
    MoreVertical,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    GripVertical,
    Image as ImageIcon
} from "lucide-react";
import * as Icons from "lucide-react";
import { extractName } from "@/lib/utils";

interface Product {
    id: string;
    name: string | Record<string, string>;
    price: number;
    image_url: string | null;
    is_available: boolean;
    sort_order: number;
}

interface Category {
    id: string;
    name: string | Record<string, string>;
    icon: string;
    products_count?: number;
    is_active: boolean;
    products?: Product[];
}

interface CategoryAccordionProps {
    category: Category;
    products: Product[];
    onToggleActive: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAddProduct: (categoryId: string) => void;
    onEditProduct: (product: Product) => void;
    menuName?: string;
}

// Helper to get Icon component dynamically
const getIcon = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    // @ts-ignore
    const Icon = Icons[iconName];
    return Icon || null;
};

export function CategoryAccordion({
    category,
    products,
    onToggleActive,
    onEdit,
    onDelete,
    onAddProduct,
    onEditProduct,
    menuName
}: CategoryAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = getIcon(category.icon);

    return (
        <div className={`bg-white border rounded-xl transition-all duration-200 ${isOpen ? 'ring-2 ring-primary/5 border-primary/20 shadow-lg' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}>
            {/* Header / Trigger */}
            <div
                className="flex items-center gap-4 p-4 cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="text-slate-400 cursor-grab active:cursor-grabbing p-1">
                    <GripVertical size={16} />
                </div>

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${category.is_active ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'}`}>
                    {Icon ? <Icon size={20} /> : <span className="text-sm font-bold">{(extractName(category.name) || '?').charAt(0).toUpperCase()}</span>}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-sm ${category.is_active ? 'text-slate-900' : 'text-slate-500'}`}>
                            {extractName(category.name)}
                        </h3>
                        {!category.is_active && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                                Inactivo
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        {products.length} productos
                        {menuName && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                                {menuName}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
                        className={`p-2 rounded-lg transition-colors ${category.is_active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`}
                        title={category.is_active ? 'Visible' : 'Oculto'}
                    >
                        {category.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                        title="Editar Categoría"
                    >
                        <Edit3 size={18} />
                    </button>

                    <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Accordion Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                    >
                        <div className="p-4 space-y-2">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-lg hover:border-slate-300 transition-colors group"
                                    >
                                        {/* Product Image */}
                                        <div className="w-10 h-10 rounded-md bg-slate-100 flex-shrink-0 overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={extractName(product.name)} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 truncate">{extractName(product.name)}</p>
                                            <p className="text-xs text-slate-500 font-medium">€{product.price.toFixed(2)}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEditProduct(product)}
                                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-md"
                                                title="Editar Producto"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">
                                    <p className="text-sm">Esta categoría está vacía</p>
                                </div>
                            )}

                            {/* Add Product Button */}
                            <button
                                onClick={() => onAddProduct(category.id)}
                                className="w-full flex items-center justify-center gap-2 py-3 mt-2 border-2 border-dashed border-primary/20 text-primary font-bold text-sm rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all"
                            >
                                <Plus size={16} />
                                Agregar Producto a {extractName(category.name)}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
