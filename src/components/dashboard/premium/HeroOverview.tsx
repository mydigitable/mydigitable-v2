
import { ArrowUp, ArrowDown, Activity } from 'lucide-react'
import styles from './HeroOverview.module.css'

interface HeroOverviewProps {
    stats: {
        todayRevenue: number
        yesterdayRevenue: number
        todayOrders: number
        averageTicket: number
    }
}

export function HeroOverview({ stats }: HeroOverviewProps) {
    const revenueChange = ((stats.todayRevenue - stats.yesterdayRevenue) / (stats.yesterdayRevenue || 1)) * 100
    const isPositive = revenueChange >= 0

    return (
        <div className={styles.hero}>
            <div className={styles.metricsColumn}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricTitle}>Ingresos Totales</span>
                        <span className={`${styles.trendBadge} ${isPositive ? styles.positive : styles.negative}`}>
                            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            {Math.abs(revenueChange).toFixed(1)}%
                        </span>
                    </div>
                    <div className={styles.metricValue}>€{stats.todayRevenue.toFixed(2)}</div>
                    <div className={styles.metricSubtext}>vs. €{stats.yesterdayRevenue.toFixed(2)} ayer</div>
                </div>

                <div className={styles.secondaryMetrics}>
                    <div className={styles.secondaryItem}>
                        <span className={styles.secondaryLabel}>Pedidos</span>
                        <span className={styles.secondaryValue}>{stats.todayOrders}</span>
                    </div>
                    <div className={styles.secondaryItem}>
                        <span className={styles.secondaryLabel}>Ticket Medio</span>
                        <span className={styles.secondaryValue}>€{stats.averageTicket.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className={styles.chartColumn}>
                <div className={styles.chartHeader}>
                    <h3>Rendimiento de Ventas</h3>
                    <div className={styles.periodSelector}>
                        <span className={styles.periodActive}>7D</span>
                        <span>30D</span>
                        <span>YTD</span>
                    </div>
                </div>
                {/* Custom SVG Chart Placeholder - Premium Look */}
                <div className={styles.chartContainer}>
                    <svg viewBox="0 0 500 150" className={styles.chartSvg}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0,120 C50,100 100,130 150,80 C200,30 250,90 300,60 C350,30 400,80 450,40 L500,20 L500,150 L0,150 Z"
                            fill="url(#chartGradient)"
                        />
                        <path
                            d="M0,120 C50,100 100,130 150,80 C200,30 250,90 300,60 C350,30 400,80 450,40 L500,20"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className={styles.chartTooltip} style={{ left: '60%', top: '20%' }}>
                        <span className={styles.tooltipValue}>€450.00</span>
                        <span className={styles.tooltipDate}>12 Feb</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
