import styles from "./SummaryBanner.module.css"

interface SummaryBannerProps {
    stats: {
        todayRevenue: number
        yesterdayRevenue: number
        todayOrders: number
        averageTicket: number
        waiterCallsCount: number
        outOfStockCount: number
    }
    outOfStock: any[]
}

export function SummaryBanner({ stats, outOfStock }: SummaryBannerProps) {
    const percentChange = stats.yesterdayRevenue > 0
        ? ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100
        : 0

    const direction = percentChange >= 0 ? 'más' : 'menos'
    const absPercent = Math.abs(percentChange).toFixed(1)

    return (
        <div className={styles.banner}>
            <div className={styles.emoji}>📊</div>
            <div className={styles.content}>
                <p className={styles.text}>
                    Llevás <strong>€{stats.todayRevenue.toFixed(2)}</strong> en ventas
                    {stats.yesterdayRevenue > 0 && (
                        <> — un <strong>{absPercent}% {direction}</strong> que ayer</>
                    )}.
                    Completaste <strong>{stats.todayOrders} pedidos</strong> con ticket promedio de <strong>€{stats.averageTicket.toFixed(2)}</strong>.
                    {stats.outOfStockCount > 0 && (
                        <> Hay <strong>{stats.outOfStockCount} productos sin stock</strong>.</>
                    )}
                    {stats.waiterCallsCount > 0 && (
                        <> <strong>{stats.waiterCallsCount} mesas llamaron al mozo</strong>.</>
                    )}
                </p>
                <div className={styles.tags}>
                    <span className={styles.tag}>€{stats.todayRevenue.toFixed(0)} ventas</span>
                    <span className={styles.tag}>{stats.todayOrders} pedidos</span>
                    <span className={styles.tag}>€{stats.averageTicket.toFixed(2)} promedio</span>
                    {stats.waiterCallsCount > 0 && (
                        <span className={`${styles.tag} ${styles.tagWarning}`}>
                            {stats.waiterCallsCount} llamadas
                        </span>
                    )}
                    {stats.outOfStockCount > 0 && (
                        <span className={`${styles.tag} ${styles.tagDanger}`}>
                            {stats.outOfStockCount} sin stock
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
