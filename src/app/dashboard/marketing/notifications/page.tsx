"use client";

import { useState } from "react";
import { Send, Bell, Smartphone, Mail, Users, Plus, Clock, Loader2 } from "lucide-react";

export default function NotificationsPage() {
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");

    const handleSend = () => {
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setTitle("");
            setMessage("");
        }, 2000);
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Notificaciones Push</h1>
                <p className="text-slate-500 mt-1">Envía notificaciones a tus clientes</p>
            </div>

            {/* Send Notification */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-6">Nueva Notificación</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: ¡Oferta especial!"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Mensaje</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Users size={16} />
                            <span>Se enviará a <strong>0 suscriptores</strong></span>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!title || !message || sending}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Enviar ahora
                        </button>
                    </div>
                </div>
            </div>

            {/* Scheduled */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900">Notificaciones Programadas</h3>
                    <button className="flex items-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg font-bold text-sm">
                        <Plus size={16} />
                        Programar
                    </button>
                </div>
                <div className="text-center py-8 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay notificaciones programadas</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Bell size={20} className="text-blue-600" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">0</span>
                    </div>
                    <p className="text-sm text-slate-500">Enviadas este mes</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Smartphone size={20} className="text-green-600" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">0</span>
                    </div>
                    <p className="text-sm text-slate-500">Suscriptores</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Mail size={20} className="text-purple-600" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">0%</span>
                    </div>
                    <p className="text-sm text-slate-500">Tasa de apertura</p>
                </div>
            </div>
        </div>
    );
}
