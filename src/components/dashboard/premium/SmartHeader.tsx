import { useState } from 'react'
import { Calendar, ChevronDown, CheckCircle2 } from 'lucide-react'
import styles from './SmartHeader.module.css'

interface SmartHeaderProps {
    restaurantName: string
    stats: {
        todayRevenue: number
        todayOrders: number
        averageTicket: number
    }
}

export function SmartHeader({ restaurantName, stats }: SmartHeaderProps) {
    const [status, setStatus] = useState<'open' | 'closed'>('open')

    return (
        <div className={styles.header}>
            <div className={styles.topRow}>
                <div className={styles.branding}>
                    <div className={styles.avatar}>
                        {restaurantName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h1 className={styles.title}>{restaurantName}</h1>
                        <div className={styles.statusIndicator}>
                            <div className={`${styles.statusDot} ${status === 'open' ? styles.open : styles.closed}`} />
                            <span className={styles.statusText}>
                                {status === 'open' ? 'Aceptando pedidos' : 'Cerrado temporalmente'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.controls}>
                    <button className={styles.datePicker}>
                        <Calendar size={16} />
                        <span>Hoy, 12 Feb</span>
                        <ChevronDown size={14} className={styles.chevron} />
                    </button>
                    <button className={styles.primaryAction}>
                        <span>Nuevo Pedido</span>
                    </button>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.inlineMetrics}>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Ventas hoy</span>
                    <span className={styles.metricValue}>€{stats.todayRevenue.toFixed(2)}</span>
                </div>
                <div className={styles.metricDivider} />
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Pedidos</span>
                    <span className={styles.metricValue}>{stats.todayOrders}</span>
                </div>
                <div className={styles.metricDivider} />
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Ticket Medio</span>
                    <span className={styles.metricValue}>€{stats.averageTicket.toFixed(2)}</span>
                </div>
            </div>
        </div>
    )
}
