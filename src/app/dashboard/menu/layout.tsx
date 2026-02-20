"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Smartphone, X, ExternalLink } from "lucide-react";
import { MenuProvider, useMenu } from "@/contexts/MenuContext";
import { MenuMobilePreview } from "@/components/shared/MenuMobilePreview";

function MenuLayoutContent({ children }: { children: ReactNode }) {
    const { restaurant, categories, designConfig, showPreview, setShowPreview } = useMenu();
    const pathname = usePathname();

    // Design Studio has its own preview — hide the global one
    const isDesignPage = pathname?.includes('/design');
    // Unified menu manager has its own 3-column preview
    const isUnifiedMenuPage = pathname === '/dashboard/menu';
    const shouldShowPreview = showPreview && !isDesignPage && !isUnifiedMenuPage;

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 w-full ${shouldShowPreview ? 'mr-0 lg:mr-[440px]' : ''}`}>
                {children}
            </div>

            {/* Global Preview Sidebar — hidden on Design Studio */}
            {!isDesignPage && shouldShowPreview && (
                <div className="fixed right-0 top-0 h-screen w-[440px] bg-gradient-to-br from-slate-100 to-slate-200 z-50 shadow-2xl border-l border-slate-200 flex flex-col font-sans hidden lg:flex">
                    {/* Header */}
                    <div className="p-4 bg-white border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-slate-800">Vista Previa en Vivo</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {restaurant?.slug && (
                                <a
                                    href={`/r/${restaurant.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 font-medium"
                                >
                                    <ExternalLink size={14} />
                                    Ver en vivo
                                </a>
                            )}
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                            >
                                <X size={14} />
                                Cerrar
                            </button>
                        </div>
                    </div>

                    {/* Preview Container */}
                    <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
                        <div className="transform scale-[0.82] origin-center">
                            <MenuMobilePreview
                                restaurant={restaurant}
                                categories={categories}
                                designConfig={designConfig}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Buttons — shows when preview is closed (non-design/non-unified pages) */}
            {!isDesignPage && !isUnifiedMenuPage && !showPreview && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
                    {restaurant?.slug && (
                        <a
                            href={`/r/${restaurant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white border border-slate-200 hover:border-emerald-300 text-emerald-600 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-2 transition-all hover:shadow-xl"
                        >
                            <ExternalLink size={18} />
                            <span className="text-sm font-bold hidden sm:inline">Ver Menú en Vivo</span>
                        </a>
                    )}
                    <button
                        onClick={() => setShowPreview(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl rounded-2xl px-5 py-3 flex items-center gap-2.5 transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                        <Smartphone size={20} />
                        <span className="text-sm font-bold hidden sm:inline">Vista Previa</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default function MenuLayout({ children }: { children: ReactNode }) {
    return (
        <MenuProvider>
            <MenuLayoutContent>
                {children}
            </MenuLayoutContent>
        </MenuProvider>
    );
}
