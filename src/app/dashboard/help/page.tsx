"use client";

import { HelpCircle, Book, MessageCircle, Video, ChevronRight, ExternalLink, Mail, Phone } from "lucide-react";
import Link from "next/link";

const helpSections = [
    {
        title: 'Guías Rápidas',
        icon: Book,
        color: 'bg-blue-500',
        items: [
            { title: 'Cómo crear tu primera carta', href: '#' },
            { title: 'Configurar códigos QR', href: '#' },
            { title: 'Recibir tu primer pedido', href: '#' },
            { title: 'Personalizar el diseño', href: '#' },
        ]
    },
    {
        title: 'Videotutoriales',
        icon: Video,
        color: 'bg-red-500',
        items: [
            { title: 'Tour completo del dashboard', href: '#' },
            { title: 'Gestión de pedidos en tiempo real', href: '#' },
            { title: 'Configuración de delivery', href: '#' },
        ]
    },
    {
        title: 'Preguntas Frecuentes',
        icon: HelpCircle,
        color: 'bg-amber-500',
        items: [
            { title: '¿Cómo cambio mi plan?', href: '#' },
            { title: '¿Cómo genero nuevos QR?', href: '#' },
            { title: '¿Cómo añado idiomas?', href: '#' },
            { title: '¿Cómo contacto con soporte?', href: '#' },
        ]
    },
];

export default function HelpPage() {
    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HelpCircle size={32} className="text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Centro de Ayuda</h1>
                    <p className="text-slate-500">¿Necesitas ayuda? Estamos aquí para ti</p>
                </div>

                {/* Help Sections */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {helpSections.map((section) => (
                        <div key={section.title} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${section.color}`}>
                                        <section.icon size={20} className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-900">{section.title}</h3>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
                                    >
                                        <span className="text-sm text-slate-600">{item.title}</span>
                                        <ChevronRight size={16} className="text-slate-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Support */}
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8">
                    <div className="text-center mb-6">
                        <MessageCircle size={32} className="text-primary mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">¿No encuentras lo que buscas?</h3>
                        <p className="text-slate-600">Nuestro equipo está disponible para ayudarte</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <a
                            href="mailto:soporte@mydigitable.com"
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl border border-slate-200 hover:border-primary hover:shadow-lg transition-all"
                        >
                            <Mail size={20} className="text-primary" />
                            <div className="text-left">
                                <p className="font-bold text-slate-900">Email</p>
                                <p className="text-sm text-slate-500">soporte@mydigitable.com</p>
                            </div>
                        </a>
                        <a
                            href="tel:+34900000000"
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl border border-slate-200 hover:border-primary hover:shadow-lg transition-all"
                        >
                            <Phone size={20} className="text-primary" />
                            <div className="text-left">
                                <p className="font-bold text-slate-900">Teléfono</p>
                                <p className="text-sm text-slate-500">+34 900 000 000</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
