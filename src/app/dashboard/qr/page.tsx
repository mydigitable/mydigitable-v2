"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    QrCode,
    Download,
    Printer,
    Copy,
    Check,
    ExternalLink,
    Loader2,
    Plus,
    Settings,
    Palette,
    Image as ImageIcon,
    Smartphone,
    Table2,
    RefreshCw,
    X,
    Eye,
} from "lucide-react";
import Link from "next/link";

interface Table {
    id: string;
    table_number: number;
    name: string | null;
    qr_code_url: string | null;
}

interface QRSettings {
    size: number;
    foreground: string;
    background: string;
    includelogo: boolean;
}

export default function QRPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<QRSettings>({
        size: 300,
        foreground: '000000',
        background: 'ffffff',
        includelogo: false,
    });
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

            if (!restaurantData) return;
            setRestaurant(restaurantData);

            const { data: tablesData } = await supabase
                .from("tables")
                .select("id, table_number, name, qr_code_url")
                .eq("restaurant_id", restaurantData.id)
                .order("table_number");

            setTables(tablesData || []);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const getQRUrl = (tableNumber?: number) => {
        const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${restaurant?.slug}`;
        const url = tableNumber ? `${baseUrl}?table=${tableNumber}` : baseUrl;
        return `https://api.qrserver.com/v1/create-qr-code/?size=${settings.size}x${settings.size}&data=${encodeURIComponent(url)}&color=${settings.foreground}&bgcolor=${settings.background}`;
    };

    const getMenuUrl = (tableNumber?: number) => {
        const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${restaurant?.slug}`;
        return tableNumber ? `${baseUrl}?table=${tableNumber}` : baseUrl;
    };

    const copyToClipboard = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const downloadQR = async (tableNumber?: number, fileName?: string) => {
        const qrUrl = getQRUrl(tableNumber);
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `qr-${restaurant?.slug}${tableNumber ? `-mesa-${tableNumber}` : ''}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const downloadAllSelected = async () => {
        for (const tableId of selectedTables) {
            const table = tables.find(t => t.id === tableId);
            if (table) {
                await downloadQR(table.table_number, `qr-mesa-${table.table_number}.png`);
                await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
            }
        }
    };

    const toggleTableSelection = (tableId: string) => {
        setSelectedTables(prev =>
            prev.includes(tableId)
                ? prev.filter(id => id !== tableId)
                : [...prev, tableId]
        );
    };

    const selectAll = () => {
        setSelectedTables(tables.map(t => t.id));
    };

    const deselectAll = () => {
        setSelectedTables([]);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Códigos QR</h1>
                    <p className="text-sm text-slate-500">
                        Genera y descarga códigos QR para tu menú y mesas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${showSettings
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <Palette size={16} />
                        Personalizar
                    </button>
                    {selectedTables.length > 0 && (
                        <button
                            onClick={downloadAllSelected}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors"
                        >
                            <Download size={16} />
                            Descargar {selectedTables.length} QRs
                        </button>
                    )}
                </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 overflow-hidden"
                    >
                        <h3 className="font-bold text-slate-900 mb-4">Personalización del QR</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Tamaño (px)
                                </label>
                                <select
                                    value={settings.size}
                                    onChange={(e) => setSettings(s => ({ ...s, size: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                                >
                                    <option value={200}>200 x 200</option>
                                    <option value={300}>300 x 300</option>
                                    <option value={400}>400 x 400</option>
                                    <option value={500}>500 x 500</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Color del QR
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={`#${settings.foreground}`}
                                        onChange={(e) => setSettings(s => ({ ...s, foreground: e.target.value.replace('#', '') }))}
                                        className="w-12 h-10 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={`#${settings.foreground}`}
                                        onChange={(e) => setSettings(s => ({ ...s, foreground: e.target.value.replace('#', '') }))}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Color de Fondo
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={`#${settings.background}`}
                                        onChange={(e) => setSettings(s => ({ ...s, background: e.target.value.replace('#', '') }))}
                                        className="w-12 h-10 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={`#${settings.background}`}
                                        onChange={(e) => setSettings(s => ({ ...s, background: e.target.value.replace('#', '') }))}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setSettings({ size: 300, foreground: '000000', background: 'ffffff', includelogo: false })}
                                    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700"
                                >
                                    Restablecer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main QR - Restaurant */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <img
                            src={getQRUrl()}
                            alt="QR del restaurante"
                            className="w-48 h-48"
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-black text-slate-900 mb-2">
                            QR Principal del Restaurante
                        </h2>
                        <p className="text-slate-500 mb-4">
                            Este código QR lleva directamente a tu menú digital
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <button
                                onClick={() => downloadQR(undefined, `qr-${restaurant?.slug}.png`)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors"
                            >
                                <Download size={16} />
                                Descargar
                            </button>
                            <button
                                onClick={() => copyToClipboard(getMenuUrl())}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                            >
                                {copiedUrl === getMenuUrl() ? <Check size={16} /> : <Copy size={16} />}
                                {copiedUrl === getMenuUrl() ? 'Copiado' : 'Copiar URL'}
                            </button>
                            <Link
                                href={getMenuUrl()}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                            >
                                <ExternalLink size={16} />
                                Ver Menú
                            </Link>
                        </div>
                        <p className="text-xs text-slate-400 mt-4 font-mono">
                            {getMenuUrl()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tables QRs */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900">QR por Mesa</h2>
                        <p className="text-sm text-slate-500">
                            Cada mesa tiene su propio código QR
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {tables.length > 0 && (
                            <>
                                <button
                                    onClick={selectedTables.length === tables.length ? deselectAll : selectAll}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    {selectedTables.length === tables.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                </button>
                            </>
                        )}
                        <Link
                            href="/dashboard/tables"
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                        >
                            <Plus size={16} />
                            Gestionar Mesas
                        </Link>
                    </div>
                </div>

                {tables.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Table2 size={28} className="text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Sin mesas configuradas</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Crea mesas para generar códigos QR individuales
                        </p>
                        <Link
                            href="/dashboard/tables"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors"
                        >
                            <Plus size={16} />
                            Crear Mesas
                        </Link>
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {tables.map((table) => (
                            <motion.div
                                key={table.id}
                                layout
                                className={`relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${selectedTables.includes(table.id)
                                        ? 'border-primary shadow-lg shadow-primary/10'
                                        : 'border-slate-100 hover:border-slate-200'
                                    }`}
                                onClick={() => toggleTableSelection(table.id)}
                            >
                                {/* Selection indicator */}
                                {selectedTables.includes(table.id) && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}

                                {/* QR Image */}
                                <div className="p-3 bg-slate-50">
                                    <img
                                        src={getQRUrl(table.table_number)}
                                        alt={`QR Mesa ${table.table_number}`}
                                        className="w-full aspect-square"
                                    />
                                </div>

                                {/* Info */}
                                <div className="p-3 text-center">
                                    <p className="font-bold text-slate-900">Mesa {table.table_number}</p>
                                    {table.name && (
                                        <p className="text-xs text-slate-500">{table.name}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="px-3 pb-3 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadQR(table.table_number);
                                        }}
                                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Download size={12} />
                                        Descargar
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(getMenuUrl(table.table_number));
                                        }}
                                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                                    >
                                        {copiedUrl === getMenuUrl(table.table_number) ? (
                                            <Check size={12} />
                                        ) : (
                                            <Copy size={12} />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Print Tips */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Printer size={20} />
                    Consejos para imprimir
                </h3>
                <ul className="space-y-2 text-sm text-blue-700">
                    <li>• <b>Tamaño recomendado:</b> Mínimo 3x3 cm para escaneo fácil</li>
                    <li>• <b>Material:</b> Usa papel resistente al agua si es para exteriores</li>
                    <li>• <b>Contraste:</b> Asegúrate de que el QR tenga buen contraste con el fondo</li>
                    <li>• <b>Prueba:</b> Escanea el QR impreso antes de colocarlo en las mesas</li>
                </ul>
            </div>
        </div>
    );
}

