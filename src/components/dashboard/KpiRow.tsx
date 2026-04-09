import styles from "./KpiRow.module.css"

interface KpiRowProps {
    stats: {
        todayRevenue: number
        yesterdayRevenue: number
        todayOrders: number
        averageTicket: number
        activeOrdersCount: number
        waiterCallsCount: number
        outOfStockCount: number
    }
}

export function KpiRow({ stats }: KpiRowProps) {
    const percentChange = stats.yesterdayRevenue > 0
        ? ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100
        : 0

    const dailyGoal = 400 // TODO: Calcular desde historial
    const goalProgress = (stats.todayRevenue / dailyGoal) * 100

    return (
        <div className={styles.kpiRow}>
            {/* KPI 1: Ventas */}
            <div className={styles.kpi}>
                <div className={styles.kpiHeader}>
                    <div className={styles.kpiIcon} style={{ background: '#DCFCE7' }}>
                        <span style={{ color: '#16A34A' }}>€</span>
                    </div>
                    <span className={percentChange >= 0 ? styles.tagPositive : styles.tagNegative}>
                        {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                    </span>
                </div>
                <div className={styles.kpiValue}>€{stats.todayRevenue.toFixed(2)}</div>
                <div className={styles.kpiLabel}>Ventas</div>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${Math.min(goalProgress, 100)}%`, background: '#16A34A' }} />
                </div>
                <div className={styles.kpiSubtext}>
                    {goalProgress.toFixed(0)}% de la meta · Meta €{dailyGoal}
                </div>
            </div>

            {/* KPI 2: Pedidos */}
            <div className={styles.kpi}>
                <div className={styles.kpiHeader}>
                    <div className={styles.kpiIcon} style={{ background: '#DBEAFE' }}>
                        <span style={{ color: '#2563EB' }}>🍽️</span>
                    </div>
                    <span className={styles.tagInfo}>
                        {stats.activeOrdersCount} activos
                    </span>
                </div>
                <div className={styles.kpiValue}>{stats.todayOrders}</div>
                <div className={styles.kpiLabel}>Pedidos</div>
                <div className={styles.kpiSubtext}>
                    €{stats.averageTicket.toFixed(2)} promedio
                </div>
            </div>

            {/* KPI 3: Mesas */}
            <div className={styles.kpi}>
                <div className={styles.kpiHeader}>
                    <div className={styles.kpiIcon} style={{ background: '#FEF3C7' }}>
                        <span style={{ color: '#D97706' }}>🪑</span>
                    </div>
                    {stats.waiterCallsCount > 0 ? (
                        <span className={styles.tagWarning}>
                            {stats.waiterCallsCount} llamadas 🔔
                        </span>
                    ) : (
                        <span className={styles.tagNeutral}>Sin llamadas</span>
                    )}
                </div>
                <div className={styles.kpiValue}>—</div>
                <div className={styles.kpiLabel}>Mesas</div>
                <div className={styles.kpiSubtext}>
                    Configura tus mesas
                </div>
            </div>

            {/* KPI 4: Stock */}
            <div className={styles.kpi}>
                <div className={styles.kpiHeader}>
                    <div className={styles.kpiIcon} style={{ background: stats.outOfStockCount > 0 ? '#FEE2E2' : '#DCFCE7' }}>
                        <span style={{ color: stats.outOfStockCount > 0 ? '#DC2626' : '#16A34A' }}>📦</span>
                    </div>
                    {stats.outOfStockCount > 0 ? (
                        <span className={styles.tagDanger}>Requiere atención</span>
                    ) : (
                        <span className={styles.tagSuccess}>Todo OK</span>
                    )}
                </div>
                <div className={styles.kpiValue} style={{ color: stats.outOfStockCount > 0 ? '#DC2626' : '#16A34A' }}>
                    {stats.outOfStockCount}
                </div>
                <div className={styles.kpiLabel}>Sin stock</div>
                <div className={styles.kpiSubtext}>
                    {stats.outOfStockCount === 0 ? 'Todos los productos disponibles ✓' : `${stats.outOfStockCount} productos agotados`}
                </div>
            </div>
        </div>
    )
}
