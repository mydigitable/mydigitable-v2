'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { Settings, FolderOpen, UtensilsCrossed, Plus, Palette } from 'lucide-react'

type Tab = {
    id: string
    label: string
    icon: React.ReactNode
    path: string
}

const TABS: Tab[] = [
    {
        id: 'configuracion',
        label: 'Configuración',
        icon: <Settings className="w-4 h-4" />,
        path: 'configuracion',
    },
    {
        id: 'categorias',
        label: 'Categorías',
        icon: <FolderOpen className="w-4 h-4" />,
        path: 'categorias',
    },
    {
        id: 'productos',
        label: 'Productos',
        icon: <UtensilsCrossed className="w-4 h-4" />,
        path: 'productos',
    },
    // Future tabs (commented out for now)
    // {
    //   id: 'extras',
    //   label: 'Extras',
    //   icon: <Plus className="w-4 h-4" />,
    //   path: 'extras',
    // },
    // {
    //   id: 'tema',
    //   label: 'Tema',
    //   icon: <Palette className="w-4 h-4" />,
    //   path: 'tema',
    // },
]

export function TabNavigation() {
    const params = useParams()
    const pathname = usePathname()
    const router = useRouter()
    const menuId = params?.menuId as string

    // Determine active tab from pathname
    const activeTab = TABS.find((tab) => pathname?.includes(`/${tab.path}`))?.id || 'productos'

    function handleTabClick(tabPath: string) {
        router.push(`/dashboard/menu/${menuId}/${tabPath}`)
    }

    return (
        <div className="border-b border-gray-200 bg-white">
            <nav className="flex gap-1 px-6" aria-label="Tabs">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.path)}
                            className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${isActive
                                    ? 'border-emerald-500 text-emerald-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
              `}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}
