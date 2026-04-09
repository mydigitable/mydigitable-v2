"use client";

import { MapPin, Home, Building } from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
    country: string;
}

export function Step3Location({ formData, updateFormData, country }: Props) {
    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Ubicación
                </h2>
                <p className="text-slate-500">
                    ¿Dónde se encuentra tu negocio?
                </p>
            </div>

            {/* Dirección */}
            <div className="mb-6">
                <label className="block text-sm font-black text-slate-900 mb-3">
                    📍 Dirección completa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Home className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => updateFormData({ address: e.target.value })}
                        placeholder="Calle Principal 123"
                        className="w-full h-14 pl-12 pr-5 rounded-xl bg-white border-2 border-slate-200 focus:border-primary focus:outline-none font-medium text-slate-900 transition-colors"
                    />
                </div>
                {!formData.address && (
                    <p className="text-xs text-red-500 mt-2">La dirección es obligatoria</p>
                )}
            </div>

            {/* Ciudad y País */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Ciudad */}
                <div>
                    <label className="block text-sm font-black text-slate-900 mb-3">
                        🏙️ Ciudad <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={formData.city || ''}
                            onChange={(e) => updateFormData({ city: e.target.value })}
                            placeholder="Madrid"
                            className="w-full h-14 pl-12 pr-5 rounded-xl bg-white border-2 border-slate-200 focus:border-primary focus:outline-none font-medium text-slate-900 transition-colors"
                        />
                    </div>
                    {!formData.city && (
                        <p className="text-xs text-red-500 mt-2">La ciudad es obligatoria</p>
                    )}
                </div>

                {/* País (readonly) */}
                <div>
                    <label className="block text-sm font-black text-slate-900 mb-3">
                        🌍 País
                    </label>
                    <input
                        type="text"
                        value={country}
                        disabled
                        className="w-full h-14 px-5 rounded-xl bg-slate-50 border-2 border-slate-200 font-medium text-slate-900 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        País de tu registro
                    </p>
                </div>
            </div>

            {/* Código postal */}
            <div className="mb-6">
                <label className="block text-sm font-black text-slate-900 mb-3">
                    📮 Código postal <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                </label>
                <input
                    type="text"
                    value={formData.postal_code || ''}
                    onChange={(e) => updateFormData({ postal_code: e.target.value })}
                    placeholder="28001"
                    className="w-full h-14 px-5 rounded-xl bg-white border-2 border-slate-200 focus:border-primary focus:outline-none font-medium text-slate-900 transition-colors"
                />
            </div>

            {/* Info adicional */}
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium text-center">
                    📍 Esta dirección aparecerá en tu menú digital para que los clientes puedan encontrarte
                </p>
            </div>
        </div>
    );
}
