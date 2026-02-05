"use client";

import { QrCode, Table2, Minus, Plus } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
}

export function Step7Tables({ data, onUpdate }: Props) {
    const tableCount = data.table_count ?? 0;

    const increment = () => onUpdate({ table_count: tableCount + 1 });
    const decrement = () => onUpdate({ table_count: Math.max(0, tableCount - 1) });

    return (
        <div className="space-y-8">
            <p className="text-sm text-slate-500 text-center">
                ¿Cuántas mesas tiene tu negocio?
            </p>

            {/* Table counter */}
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={decrement}
                        disabled={tableCount === 0}
                        className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    >
                        <Minus size={24} className="text-slate-600" />
                    </button>

                    <div className="text-center">
                        <input
                            type="number"
                            value={tableCount}
                            onChange={(e) => onUpdate({ table_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-24 h-20 text-5xl font-black text-center bg-transparent outline-none text-slate-900"
                            min="0"
                        />
                        <p className="text-sm text-slate-400 font-medium">
                            {tableCount === 1 ? "mesa" : "mesas"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={increment}
                        className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-all"
                    >
                        <Plus size={24} className="text-white" />
                    </button>
                </div>

                {/* Quick buttons */}
                <div className="flex gap-2">
                    {[5, 10, 15, 20, 30].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onUpdate({ table_count: num })}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tableCount === num
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            {tableCount > 0 && (
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Table2 size={28} className="text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-900">
                            Se crearán {tableCount} mesas
                        </p>
                        <p className="text-xs text-slate-500">
                            Mesa 1, Mesa 2, ... Mesa {tableCount}
                        </p>
                    </div>
                </div>
            )}

            {/* QR Info */}
            <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <QrCode size={28} className="text-primary" />
                </div>
                <div>
                    <p className="font-bold text-slate-900">QR automáticos</p>
                    <p className="text-sm text-slate-500">
                        Cada mesa tendrá su código QR único para el menú digital
                    </p>
                </div>
            </div>

            {/* Skip note */}
            <p className="text-xs text-slate-400 text-center">
                Puedes saltar este paso y crear las mesas después desde el dashboard
            </p>
        </div>
    );
}
