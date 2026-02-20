'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
    icon: string
    title: string
    description: string
    action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md">{description}</p>
            {action && <div>{action}</div>}
        </div>
    )
}
