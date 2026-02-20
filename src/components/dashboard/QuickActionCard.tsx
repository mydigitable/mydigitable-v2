'use client'

import { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface QuickActionCardProps {
    icon: LucideIcon
    title: string
    description: string
    buttonText: string
    onClick: () => void
    variant?: 'default' | 'primary'
}

export function QuickActionCard({
    icon: Icon,
    title,
    description,
    buttonText,
    onClick,
    variant = 'default'
}: QuickActionCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${variant === 'primary' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{description}</p>
                    <button
                        onClick={onClick}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                    >
                        {buttonText}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
