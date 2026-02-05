"use client";

import { useState } from "react";
import { UtensilsCrossed, Plus, FolderPlus, Package, Image } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

export function Step8Menu({ data, onUpdate }: Props) {
    const [category, setCategory] = useState(data.first_category || "");
    const [products, setProducts] = useState<{ name: string; price: string }[]>(
        data.first_products || []
    );
    const [newProduct, setNewProduct] = useState({ name: "", price: "" });

    const updateCategory = (value: string) => {
        setCategory(value);
        onUpdate({ first_category: value });
    };

    const addProduct = () => {
        if (!newProduct.name || !newProduct.price) return;
        const updated = [...products, newProduct];
        setProducts(updated);
        onUpdate({ first_products: updated });
        setNewProduct({ name: "", price: "" });
    };

    const suggestedCategories = [
        "🍕 Pizzas",
        "🍔 Hamburguesas",
        "🥗 Ensaladas",
        "🍝 Pastas",
        "🍣 Sushi",
        "🥤 Bebidas",
        "🍺 Cervezas",
        "🍷 Vinos",
        "🧁 Postres",
        "☕ Cafés",
    ];

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-500 text-center">
                Crea tu primera categoría y algunos productos de ejemplo.
                <br />
                <span className="text-xs">Podrás agregar más desde el dashboard.</span>
            </p>

            {/* Categoría */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <FolderPlus size={12} />
                    Primera categoría
                </label>

                <input
                    type="text"
                    value={category}
                    onChange={(e) => updateCategory(e.target.value)}
                    placeholder="Ej: Entrantes, Platos principales..."
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                />

                {/* Sugerencias */}
                {!category && (
                    <div className="flex flex-wrap gap-2">
                        {suggestedCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => updateCategory(cat)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-600 transition-all"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Productos */}
            {category && (
                <div className="space-y-4 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                        <Package size={12} />
                        Productos en "{category}"
                    </label>

                    {/* Lista de productos */}
                    {products.length > 0 && (
                        <div className="space-y-2">
                            {products.map((product, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                                            <UtensilsCrossed size={16} className="text-slate-400" />
                                        </div>
                                        <span className="font-bold text-slate-900">{product.name}</span>
                                    </div>
                                    <span className="font-black text-primary">{product.price}€</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Agregar producto */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
                            placeholder="Nombre del producto"
                            className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-medium"
                        />
                        <input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))}
                            placeholder="€"
                            step="0.01"
                            className="w-20 h-12 px-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-center"
                        />
                        <button
                            onClick={addProduct}
                            disabled={!newProduct.name || !newProduct.price}
                            className="h-12 px-4 bg-primary text-white rounded-xl font-bold disabled:opacity-50 transition-all"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {products.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-2">
                            Agrega al menos un producto de ejemplo
                        </p>
                    )}
                </div>
            )}

            {/* Tip */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200/50 mt-4">
                <div className="text-2xl">💡</div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">Tip</p>
                    <p className="text-xs text-slate-600">
                        También puedes importar tu menú desde Excel después
                    </p>
                </div>
            </div>
        </div>
    );
}
