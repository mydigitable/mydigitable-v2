"use client"

import { Menu as MenuIcon, Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TopBarProps {
    setIsMobileOpen: (value: boolean) => void
    restaurant: any
    user: any
    pendingOrders: number
    pendingCalls: number
}

export function TopBar({
    setIsMobileOpen,
    restaurant,
    user,
    pendingOrders,
    pendingCalls,
}: TopBarProps) {
    const supabase = createClient()

    const handleToggleOrders = async () => {
        if (!restaurant) return

        const newValue = !restaurant.is_accepting_orders
        await supabase
            .from("restaurants")
            .update({ is_accepting_orders: newValue })
            .eq("id", restaurant.id)

        // Note: Parent component should handle state update via realtime or refetch
    }

    return (
        <header className="h-16 bg-white border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl"
            >
                <MenuIcon size={20} className="text-slate-600" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
                {/* Order Status Toggle */}
                {restaurant && (
                    <button
                        onClick={handleToggleOrders}
                        className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${restaurant.is_accepting_orders
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${restaurant.is_accepting_orders ? 'bg-green-500' : 'bg-red-500'}`} />
                        {restaurant.is_accepting_orders ? 'Aceptando Pedidos' : 'Pausado'}
                    </button>
                )}

                {/* Notifications */}
                <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                    <Bell size={20} className="text-slate-500" />
                    {(pendingOrders + pendingCalls) > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {pendingOrders + pendingCalls}
                        </span>
                    )}
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-slate-900">
                            {restaurant?.name || 'Mi Restaurante'}
                        </p>
                        <p className="text-xs text-slate-400">
                            {user?.email}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </header>
    )
}
