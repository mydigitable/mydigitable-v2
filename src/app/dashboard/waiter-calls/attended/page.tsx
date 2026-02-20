'use client'

import { EmptyState } from '@/components/dashboard/EmptyState'
import { History } from 'lucide-react'

export default function AttendedCallsPage() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Llamadas Atendidas</h1>
                    <p className="text-gray-500 mt-1">Historial de llamadas completadas</p>
                </div>

                {/* Empty State */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <EmptyState
                        icon="✅"
                        title="No hay llamadas atendidas"
                        description="El historial de llamadas completadas aparecerá aquí"
                    />
                </div>
            </div>
        </div>
    )
}
