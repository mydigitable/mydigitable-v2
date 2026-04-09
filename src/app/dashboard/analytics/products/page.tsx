"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    UtensilsCrossed,
    TrendingUp,
    Star,
    Download,
    Loader2,
    ChevronUp,
    ChevronDown,
} from "lucide-react";

function extractName(name: unknown): string {
    if (!name) return '';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name !== null) {
        const n = name as Record<string, string>;
        return n.es || n.en || Object.values(n)[0] || '';
    }
    return '';
}

interface ProductStat {
    id: string;
    name: string;
    category: string;
    sold: number;
    revenue: number;
    trend: number;
}

export default function ProductsAnalyticsPage() {
    const [products, setProducts] = useState<ProductStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'sold' | 'revenue'>('sold');

    const supabase = createClient();

    useEffect(() => {
        loadProductStats();
    }, []);

    const loadProductStats = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .single();

        if (restaurant) {
            // Get products with order items count
            const { data: productData } = await supabase
                .from("products")
                .select(`
                    id,
                    name,
                    price,
                    category:menu_categories(name)
                `)
                .eq("restaurant_id", restaurant.id);

            if (productData) {
                // Simulate stats (in a real app, this would come from order_items aggregation)
                const stats: ProductStat[] = productData.map(p => ({
                    id: p.id,
                    name: extractName((p as any).name),
                    category: extractName((p.category as any)?.name) || 'Sin categoría',
                    sold: Math.floor(Math.random() * 100),
                    revenue: Math.floor(Math.random() * 500),
                    trend: Math.random() * 40 - 10,
                }));
                setProducts(stats);
            }
        }
        setLoading(false);
    };

    const sortedProducts = [...products].sort((a, b) =>
        sortBy === 'sold' ? b.sold - a.sold : b.revenue - a.revenue
    );

    const topProducts = sortedProducts.slice(0, 10);

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Análisis de Productos</h1>
                    <p className="text-slate-500 mt-1">Descubre qué productos venden más</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                    <Download size={18} />
                    Exportar
                </button>
            </div>

            {/* Sort Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setSortBy('sold')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${sortBy === 'sold'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    Por Unidades
                </button>
                <button
                    onClick={() => setSortBy('revenue')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${sortBy === 'revenue'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    Por Ingresos
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <UtensilsCrossed className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sin datos de productos</h3>
                    <p className="text-slate-500">Los análisis aparecerán cuando tengas pedidos</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Top 10 Productos</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {topProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{product.name}</p>
                                    <p className="text-sm text-slate-500">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">
                                        {sortBy === 'sold' ? `${product.sold} uds` : `${product.revenue}€`}
                                    </p>
                                    <div className={`flex items-center justify-end gap-1 text-xs font-bold ${product.trend >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {product.trend >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        {Math.abs(product.trend).toFixed(1)}%
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

