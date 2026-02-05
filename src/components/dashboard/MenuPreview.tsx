"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Star, Clock, ChevronRight, ShoppingCart, Image as ImageIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface Product {
    id: string;
    name_es: string;
    name_en: string | null;
    description_es: string | null;
    price: number;
    compare_price: number | null;
    image_url: string | null;
    is_available: boolean;
    is_featured: boolean;
}

interface Category {
    id: string;
    name_es: string;
    icon: string;
    is_active: boolean;
    products?: Product[];
}

interface Restaurant {
    name: string;
    address: string;
}

interface MenuPreviewProps {
    restaurant: Restaurant | null;
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
}

const getIcon = (iconName: string) => {
    // @ts-ignore
    const Icon = Icons[iconName] || Icons.Utensils;
    return Icon;
};

export function MenuPreview({ restaurant, categories, isOpen, onClose }: MenuPreviewProps) {
    // Basic Theme Colors (Mock for now, can be dynamic later)
    const themeColor = "bg-emerald-600";
    const themeText = "text-emerald-600";

    const activeCategories = categories.filter(c => c.is_active);
    const featuredProducts = activeCategories
        .flatMap(c => c.products || [])
        .filter(p => p.is_featured)
        .slice(0, 5); // Limit to top 5

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isOpen ? "400px" : 0, opacity: isOpen ? 1 : 0 }}
            className={`fixed right-0 top-0 h-screen bg-slate-100 z-50 shadow-2xl overflow-hidden flex flex-col border-l border-slate-200 transition-all duration-300 font-sans`}
        >
            {/* Sidebar Header */}
            <div className="p-4 bg-white border-b flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-slate-800">Vista Previa en Vivo</span>
                <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800">Cerrar</button>
            </div>

            {/* Mobile Mockup Container */}
            <div className="flex-1 overflow-y-auto p-4 content-center flex justify-center bg-slate-100">
                <div className="w-[340px] h-[700px] bg-white rounded-[3rem] shadow-xl border-[8px] border-slate-900 overflow-hidden relative flex flex-col">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>

                    {/* App Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-20">

                        {/* Hero / Header */}
                        <div className={`h-40 ${themeColor} flex flex-col justify-end p-6 text-white shadow-sm z-10`}>
                            <h2 className="font-bold text-2xl">{restaurant?.name || "Restaurante"}</h2>
                            <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                                <MapPin size={14} />
                                <span>{restaurant?.address || "Ubicación del local"}</span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="px-6 py-4 bg-white z-20">
                            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3 border border-slate-200">
                                <Search size={18} className="text-slate-400" />
                                <span className="text-sm text-slate-400">¿Qué te apetece hoy?</span>
                            </div>
                        </div>

                        {/* Featured (Horizontal Scroll) */}
                        {featuredProducts.length > 0 && (
                            <div className="mt-2 pl-6">
                                <h3 className="font-bold text-slate-900 text-base mb-3">Destacados 🔥</h3>
                                <div className="flex gap-4 overflow-x-auto pb-4 pr-6 scrollbar-hide">
                                    {featuredProducts.map(product => (
                                        <div key={product.id} className="w-36 flex-shrink-0 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                                            <div className="h-28 bg-slate-100 relative">
                                                {product.image_url ? (
                                                    <img src={product.image_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ImageIcon size={24} />
                                                    </div>
                                                )}
                                                {/* Price Tag */}
                                                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                                                    €{product.price}
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <p className="text-sm font-bold truncate text-slate-800">{product.name_es}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">{product.name_en || "Delicioso plato"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories List */}
                        <div className="mt-4 px-6 space-y-4">
                            {/* Categories List without "Menu" title */}

                            {activeCategories.map(category => {
                                const Icon = getIcon(category.icon);
                                return (
                                    <details key={category.id} className="group" open>
                                        <summary className="flex items-center gap-3 mb-4 sticky top-0 bg-slate-100/95 backdrop-blur py-2 z-10 cursor-pointer list-none select-none">
                                            <div className={`w-8 h-8 rounded-lg ${themeColor} bg-opacity-10 text-emerald-700 flex items-center justify-center transition-transform group-open:rotate-0`}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 flex items-center justify-between">
                                                <h4 className="font-bold text-slate-800 text-lg">{category.name_es}</h4>
                                                <ChevronRight size={16} className="text-slate-400 transition-transform group-open:rotate-90" />
                                            </div>
                                        </summary>

                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                            {/* @ts-ignore */}
                                            {(category.products || []).filter(p => p.is_available).map(product => (
                                                <div key={product.id} className="flex gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer">
                                                    <div className="h-20 w-20 bg-slate-100 rounded-md flex-shrink-0 overflow-hidden">
                                                        {product.image_url && <img src={product.image_url} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col py-1">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">{product.name_es}</p>
                                                            <span className="text-sm font-bold text-emerald-600">€{product.price}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description_es}</p>
                                                    </div>
                                                    <button className={`absolute bottom-2 right-2 w-7 h-7 rounded-full ${themeColor} text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                                                        <Icons.Plus size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {/* @ts-ignore */}
                                            {(category.products || []).filter(p => p.is_available).length === 0 && (
                                                <div className="text-xs text-slate-400 italic pl-2 py-2">Sin productos disponibles</div>
                                            )}
                                        </div>
                                    </details>
                                )
                            })}
                        </div>
                    </div>

                    {/* Bottom Nav Mockup */}
                    <div className="absolute bottom-0 w-full h-16 bg-white border-t border-slate-100 flex items-center justify-around px-4 z-20">
                        <div className={`flex flex-col items-center gap-1 ${themeText}`}>
                            <div className="w-5 h-5 bg-current rounded-full opacity-20" />
                            <span className="text-[10px] font-bold">Inicio</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-slate-300">
                            <div className="w-5 h-5 bg-current rounded-full opacity-20" />
                            <span className="text-[10px] font-bold">Buscar</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-slate-300">
                            <div className="w-5 h-5 bg-current rounded-full opacity-20" />
                            <span className="text-[10px] font-bold">Cuenta</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function PlusIcon({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
