'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'

interface LockedFeatureProps {
    icon?: string
    title: string
    description: string
    requiredPlan: 'pro' | 'premium'
}

export function LockedFeature({ icon, title, description, requiredPlan }: LockedFeatureProps) {
    return (
        <div className="relative group">
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 opacity-60">
                <div className="flex items-center gap-3">
                    {icon && <span className="text-2xl grayscale">{icon}</span>}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-700">{title}</h4>
                            <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase">
                        {requiredPlan}
                    </span>
                </div>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                    Disponible en Plan {requiredPlan === 'pro' ? 'Pro' : 'Premium'}
                </div>
            </div>
        </div>
    )
}
