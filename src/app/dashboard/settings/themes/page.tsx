'use client'

export default function ThemesSettingsPage() {
    const themes = [
        { id: 'modern-minimal', name: 'Modern Minimal', color: '#16A34A', preview: '⬜' },
        { id: 'classic-bistro', name: 'Classic Bistro', color: '#1E3A8A', preview: '🔵' },
        { id: 'craft-bold', name: 'Craft & Bold', color: '#C27831', preview: '⬛' },
    ]

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Temas</h1>
                    <p className="text-gray-500 mt-1">Tenés 3 temas disponibles en tu plan</p>
                </div>

                {/* Themes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-primary transition-colors cursor-pointer overflow-hidden"
                        >
                            {/* Preview */}
                            <div
                                className="h-48 flex items-center justify-center text-6xl"
                                style={{ backgroundColor: `${theme.color}15` }}
                            >
                                {theme.preview}
                            </div>

                            {/* Info */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">{theme.name}</h3>
                                    <div
                                        className="w-6 h-6 rounded-full border-2 border-gray-200"
                                        style={{ backgroundColor: theme.color }}
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="theme"
                                        className="w-4 h-4 text-primary focus:ring-primary"
                                        defaultChecked={theme.id === 'modern-minimal'}
                                    />
                                    <span className="text-sm text-gray-600">Usar este tema</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                        Guardar cambios
                    </button>
                </div>

                {/* Upgrade Banner */}
                <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl border border-primary/20">
                    <p className="font-bold text-gray-900 mb-2">🎨 Upgrade a Pro para más temas</p>
                    <p className="text-sm text-gray-600">
                        Desbloquea 10+ temas premium y personalización avanzada
                    </p>
                </div>
            </div>
        </div>
    )
}
