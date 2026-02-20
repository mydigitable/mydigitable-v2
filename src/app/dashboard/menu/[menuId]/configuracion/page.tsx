'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MenuScheduleEditor } from '../../components/MenuScheduleEditor'
import { Trash2 } from 'lucide-react'
import { t } from '@/lib/utils/translation'

const MENU_TYPES = [
    { id: 'general', label: 'General', emoji: '🍽️' },
    { id: 'breakfast', label: 'Desayunos', emoji: '🌅' },
    { id: 'lunch', label: 'Almuerzos', emoji: '☀️' },
    { id: 'dinner', label: 'Cenas', emoji: '🌙' },
    { id: 'tasting', label: 'Degustación', emoji: '✨' },
    { id: 'drinks', label: 'Bebidas', emoji: '🍷' },
    { id: 'desserts', label: 'Postres', emoji: '🍰' },
    { id: 'happy_hour', label: 'Happy Hour', emoji: '🍹' },
]

type Menu = {
    id: string
    name: string | { es: string; en?: string }
    type: string
    is_active: boolean
    schedule: any
    restaurant_id: string
}

export default function ConfiguracionPage() {
    const params = useParams()
    const router = useRouter()
    const menuId = params?.menuId as string
    const supabase = createClient()

    const [menu, setMenu] = useState<Menu | null>(null)
    const [name, setName] = useState('')
    const [type, setType] = useState('general')
    const [isActive, setIsActive] = useState(true)
    const [schedule, setSchedule] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')

    useEffect(() => {
        loadMenu()
    }, [menuId])

    async function loadMenu() {
        const { data } = await supabase.from('menus').select('*').eq('id', menuId).single()
        if (data) {
            setMenu(data)
            setName(t(data.name))
            setType(data.type || 'general')
            setIsActive(data.is_active)
            setSchedule(data.schedule)
        }
    }

    async function handleSave() {
        setIsSaving(true)
        setSaveMessage('')

        try {
            const { error } = await supabase
                .from('menus')
                .update({
                    name: name.trim(),
                    type,
                    is_active: isActive,
                    schedule,
                })
                .eq('id', menuId)

            if (error) throw error

            setSaveMessage('✓ Cambios guardados')
            setTimeout(() => setSaveMessage(''), 3000)

            // Reload to update header
            loadMenu()
        } catch (error) {
            console.error('Error saving menu:', error)
            setSaveMessage('✗ Error al guardar')
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete() {
        if (!confirm(`¿Estás seguro de eliminar el menú "${name}"? Esta acción no se puede deshacer.`)) {
            return
        }

        try {
            const { error } = await supabase.from('menus').delete().eq('id', menuId)
            if (error) throw error
            router.push('/dashboard/menu')
        } catch (error) {
            console.error('Error deleting menu:', error)
            alert('Error al eliminar el menú')
        }
    }

    if (!menu) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-600">Cargando...</p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Nombre del menú <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Ej: Carta de Verano"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo de menú</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {MENU_TYPES.map((menuType) => (
                                <option key={menuType.id} value={menuType.id}>
                                    {menuType.emoji} {menuType.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Menú activo</p>
                            <p className="text-xs text-gray-600">Los clientes pueden ver este menú</p>
                        </div>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Horario</label>
                        <MenuScheduleEditor schedule={schedule} onChange={setSchedule} />
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={!name.trim() || isSaving}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        {saveMessage && (
                            <span
                                className={`text-sm font-medium ${saveMessage.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'
                                    }`}
                            >
                                {saveMessage}
                            </span>
                        )}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-red-200 p-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Zona de peligro</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Eliminar este menú borrará todas sus categorías y productos. Esta acción no se puede deshacer.
                    </p>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar menú
                    </button>
                </div>
            </div>
        </div>
    )
}
