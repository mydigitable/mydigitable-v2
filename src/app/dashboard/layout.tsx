"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { TopBar } from "@/components/dashboard/TopBar"

// Sidebar Context (for potential future use)
interface SidebarContextType {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
    isMobileOpen: boolean
    setIsMobileOpen: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: false,
    setIsCollapsed: () => { },
    isMobileOpen: false,
    setIsMobileOpen: () => { },
})

export const useSidebar = () => useContext(SidebarContext)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // UI State
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Data State
    const [restaurant, setRestaurant] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [pendingOrders, setPendingOrders] = useState(0)
    const [pendingCalls, setPendingCalls] = useState(0)

    const router = useRouter()
    const supabase = createClient()

    // Initialize
    useEffect(() => {
        // Load collapsed state from localStorage
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved) setIsCollapsed(saved === 'true')
    }, [])

    // Load pending counts
    const loadCounts = async (restaurantId: string) => {
        const { count: ordersCount } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("restaurant_id", restaurantId)
            .in("status", ["pending", "confirmed", "preparing"])

        setPendingOrders(ordersCount || 0)

        const { count: callsCount } = await supabase
            .from("waiter_calls")
            .select("*", { count: "exact", head: true })
            .eq("restaurant_id", restaurantId)
            .eq("status", "pending")

        setPendingCalls(callsCount || 0)
    }

    // Setup realtime subscriptions
    const setupRealtimeSubscriptions = async () => {
        // TODO: Implement realtime updates for orders and calls
        // This will refresh counts automatically
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
            <div className="min-h-screen bg-slate-50 flex">
                {/* Sidebar Component */}
                <Sidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                    restaurant={restaurant}
                    pendingOrders={pendingOrders}
                    pendingCalls={pendingCalls}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* TopBar Component */}
                    <TopBar
                        setIsMobileOpen={setIsMobileOpen}
                        restaurant={restaurant}
                        user={user}
                        pendingOrders={pendingOrders}
                        pendingCalls={pendingCalls}
                    />

                    {/* Page Content */}
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    )
}
