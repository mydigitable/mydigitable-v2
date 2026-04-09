"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { SmartHeader } from "./premium/SmartHeader"
import { HeroOverview } from "./premium/HeroOverview"
import { HealthStatus } from "./premium/HealthStatus"
import { LiveFeed } from "./premium/LiveFeed"
import { QuickActions } from "./QuickActions" // Reuse existing, will style later if needed
import styles from "./Dashboard.module.css"

interface DashboardClientProps {
    initialData: any
}

export function DashboardClient({ initialData }: DashboardClientProps) {
    const [data, setData] = useState(initialData)
    const supabase = createClient()

    // Realtime subscriptions same as before...
    useEffect(() => {
        const tablesChannel = supabase
            .channel('tables-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${data.restaurant.id}` }, () => refreshTables())
            .subscribe()

        const ordersChannel = supabase
            .channel('orders-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${data.restaurant.id}` }, (payload) => {

                refreshOrders()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(tablesChannel)
            supabase.removeChannel(ordersChannel)
        }
    }, [data.restaurant.id])

    const refreshTables = async () => { /* ... existing logic ... */ }
    const refreshOrders = async () => { /* ... existing logic ... */ }

    return (
        <div className={styles.premiumDashboard}>
            <SmartHeader
                restaurantName={data.restaurant.name}
                stats={data.stats}
            />

            <main className={styles.premiumContainer}>

                {/* Hero Section: 100% width */}
                <HeroOverview stats={data.stats} />

                {/* Split Section: 70% Feed / 30% Health */}
                <div className={styles.splitGrid}>
                    <div className={styles.feedColumn}>
                        <LiveFeed restaurantId={data.restaurant.id} />
                    </div>
                    <div className={styles.healthColumn}>
                        <HealthStatus
                            outOfStockCount={data.stats.outOfStockCount}
                            onboardingSteps={data.onboardingSteps}
                            activeMenu={data.activeMenu}
                        />
                        {/* Quick Actions reusing existing component for now, placed in sidebar or bottom */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <QuickActions />
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}
