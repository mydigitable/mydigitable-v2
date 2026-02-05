"use client";

import { useState } from "react";
import { CreditCard, Printer, Truck, FileSpreadsheet, ExternalLink, Check } from "lucide-react";

const integrations = [
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'Pagos con tarjeta de crédito y débito',
        icon: CreditCard,
        color: 'bg-purple-500',
        status: 'connected',
    },
    {
        id: 'printer',
        name: 'Impresora de Tickets',
        description: 'Imprime comandas automáticamente',
        icon: Printer,
        color: 'bg-slate-600',
        status: 'available',
    },
    {
        id: 'glovo',
        name: 'Glovo',
        description: 'Sincroniza pedidos de Glovo',
        icon: Truck,
        color: 'bg-amber-500',
        status: 'available',
    },
    {
        id: 'ubereats',
        name: 'Uber Eats',
        description: 'Sincroniza pedidos de Uber Eats',
        icon: Truck,
        color: 'bg-green-600',
        status: 'available',
    },
    {
        id: 'excel',
        name: 'Excel/CSV Export',
        description: 'Exporta datos a hojas de cálculo',
        icon: FileSpreadsheet,
        color: 'bg-emerald-600',
        status: 'connected',
    },
];

export default function IntegrationsSettingsPage() {
    const [connecting, setConnecting] = useState<string | null>(null);

    const handleConnect = (id: string) => {
        setConnecting(id);
        setTimeout(() => setConnecting(null), 2000);
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Integraciones</h1>
                <p className="text-slate-500 mt-1">Conecta con servicios externos</p>
            </div>

            <div className="grid gap-4">
                {integrations.map((integration) => (
                    <div
                        key={integration.id}
                        className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-xl ${integration.color}`}>
                            <integration.icon size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{integration.name}</h3>
                            <p className="text-sm text-slate-500">{integration.description}</p>
                        </div>
                        {integration.status === 'connected' ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm">
                                <Check size={16} />
                                Conectado
                            </div>
                        ) : (
                            <button
                                onClick={() => handleConnect(integration.id)}
                                disabled={connecting === integration.id}
                                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                {connecting === integration.id ? 'Conectando...' : 'Conectar'}
                                <ExternalLink size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <h3 className="font-bold text-slate-900 mb-2">¿Necesitas otra integración?</h3>
                <p className="text-slate-500 text-sm mb-4">
                    Contáctanos para solicitar nuevas integraciones o acceso a nuestra API
                </p>
                <button className="px-4 py-2 border border-slate-300 hover:bg-white rounded-xl font-bold text-sm transition-colors">
                    Contactar soporte
                </button>
            </div>
        </div>
    );
}
