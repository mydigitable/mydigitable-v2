'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function MenuPage() {
    const params = useParams()
    const router = useRouter()
    const menuId = params?.menuId as string

    useEffect(() => {
        // Redirect to productos tab by default
        if (menuId) {
            router.replace(`/dashboard/menu/${menuId}/productos`)
        }
    }, [menuId, router])

    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl mb-3">🔄</div>
                <p className="text-gray-600">Redirigiendo...</p>
            </div>
        </div>
    )
}
