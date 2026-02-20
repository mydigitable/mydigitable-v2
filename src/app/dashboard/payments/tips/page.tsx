'use client'

import { EmptyState } from '@/components/dashboard/EmptyState'
import { Gift } from 'lucide-react'

export default function TipsPage() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Propinas</h1>
                    <p className="text-gray-500 mt-1">Gestiona las propinas digitales</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Propinas hoy</p>
                        <p className="text-3xl font-black text-gray-900">€0.00</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Propinas este mes</p>
                        <p className="text-3xl font-black text-gray-900">€0.00</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Promedio por pedido</p>
                        <p className="text-3xl font-black text-gray-900">€0.00</p>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <EmptyState
                        icon="💰"
                        title="No hay propinas registradas"
                        description="Las propinas digitales aparecerán aquí cuando los clientes las dejen"
                    />
                </div>
            </div>
        </div>
    )
}
