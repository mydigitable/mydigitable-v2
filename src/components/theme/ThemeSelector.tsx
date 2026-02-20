'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemePreviewCard } from './ThemePreviewCard'
import { ThemeCustomizer } from './ThemeCustomizer'
import { THEMES } from '@/lib/theme/themes'
import { applyThemeToDocument } from '@/lib/theme/apply-theme'
import type { ThemeOverrides } from '@/lib/theme/types'

interface ThemeSelectorProps {
    defaultThemeId?: string
    onThemeChange: (themeId: string, overrides: ThemeOverrides) => void
}

export function ThemeSelector({ defaultThemeId = 'modern-minimal', onThemeChange }: ThemeSelectorProps) {
    const [selectedId, setSelectedId] = useState(defaultThemeId)
    const [showCustomizer, setShowCustomizer] = useState(false)
    const [overrides, setOverrides] = useState<ThemeOverrides>({})

    const handleSelect = (themeId: string) => {
        setSelectedId(themeId)
        setOverrides({}) // Reset overrides when changing theme
        applyThemeToDocument(themeId)
        onThemeChange(themeId, {})
    }

    const handleOverrideChange = (newOverrides: ThemeOverrides) => {
        setOverrides(newOverrides)
        applyThemeToDocument(selectedId, newOverrides)
        onThemeChange(selectedId, newOverrides)
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    Elige el estilo de tu menú
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Podrás cambiarlo en cualquier momento desde Settings
                </p>
            </div>

            {/* Theme grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {THEMES.map((theme) => (
                    <ThemePreviewCard
                        key={theme.id}
                        theme={theme}
                        isSelected={selectedId === theme.id}
                        onSelect={handleSelect}
                    />
                ))}
            </div>

            {/* Customize button */}
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="w-full mt-4 py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
                {showCustomizer ? '▲ Ocultar personalización' : '✏️ Personalizar color, fuente y tamaño'}
            </motion.button>

            {/* Customizer panel */}
            <AnimatePresence>
                {showCustomizer && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ThemeCustomizer
                            themeId={selectedId}
                            overrides={overrides}
                            onChange={handleOverrideChange}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
