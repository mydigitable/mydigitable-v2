'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Key, Settings, TrendingUp } from 'lucide-react'
import { getAISettingsForUI, updateAISettings } from '@/app/actions/ai'

export default function AISettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<any>(null)

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        const result = await getAISettingsForUI()
        if (result.success) {
            setSettings(result.settings)
        }
        setLoading(false)
    }

    async function handleSave() {
        setSaving(true)
        const result = await updateAISettings(settings)
        if (result.success) {
            alert('✅ Configuración guardada')
        } else {
            alert('❌ Error: ' + result.error)
        }
        setSaving(false)
    }

    function toggleFeature(feature: string) {
        setSettings({
            ...settings,
            features: {
                ...settings.features,
                [feature]: !settings.features[feature],
            },
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-slate-500">Cargando configuración...</div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Configuración de IA</h1>
                    <p className="text-slate-600">
                        Activa y configura las funciones de inteligencia artificial
                    </p>
                </div>
            </div>

            {/* Main Toggle */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Funciones de IA
                            </h3>
                            <p className="text-sm text-slate-600">
                                {settings.enabled
                                    ? 'Activas y funcionando'
                                    : 'Desactivadas - Activa para usar IA'}
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) =>
                                setSettings({ ...settings, enabled: e.target.checked })
                            }
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                </div>
            </div>

            {/* API Key */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Key className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">API Key de OpenAI</h3>
                </div>
                <input
                    type="password"
                    value={settings.apiKey || ''}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-mono text-sm"
                    disabled={!settings.enabled}
                />
                <p className="text-xs text-slate-500 mt-2">
                    💡 Obtén tu API key en{' '}
                    <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                    >
                        platform.openai.com
                    </a>
                </p>
            </div>

            {/* Features */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Funciones Disponibles</h3>
                </div>

                <div className="space-y-3">
                    {/* Auto Descriptions */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-slate-900">
                                ✨ Descripciones Automáticas
                            </h4>
                            <p className="text-sm text-slate-600">
                                Genera descripciones atractivas para tus productos
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.features.auto_descriptions}
                            onChange={() => toggleFeature('auto_descriptions')}
                            disabled={!settings.enabled}
                            className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Allergen Detection */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-slate-900">🔍 Detección de Alérgenos</h4>
                            <p className="text-sm text-slate-600">
                                Detecta automáticamente alérgenos del nombre y descripción
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.features.allergen_detection}
                            onChange={() => toggleFeature('allergen_detection')}
                            disabled={!settings.enabled}
                            className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Extra Suggestions */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-slate-900">💡 Sugerencias de Extras</h4>
                            <p className="text-sm text-slate-600">
                                Sugiere extras relevantes para cada producto
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.features.extra_suggestions}
                            onChange={() => toggleFeature('extra_suggestions')}
                            disabled={!settings.enabled}
                            className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Image Generation */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-slate-900">🎨 Generación de Imágenes</h4>
                            <p className="text-sm text-slate-600">
                                Crea imágenes profesionales de platos con DALL-E 3
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.features.image_generation}
                            onChange={() => toggleFeature('image_generation')}
                            disabled={!settings.enabled}
                            className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Menu Analysis */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-slate-900">📊 Análisis de Menú</h4>
                            <p className="text-sm text-slate-600">
                                Analiza balance nutricional y variedad del menú
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.features.menu_analysis}
                            onChange={() => toggleFeature('menu_analysis')}
                            disabled={!settings.enabled}
                            className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Uso de IA</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {settings.usage?.descriptions_count || 0}
                        </div>
                        <div className="text-sm text-slate-600">Descripciones generadas</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {settings.usage?.images_count || 0}
                        </div>
                        <div className="text-sm text-slate-600">Imágenes generadas</div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                    <strong>💰 Costos estimados:</strong> Descripciones ~$0.01 cada una, Imágenes
                    ~$0.04 cada una. Los costos se cargan directamente a tu cuenta de OpenAI.
                </p>
            </div>
        </div>
    )
}
