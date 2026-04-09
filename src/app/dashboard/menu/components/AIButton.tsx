'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface AIButtonProps {
    onClick: () => Promise<void>
    label: string
    disabled?: boolean
    size?: 'sm' | 'md'
}

export function AIButton({ onClick, label, disabled = false, size = 'md' }: AIButtonProps) {
    const [loading, setLoading] = useState(false)

    async function handleClick() {
        setLoading(true)
        try {
            await onClick()
        } finally {
            setLoading(false)
        }
    }

    const sizeClasses = size === 'sm'
        ? 'px-3 py-1.5 text-sm'
        : 'px-4 py-2 text-sm'

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || loading}
            className={`${sizeClasses} bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow-md`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Generando...' : label}
        </button>
    )
}
