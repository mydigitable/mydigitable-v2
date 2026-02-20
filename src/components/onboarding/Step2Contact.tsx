"use client";

import { Phone, Mail, Globe, Instagram, Facebook, Twitter } from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
    email: string;
}

export function Step2Contact({ formData, updateFormData, email }: Props) {
    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Información de Contacto
                </h2>
                <p className="text-slate-500">
                    ¿Cómo pueden contactarte tus clientes?
                </p>
            </div>

            {/* Email (readonly) */}
            <div className="mb-6">
                <label className="block text-sm font-black text-slate-900 mb-3">
                    📧 Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full h-14 pl-12 pr-5 rounded-xl bg-slate-50 border-2 border-slate-200 font-medium text-slate-900 cursor-not-allowed"
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Este es tu email de registro
                </p>
            </div>

            {/* Teléfono */}
            <div className="mb-6">
                <label className="block text-sm font-black text-slate-900 mb-3">
                    📞 Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        placeholder="+34 600 123 456"
                        className="w-full h-14 pl-12 pr-5 rounded-xl bg-white border-2 border-slate-200 focus:border-primary focus:outline-none font-medium text-slate-900 transition-colors"
                    />
                </div>
                {!formData.phone && (
                    <p className="text-xs text-red-500 mt-2">El teléfono es obligatorio</p>
                )}
            </div>

            {/* Sitio web */}
            <div className="mb-6">
                <label className="block text-sm font-black text-slate-900 mb-3">
                    🌐 Sitio web <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                </label>
                <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => updateFormData({ website: e.target.value })}
                        placeholder="https://turestaurante.com"
                        className="w-full h-14 pl-12 pr-5 rounded-xl bg-white border-2 border-slate-200 focus:border-primary focus:outline-none font-medium text-slate-900 transition-colors"
                    />
                </div>
            </div>

            {/* Redes sociales */}
            <div>
                <label className="block text-sm font-black text-slate-900 mb-3">
                    📱 Redes Sociales <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                </label>
                <p className="text-sm text-slate-500 mb-4">
                    Tus clientes podrán seguirte desde el menú digital
                </p>

                <div className="space-y-3">
                    {/* Instagram */}
                    <div className="relative">
                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
                        <input
                            type="text"
                            value={formData.instagram || ''}
                            onChange={(e) => updateFormData({ instagram: e.target.value })}
                            placeholder="@turestaurante"
                            className="w-full h-12 pl-12 pr-5 rounded-xl bg-white border-2 border-slate-200 focus:border-pink-500 focus:outline-none font-medium text-slate-900 transition-colors"
                        />
                    </div>

                    {/* Facebook */}
                    <div className="relative">
                        <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                        <input
                            type="text"
                            value={formData.facebook || ''}
                            onChange={(e) => updateFormData({ facebook: e.target.value })}
                            placeholder="facebook.com/turestaurante"
                            className="w-full h-12 pl-12 pr-5 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-600 focus:outline-none font-medium text-slate-900 transition-colors"
                        />
                    </div>

                    {/* Twitter/X */}
                    <div className="relative">
                        <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500" size={20} />
                        <input
                            type="text"
                            value={formData.twitter || ''}
                            onChange={(e) => updateFormData({ twitter: e.target.value })}
                            placeholder="@turestaurante"
                            className="w-full h-12 pl-12 pr-5 rounded-xl bg-white border-2 border-slate-200 focus:border-sky-500 focus:outline-none font-medium text-slate-900 transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
