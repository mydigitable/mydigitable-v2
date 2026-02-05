"use client";

import { Phone, Mail, Instagram, Facebook, AtSign } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
}

export function Step2Contact({ data, onUpdate }: Props) {
    const isEmailValid = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

    return (
        <div className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <Mail size={12} />
                    Email de contacto *
                </label>
                <input
                    type="email"
                    value={data.email || ""}
                    onChange={(e) => onUpdate({ email: e.target.value })}
                    placeholder="contacto@tunegocio.com"
                    className={`w-full h-14 px-5 rounded-2xl bg-slate-50 border transition-all outline-none font-bold text-slate-900 ${!isEmailValid ? "border-red-300 bg-red-50" : "border-slate-100 focus:bg-white focus:border-primary"
                        }`}
                />
                {!isEmailValid && (
                    <p className="text-xs text-red-400 ml-1">Email no válido</p>
                )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <Phone size={12} />
                    Teléfono *
                </label>
                <input
                    type="tel"
                    value={data.phone || ""}
                    onChange={(e) => onUpdate({ phone: e.target.value })}
                    placeholder="+34 612 345 678"
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                />
                {!data.phone && (
                    <p className="text-xs text-red-400 ml-1">El teléfono es obligatorio</p>
                )}
            </div>

            {/* Redes sociales */}
            <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    Redes sociales (opcional)
                </h3>

                <div className="space-y-4">
                    {/* Instagram */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                            <Instagram size={22} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                <span className="px-3 text-slate-400 text-sm">@</span>
                                <input
                                    type="text"
                                    value={data.social_instagram || ""}
                                    onChange={(e) => onUpdate({ social_instagram: e.target.value })}
                                    placeholder="tu_restaurante"
                                    className="flex-1 h-12 pr-4 bg-transparent outline-none font-medium text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Facebook */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                            <Facebook size={22} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                <span className="px-3 text-slate-400 text-sm whitespace-nowrap">facebook.com/</span>
                                <input
                                    type="text"
                                    value={data.social_facebook || ""}
                                    onChange={(e) => onUpdate({ social_facebook: e.target.value })}
                                    placeholder="tunegocio"
                                    className="flex-1 h-12 pr-4 bg-transparent outline-none font-medium text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* TikTok */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white flex-shrink-0">
                            <AtSign size={22} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                <span className="px-3 text-slate-400 text-sm whitespace-nowrap">tiktok.com/@</span>
                                <input
                                    type="text"
                                    value={data.social_tiktok || ""}
                                    onChange={(e) => onUpdate({ social_tiktok: e.target.value })}
                                    placeholder="tunegocio"
                                    className="flex-1 h-12 pr-4 bg-transparent outline-none font-medium text-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
