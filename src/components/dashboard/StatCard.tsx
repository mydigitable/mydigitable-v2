'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    subtitle?: string
    trend?: {
        value: number
        isPositive: boolean
    }
}

export function StatCard({ icon: Icon, label, value, subtitle, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                {trend && (
                    <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-black text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
    )
}
