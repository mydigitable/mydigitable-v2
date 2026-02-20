'use client'

export default function AccountSettingsPage() {
    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Mi cuenta</h1>
                    <p className="text-gray-500 mt-1">Gestiona tu información personal y plan</p>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Información de la cuenta</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                defaultValue="usuario@ejemplo.com"
                                disabled
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                El email no se puede cambiar
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cambiar contraseña
                            </label>
                            <button className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                Cambiar contraseña
                            </button>
                        </div>
                    </div>
                </div>

                {/* Plan Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Plan actual</h2>

                    <div className="flex items-center justify-between p-6 bg-primary/5 rounded-xl border border-primary/20">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-primary text-white text-sm font-bold rounded-full">
                                    PLAN BÁSICO
                                </span>
                                <span className="text-sm text-gray-500">€9.90/mes</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Menú QR · 3 temas · Hasta 3 staff · Pagos Stripe
                            </p>
                        </div>
                        <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                            Ver planes
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium">
                            💡 Upgrade a Pro
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                            Desbloquea mesa compartida, KDS cocina, IA importar menú y más
                        </p>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-red-100 p-8">
                    <h2 className="text-lg font-bold text-red-600 mb-4">Zona de peligro</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, está seguro.
                    </p>
                    <button className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-colors">
                        Eliminar cuenta
                    </button>
                </div>
            </div>
        </div>
    )
}
