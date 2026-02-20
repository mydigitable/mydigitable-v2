"use client";

import { Table2 } from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
}

export function Step7Tables({ formData, updateFormData }: Props) {
    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Table2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Mesas y Zonas
                </h2>
                <p className="text-slate-500">
                    Configuraremos tus mesas después en el dashboard
                </p>
            </div>

            <div className="text-center py-12">
                <p className="text-slate-600 mb-4">
                    Por ahora, solo necesitamos saber aproximadamente cuántas mesas tienes
                </p>

                <div className="max-w-xs mx-auto">
                    <label className="block text-sm font-black text-slate-900 mb-3">
                        🪑 Número aproximado de mesas
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="500"
                        value={formData.table_count || 10}
                        onChange={(e) => updateFormData({ table_count: parseInt(e.target.value) || 10 })}
                        className="w-full h-16 px-5 rounded-xl bg-white border-2 border-slate-200 focus:border-primary focus:outline-none font-bold text-slate-900 text-2xl text-center transition-colors"
                    />
                </div>
            </div>

            {/* Info adicional */}
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium text-center">
                    💡 Podrás crear y configurar cada mesa individualmente desde el dashboard
                </p>
            </div>
        </div>
    );
}
