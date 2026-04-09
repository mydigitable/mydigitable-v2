'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { t } from '@/lib/utils/translation'

type Menu = {
    id: string
    name: string | { es: string; en?: string }
    type: string
    is_active: boolean
    schedule: any
    restaurant_id: string
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()
    const menuId = params?.menuId as string
    const [menu, setMenu] = useState<Menu | null>(null)
    const [allMenus, setAllMenus] = useState<Menu[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadMenu()
    }, [menuId])

    async function loadMenu() {
        if (!menuId) return

        const { data, error } = await supabase
            .from('menus')
            .select('*')
            .eq('id', menuId)
            .single()

        if (error) {
            console.error('Error loading menu:', error)
            router.push('/dashboard/menu')
            return
        }

        setMenu(data)

        // Load all menus for the dropdown
        const { data: menusData } = await supabase
            .from('menus')
            .select('*')
            .eq('restaurant_id', data.restaurant_id)
            .order('display_order')

        if (menusData) {
            setAllMenus(menusData)
        }

        setLoading(false)
    }

    function handleMenuChange(newMenuId: string) {
        // Extract current path segment after menuId
        const pathParts = pathname.split('/')
        const menuIdIndex = pathParts.indexOf(menuId)
        const remainingPath = pathParts.slice(menuIdIndex + 1).join('/')

        // Navigate to same section but different menu
        router.push(`/dashboard/menu/${newMenuId}/${remainingPath}`)
    }

    function handleBack() {
        router.push('/dashboard/menu')
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="text-4xl mb-3">🍽️</div>
                    <p className="text-gray-600">Cargando menú...</p>
                </div>
            </div>
        )
    }

    if (!menu) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="text-4xl mb-3">⚠️</div>
                    <p className="text-gray-600 mb-4">Menú no encontrado</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Volver a menús
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Volver a menús</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300" />
                    <div>
                        {allMenus.length > 1 ? (
                            <div className="relative">
                                <select
                                    value={menuId}
                                    onChange={(e) => handleMenuChange(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 text-gray-900 font-bold text-2xl px-4 py-1 pr-10 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    {allMenus.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {t(m.name)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900 pointer-events-none" />
                            </div>
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-900">{t(menu.name)}</h1>
                        )}
                        <p className="text-sm text-gray-500">
                            {menu.is_active ? (
                                <span className="text-emerald-600">● Activo</span>
                            ) : (
                                <span className="text-gray-400">○ Inactivo</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content (navigation is in sidebar) */}
            <div className="flex-1 overflow-hidden">{children}</div>
        </div>
    )
}
