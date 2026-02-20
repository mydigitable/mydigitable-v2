'use client'

export function ThemeSelector({ themes, currentTheme, onSelect, onClose }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Selecciona un tema</h2>
                        <p className="text-slate-600 text-sm mb-6">
                            El tema cambia los colores de tu menú digital visible para los clientes
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {themes.map((theme: any) => (
                        <button
                            key={theme.id}
                            onClick={() => onSelect(theme.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${currentTheme === theme.id
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-12 h-12 rounded-lg shadow-sm"
                                    style={{ backgroundColor: theme.colors.primary }}
                                />
                                <div>
                                    <div className="font-bold text-sm text-slate-900">{theme.name}</div>
                                    {currentTheme === theme.id && (
                                        <div className="text-xs text-green-600 font-medium mt-1">✓ Activo</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div
                                    className="w-6 h-6 rounded border border-slate-200"
                                    style={{ backgroundColor: theme.colors.bg }}
                                    title="Fondo"
                                />
                                <div
                                    className="w-6 h-6 rounded border border-slate-200"
                                    style={{ backgroundColor: theme.colors.primary }}
                                    title="Primario"
                                />
                                <div
                                    className="w-6 h-6 rounded border border-slate-200"
                                    style={{ backgroundColor: theme.colors.text }}
                                    title="Texto"
                                />
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    )
}
