"use client";

import { Sparkles, Check, Store, MapPin, Clock, CreditCard, Palette } from "lucide-react";

interface Props {
    formData: any;
    config: any;
}

export function Step10Summary({ formData, config }: Props) {
    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">
                    ¡Todo listo!
                </h2>
                <p className="text-slate-500 text-lg">
                    Revisa tu configuración antes de finalizar
                </p>
            </div>

            {/* Resumen */}
            <div className="space-y-4 mb-8">
                {/* Negocio */}
                <div className="p-5 bg-slate-50 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Store className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 mb-1">Tu Negocio</h3>
                            <p className="text-sm text-slate-600">
                                <strong>{config?.restaurantName}</strong>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Tipo: {formData.business_type || 'restaurant'}
                            </p>
                        </div>
                        <Check className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Ubicación */}
                <div className="p-5 bg-slate-50 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 mb-1">Ubicación</h3>
                            <p className="text-sm text-slate-600">
                                {formData.address || 'No especificada'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {formData.city || ''}, {config?.country || ''}
                            </p>
                        </div>
                        <Check className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Horarios */}
                {formData.working_hours && (
                    <div className="p-5 bg-slate-50 rounded-2xl">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-slate-900 mb-1">Horarios</h3>
                                <p className="text-sm text-slate-600">
                                    Configurados para toda la semana
                                </p>
                            </div>
                            <Check className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                )}

                {/* Pagos */}
                <div className="p-5 bg-slate-50 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 mb-1">Pagos y Propinas</h3>
                            <p className="text-sm text-slate-600">
                                Moneda: {formData.currency || 'EUR'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {formData.accepts_cash && 'Efectivo '}
                                {formData.accepts_card && 'Tarjeta '}
                                {formData.tips_enabled && '• Propinas activadas'}
                            </p>
                        </div>
                        <Check className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Apariencia */}
                <div className="p-5 bg-slate-50 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Palette className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 mb-1">Apariencia</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div
                                    className="w-8 h-8 rounded-lg border-2 border-white shadow"
                                    style={{ backgroundColor: formData.primary_color || '#22C55E' }}
                                />
                                <div
                                    className="w-8 h-8 rounded-lg border-2 border-white shadow"
                                    style={{ backgroundColor: formData.secondary_color || '#FFC107' }}
                                />
                                <span className="text-xs text-slate-500 ml-2">
                                    Idioma: {formData.default_language || 'es'}
                                </span>
                            </div>
                        </div>
                        <Check className="w-5 h-5 text-primary" />
                    </div>
                </div>
            </div>

            {/* Plan */}
            <div className="p-6 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl text-white text-center mb-8">
                <p className="text-sm font-bold opacity-90 mb-1">Tu plan</p>
                <p className="text-3xl font-black uppercase">{config?.planTier || 'BASIC'}</p>
                <p className="text-sm opacity-75 mt-2">
                    {config?.locations || 1} {config?.locations === 1 ? 'sucursal' : 'sucursales'}
                </p>
            </div>

            {/* CTA Final */}
            <div className="text-center">
                <p className="text-slate-600 mb-4">
                    Al finalizar, podrás acceder a tu dashboard y empezar a gestionar tu negocio
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-700 font-medium">
                        Haz clic en "Finalizar" para completar el onboarding
                    </p>
                </div>
            </div>
        </div>
    );
}
