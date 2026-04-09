'use client'

export default function HoursSettingsPage() {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Horarios generales</h1>
                    <p className="text-gray-500 mt-1">Configura los horarios de tu restaurante</p>
                </div>

                {/* Hours Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="space-y-4">
                        {days.map((day) => (
                            <div
                                key={day}
                                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl"
                            >
                                <div className="w-32">
                                    <p className="font-semibold text-gray-900">{day}</p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        defaultValue="09:00"
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <span className="text-gray-400">—</span>
                                    <input
                                        type="time"
                                        defaultValue="23:00"
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                            Guardar cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
