'use client'

import { EmptyState } from '@/components/dashboard/EmptyState'
import { CheckCircle } from 'lucide-react'

export default function CompletedOrdersPage() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Pedidos Completados</h1>
                    <p className="text-gray-500 mt-1">Pedidos finalizados y entregados</p>
                </div>

                {/* Empty State */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <EmptyState
                        icon="✅"
                        title="No hay pedidos completados"
                        description="Los pedidos finalizados aparecerán aquí"
                    />
                </div>
            </div>
        </div>
    )
}
