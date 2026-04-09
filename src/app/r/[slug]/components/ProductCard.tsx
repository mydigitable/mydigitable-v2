"use client";

import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import type { Product, Theme } from "../types";

function extractName(name: unknown): string {
    if (!name) return '';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name !== null) {
        const n = name as Record<string, string>;
        return n.es || n.en || Object.values(n)[0] || '';
    }
    return '';
}

function extractDesc(desc: unknown): string | null {
    if (!desc) return null;
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && desc !== null) {
        const d = desc as Record<string, string>;
        return d.es || d.en || Object.values(d)[0] || null;
    }
    return null;
}

interface ProductCardProps {
    product: Product;
    theme: Theme;
    onAdd: () => void;
    onSelect: () => void;
    quantity: number;
}

export default function ProductCard({
    product,
    theme,
    onAdd,
    onSelect,
    quantity,
}: ProductCardProps) {
    return (
        <motion.div
            layout
            className={`${theme.cardBg} rounded-2xl overflow-hidden border ${theme.border}`}
        >
            <div className="flex">
                {product.image_url && (
                    <div className="w-28 h-28 flex-shrink-0">
                        <img
                            src={product.image_url}
                            alt={extractName(product.name)}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div onClick={onSelect} className="cursor-pointer">
                        <div className="flex items-start gap-2 mb-1">
                            <h3 className={`font-bold ${theme.text} flex-1`}>{extractName(product.name)}</h3>
                            {/* Dietary icons */}
                            <div className="flex gap-1">
                                {product.dietary_tags?.includes('vegan') && <span title="Vegano">🌱</span>}
                                {product.dietary_tags?.includes('vegetarian') && !product.dietary_tags?.includes('vegan') && <span title="Vegetariano">🥬</span>}
                                {product.dietary_tags?.includes('gluten_free') && <span title="Sin gluten">🌾</span>}
                            </div>
                        </div>
                        {extractDesc(product.description) && (
                            <p className={`text-sm ${theme.textSecondary} line-clamp-2`}>
                                {extractDesc(product.description)}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div>
                            <span className={`font-black ${theme.primaryText}`}>€{product.price}</span>
                        </div>
                        {quantity > 0 ? (
                            <div className={`flex items-center gap-3 ${theme.primary} text-white rounded-full px-2 py-1`}>
                                <button onClick={(e) => { e.stopPropagation(); }} className="p-1">
                                    <Minus size={14} />
                                </button>
                                <span className="font-bold min-w-[1.5rem] text-center">{quantity}</span>
                                <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="p-1">
                                    <Plus size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                className={`${theme.primary} text-white w-8 h-8 rounded-full flex items-center justify-center`}
                            >
                                <Plus size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
