'use client'

import { useEffect, useState } from 'react'

type AIStatus = 'idle' | 'thinking' | 'done' | 'error'

type AIIndicatorProps = {
    status: AIStatus
    className?: string
}

export function AIIndicator({ status, className = '' }: AIIndicatorProps) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        if (status === 'done') {
            const timer = setTimeout(() => setVisible(false), 4000)
            return () => clearTimeout(timer)
        } else if (status === 'error') {
            const timer = setTimeout(() => setVisible(false), 3000)
            return () => clearTimeout(timer)
        } else {
            setVisible(true)
        }
    }, [status])

    if (status === 'idle' || !visible) return null

    if (status === 'thinking') {
        return (
            <div className={`atelier-ai-indicator ${className}`}>
                <div className="flex gap-1">
                    <div className="atelier-ai-dot" style={{ animationDelay: '0s' }} />
                    <div className="atelier-ai-dot" style={{ animationDelay: '0.15s' }} />
                    <div className="atelier-ai-dot" style={{ animationDelay: '0.3s' }} />
                </div>
                <span>Analizando el plato...</span>
            </div>
        )
    }

    if (status === 'done') {
        return (
            <div className={`atelier-ai-indicator ${className}`}>
                <span>✦</span>
                <span>Campos completados por IA</span>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className={`atelier-ai-indicator atelier-ai-indicator-error ${className}`}>
                <span>○</span>
                <span>No se pudo conectar con la IA</span>
            </div>
        )
    }

    return null
}
