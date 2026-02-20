"use client";

import {
    Utensils,
    Umbrella,
    Truck,
    ShoppingBag,
    Music,
    AlertCircle,
    MapPin,
    Smartphone,
    Table2,
    Home,
    Waves,
    CreditCard,
    Clock
} from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
    planTier: 'basic' | 'pro' | 'premium';
}

interface ModeOptionProps {
    icon: React.ElementType;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    badge?: string;
}

function ModeOption({ icon: Icon, label, description, checked, onChange, disabled, badge }: ModeOptionProps) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 relative ${disabled
                ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                : checked
                    ? "border-primary bg-primary/5"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
        >
            {badge && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {badge}
                </span>
            )}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${disabled
                ? "bg-slate-200 text-slate-400"
                : checked
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-400"
                }`}>
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-0.5">{label}</h4>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${disabled
                ? "border-slate-200"
                : checked
                    ? "border-primary bg-primary"
                    : "border-slate-200"
                }`}>
                {checked && !disabled && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
        </button>
    );
}

export function Step4Modes({ formData, updateFormData, planTier }: Props) {
    const modes = [
        formData.mode_dine_in,
        formData.accepts_takeaway,
        formData.accepts_delivery,
        formData.mode_beach,
        formData.mode_events
    ];
    const hasAtLeastOne = modes.some(Boolean);

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Configuración Operativa
                </h2>
                <p className="text-slate-500">
                    ¿Cómo opera tu negocio?
                </p>
            </div>

            {/* Modos de servicio */}
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-4">
                    🍽️ Modos de servicio
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    Selecciona todos los que apliquen
                </p>

                {!hasAtLeastOne && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                        <AlertCircle size={16} className="text-amber-500" />
                        <p className="text-xs text-amber-700 font-medium">
                            Debes seleccionar al menos un modo
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <ModeOption
                        icon={Utensils}
                        label="Dine-In (Comer en local)"
                        description="Servicio en mesas del establecimiento"
                        checked={formData.mode_dine_in ?? true}
                        onChange={(checked) => updateFormData({ mode_dine_in: checked })}
                    />

                    <ModeOption
                        icon={ShoppingBag}
                        label="Takeaway (Para llevar)"
                        description="Recogida en local"
                        checked={formData.accepts_takeaway ?? true}
                        onChange={(checked) => updateFormData({ accepts_takeaway: checked })}
                    />

                    <ModeOption
                        icon={Table2}
                        label="Pickup / Counter (Mostrador)"
                        description="Estilo McDonald's - Aviso cuando está listo y recoge en mostrador"
                        checked={formData.mode_pickup ?? false}
                        onChange={(checked) => updateFormData({ mode_pickup: checked })}
                    />

                    <ModeOption
                        icon={Truck}
                        label="Delivery (A domicilio)"
                        description="Envío a domicilio del cliente"
                        checked={formData.accepts_delivery ?? false}
                        onChange={(checked) => updateFormData({ accepts_delivery: checked })}
                    />

                    <ModeOption
                        icon={Umbrella}
                        label="Beach Service (Playa)"
                        description="Hamacas, sombrillas, chiringuito"
                        checked={formData.mode_beach ?? false}
                        onChange={(checked) => updateFormData({ mode_beach: checked })}
                        badge={planTier === 'basic' ? 'PRO' : undefined}
                        disabled={planTier === 'basic'}
                    />

                    <ModeOption
                        icon={Music}
                        label="Eventos / Festivales"
                        description="Venta en festivales y conciertos"
                        checked={formData.mode_events ?? false}
                        onChange={(checked) => updateFormData({ mode_events: checked })}
                        badge={planTier === 'basic' ? 'PRO' : undefined}
                        disabled={planTier === 'basic'}
                    />

                    <ModeOption
                        icon={Home}
                        label="Room Service (Hotel)"
                        description="Servicio a habitaciones"
                        checked={formData.has_room_service ?? false}
                        onChange={(checked) => updateFormData({ has_room_service: checked })}
                        badge={planTier !== 'premium' ? 'PREMIUM' : undefined}
                        disabled={planTier !== 'premium'}
                    />
                </div>
            </div>

            {/* Modo de ubicación */}
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-4">
                    📍 Modo de ubicación
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    ¿Cómo identifican los clientes su ubicación?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => updateFormData({ location_mode: 'fixed_table' })}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.location_mode === 'fixed_table'
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary bg-white'
                            }`}
                    >
                        <Table2 className={`w-8 h-8 mb-2 ${formData.location_mode === 'fixed_table' ? 'text-primary' : 'text-slate-400'
                            }`} />
                        <h4 className="font-bold text-slate-900 mb-1">Mesa fija</h4>
                        <p className="text-xs text-slate-500">Tradicional - Número de mesa</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ location_mode: 'gps_free' })}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.location_mode === 'gps_free'
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary bg-white'
                            }`}
                    >
                        <Smartphone className={`w-8 h-8 mb-2 ${formData.location_mode === 'gps_free' ? 'text-primary' : 'text-slate-400'
                            }`} />
                        <h4 className="font-bold text-slate-900 mb-1">GPS libre</h4>
                        <p className="text-xs text-slate-500">Playa, terraza - Ubicación GPS</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ location_mode: 'room_number' })}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.location_mode === 'room_number'
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary bg-white'
                            }`}
                        disabled={planTier !== 'premium'}
                    >
                        <Home className={`w-8 h-8 mb-2 ${formData.location_mode === 'room_number' ? 'text-primary' : 'text-slate-400'
                            }`} />
                        <h4 className="font-bold text-slate-900 mb-1">
                            Número de habitación
                            {planTier !== 'premium' && (
                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                    PREMIUM
                                </span>
                            )}
                        </h4>
                        <p className="text-xs text-slate-500">Hotel - Room service</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ location_mode: 'sector_seat' })}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.location_mode === 'sector_seat'
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary bg-white'
                            }`}
                        disabled={planTier === 'basic'}
                    >
                        <Music className={`w-8 h-8 mb-2 ${formData.location_mode === 'sector_seat' ? 'text-primary' : 'text-slate-400'
                            }`} />
                        <h4 className="font-bold text-slate-900 mb-1">
                            Sector + Asiento
                            {planTier === 'basic' && (
                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                    PRO
                                </span>
                            )}
                        </h4>
                        <p className="text-xs text-slate-500">Eventos - Sector y butaca</p>
                    </button>
                </div>
            </div>

            {/* Momento de pago */}
            <div>
                <h3 className="text-lg font-black text-slate-900 mb-4">
                    💳 Momento de pago
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    ¿Cuándo pagan tus clientes?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => updateFormData({ payment_timing: 'before' })}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.payment_timing === 'before'
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary bg-white'
                            }`}
                    >
                        <CreditCard className={`w-8 h-8 mb-2 mx-auto ${formData.payment_timing === 'before' ? 'text-primary' : 'text-slate-400'
                            }`} />
                        <h4 className="font-bold text-slate-900 mb-1 text-center">Antes</h4>
                        <p className="text-xs text-slate-500 text-center">Pagan antes de ordenar</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ payment_timing: 'with_product' })}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.payment_timing === 'with_product'
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary bg-white'
                            }`}
                    >
                        <Utensils className={`w-8 h-8 mb-2 mx-auto ${formData.payment_timing === 'with_product' ? 'text-primary' : 'text-slate-400'
                            }`} />
                        <h4 className="font-bold text-slate-900 mb-1 text-center">Con el producto</h4>
                        <p className="text-xs text-slate-500 text-center">Pagan al recibir</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ payment_timing: 'after' })}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.payment_timing === 'after'
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary bg-white'
                            }`}
                    >
                        <Clock className={`w-8 h-8 mb-2 mx-auto ${formData.payment_timing === 'after' ? 'text-primary' : 'text-slate-400'
                            }`} />
                        <h4 className="font-bold text-slate-900 mb-1 text-center">Al final</h4>
                        <p className="text-xs text-slate-500 text-center">Tradicional - Piden la cuenta</p>
                    </button>
                </div>
            </div>

            {/* Mesas compartidas */}
            {formData.mode_dine_in && (
                <div>
                    <h3 className="text-lg font-black text-slate-900 mb-4">
                        🪑 Mesas compartidas
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        ¿Permites que varios grupos compartan la misma mesa?
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => updateFormData({ shared_tables_enabled: false })}
                            className={`p-6 rounded-2xl border-2 transition-all ${formData.shared_tables_enabled === false
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-primary bg-white'
                                }`}
                        >
                            <div className="text-center">
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${formData.shared_tables_enabled === false
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <Table2 size={24} />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Mesa privada</h4>
                                <p className="text-xs text-slate-500">
                                    Cada grupo tiene su propia mesa
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => updateFormData({ shared_tables_enabled: true })}
                            className={`p-6 rounded-2xl border-2 transition-all ${formData.shared_tables_enabled === true
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-primary bg-white'
                                }`}
                        >
                            <div className="text-center">
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${formData.shared_tables_enabled === true
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <Music size={24} />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Mesa compartida</h4>
                                <p className="text-xs text-slate-500">
                                    Varios grupos pueden compartir mesa
                                </p>
                            </div>
                        </button>
                    </div>

                    {formData.shared_tables_enabled && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-700 font-medium">
                                💡 Ideal para bares, terrazas y espacios informales donde los clientes comparten mesas grandes
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
