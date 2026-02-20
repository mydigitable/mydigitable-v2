'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ThemeDefinition } from '@/lib/theme/types'

interface ThemePreviewCardProps {
    theme: ThemeDefinition
    isSelected: boolean
    onSelect: (themeId: string) => void
}

export function ThemePreviewCard({ theme, isSelected, onSelect }: ThemePreviewCardProps) {
    const t = theme.tokens

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(theme.id)}
            className="relative w-full text-left focus:outline-none"
        >
            {/* Selected ring */}
            {isSelected && (
                <motion.div
                    layoutId="selected-ring"
                    className="absolute inset-0 rounded-2xl ring-2 ring-offset-2 z-10 pointer-events-none"
                    style={{ ringColor: `rgb(${t.colorPrimary})` }}
                />
            )}

            {/* Card */}
            <div
                className="rounded-2xl overflow-hidden border transition-all duration-200"
                style={{
                    background: `rgb(${t.colorBackground})`,
                    borderColor: isSelected ? `rgb(${t.colorPrimary})` : `rgb(${t.colorBorder})`,
                    boxShadow: isSelected ? `0 0 0 2px rgb(${t.colorPrimary})` : t.shadowSm,
                }}
            >
                {/* Mini Phone Preview */}
                <div
                    className="w-full aspect-[9/16] relative overflow-hidden"
                    style={{ maxHeight: '200px', background: `rgb(${t.colorBackground})` }}
                >
                    {/* Header mini */}
                    <div
                        className="w-full px-3 py-2 flex items-center justify-between"
                        style={{ background: t.headerBackground }}
                    >
                        <div
                            className="text-xs font-bold tracking-wide"
                            style={{
                                fontFamily: t.fontHeading,
                                color: `rgb(${t.headerTextColor})`,
                            }}
                        >
                            MYDIGITABLE
                        </div>
                        <div
                            className="w-4 h-4 rounded"
                            style={{ background: `rgb(${t.colorPrimary})`, opacity: 0.8 }}
                        />
                    </div>

                    {/* Search bar mini */}
                    <div className="px-3 py-2">
                        <div
                            className="w-full h-5 rounded-full"
                            style={{ background: `rgb(${t.colorBorder})` }}
                        />
                    </div>

                    {/* Category pills mini */}
                    <div className="px-3 flex gap-1.5">
                        <div
                            className="px-2 py-0.5 rounded-full text-[8px]"
                            style={{
                                background: `rgb(${t.categoryActiveBackground})`,
                                color: `rgb(${t.categoryActiveText})`,
                                fontFamily: t.fontBody,
                            }}
                        >
                            All
                        </div>
                        {['Starters', 'Mains'].map(cat => (
                            <div
                                key={cat}
                                className="px-2 py-0.5 rounded-full text-[8px]"
                                style={{
                                    background: `rgb(${t.colorBorder})`,
                                    color: `rgb(${t.colorTextSecondary})`,
                                    fontFamily: t.fontBody,
                                }}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>

                    {/* Product grid mini */}
                    <div className="px-3 py-2 grid grid-cols-2 gap-2">
                        {[
                            { name: 'Avocado Toast', price: '€14.50' },
                            { name: 'Salmon Bowl', price: '€18.90' },
                        ].map((product, i) => (
                            <div
                                key={i}
                                className="rounded overflow-hidden"
                                style={{
                                    background: `rgb(${t.colorSurface})`,
                                    boxShadow: t.shadowSm,
                                    borderRadius: t.radiusMd,
                                }}
                            >
                                <div
                                    className="w-full aspect-square"
                                    style={{
                                        background: `rgb(${t.colorBorder})`,
                                        opacity: 0.5,
                                    }}
                                />
                                <div className="p-1">
                                    <div
                                        className="text-[7px] leading-tight truncate"
                                        style={{
                                            fontFamily: t.fontBody,
                                            color: `rgb(${t.colorTextPrimary})`,
                                        }}
                                    >
                                        {product.name}
                                    </div>
                                    <div
                                        className="text-[7px] font-bold mt-0.5"
                                        style={{
                                            fontFamily: t.fontPrice,
                                            color: `rgb(${t.colorPrimary})`,
                                        }}
                                    >
                                        {product.price}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating cart mini */}
                    <div className="absolute bottom-2 right-3">
                        <div
                            className="px-2 py-1 rounded-full text-[7px] font-bold flex items-center gap-1"
                            style={{
                                background: `rgb(${t.cartButtonBackground})`,
                                color: `rgb(${t.cartButtonText})`,
                                fontFamily: t.fontBody,
                                boxShadow: t.shadowMd,
                            }}
                        >
                            🛒 VIEW CART
                        </div>
                    </div>
                </div>

                {/* Theme info */}
                <div
                    className="p-4"
                    style={{ background: `rgb(${t.colorSurface})` }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h3
                                className="font-bold text-sm"
                                style={{
                                    fontFamily: t.fontHeading,
                                    color: `rgb(${t.colorTextPrimary})`,
                                }}
                            >
                                {theme.name}
                            </h3>
                            <p
                                className="text-xs mt-0.5 leading-snug"
                                style={{ color: `rgb(${t.colorTextSecondary})` }}
                            >
                                {theme.description}
                            </p>
                            <p
                                className="text-xs mt-1"
                                style={{ color: `rgb(${t.colorTextMuted})` }}
                            >
                                {theme.targetRestaurant}
                            </p>
                        </div>

                        {isSelected && (
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: `rgb(${t.colorPrimary})` }}
                            >
                                <Check className="w-3 h-3" style={{ color: `rgb(${t.colorPrimaryText})` }} />
                            </div>
                        )}
                    </div>

                    {/* Color dot */}
                    <div className="mt-3 flex items-center gap-1.5">
                        <div
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{
                                background: `rgb(${t.colorPrimary})`,
                                boxShadow: `0 0 0 1px rgb(${t.colorBorder})`,
                            }}
                        />
                        <span
                            className="text-xs"
                            style={{ color: `rgb(${t.colorTextMuted})` }}
                        >
                            Color personalizable
                        </span>
                    </div>
                </div>
            </div>
        </motion.button>
    )
}
