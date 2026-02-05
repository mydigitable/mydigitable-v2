"use client";

import { MapPin, Building, Hash, Globe } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

const countries = [
    "España", "Portugal", "Francia", "Italia", "Alemania", "Reino Unido",
    "Grecia", "Croacia", "México", "Argentina", "Chile", "Colombia",
    "Estados Unidos", "Uruguay", "Brasil", "Otro"
];

export function Step2Location({ data, onUpdate }: Props) {
    return (
        <div className="space-y-6">
            {/* Address */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <MapPin size={12} />
                    Dirección completa
                </label>
                <input
                    type="text"
                    value={data.address}
                    onChange={(e) => onUpdate({ address: e.target.value })}
                    placeholder="Calle, número, local..."
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                        <Building size={12} />
                        Ciudad
                    </label>
                    <input
                        type="text"
                        value={data.city}
                        onChange={(e) => onUpdate({ city: e.target.value })}
                        placeholder="Ej: Barcelona"
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                    />
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                        <Hash size={12} />
                        Código postal
                    </label>
                    <input
                        type="text"
                        value={data.postal_code}
                        onChange={(e) => onUpdate({ postal_code: e.target.value })}
                        placeholder="08001"
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                    />
                </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <Globe size={12} />
                    País
                </label>
                <select
                    value={data.country}
                    onChange={(e) => onUpdate({ country: e.target.value })}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                >
                    {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
