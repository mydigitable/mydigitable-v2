'use client'

import { CreditCard, Banknote, Smartphone } from 'lucide-react'

export default function PaymentMethodsPage() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Métodos de pago</h1>
                    <p className="text-gray-500 mt-1">Configura cómo aceptas pagos</p>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="space-y-6">
                        {[
                            {
                                name: 'Tarjeta (Stripe)',
                                icon: CreditCard,
                                description: 'Acepta tarjetas de crédito y débito',
                                enabled: true
                            },
                            {
                                name: 'Efectivo',
                                icon: Banknote,
                                description: 'Pago en efectivo al recibir',
                                enabled: true
                            },
                            {
                                name: 'Apple Pay / Google Pay',
                                icon: Smartphone,
                                description: 'Pagos móviles',
                                enabled: false
                            },
                        ].map((method) => (
                            <div
                                key={method.name}
                                className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <method.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{method.name}</h3>
                                        <p className="text-sm text-gray-500">{method.description}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        defaultChecked={method.enabled}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium">
                            💡 Configuración de Stripe
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                            Conecta tu cuenta de Stripe en Configuración → General para aceptar pagos con tarjeta
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
