
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, ArrowRight, XCircle } from 'lucide-react'
import styles from './HealthStatus.module.css'

interface HealthStatusProps {
    outOfStockCount: number
    onboardingSteps: number
    activeMenu: any
}

export function HealthStatus({ outOfStockCount, onboardingSteps, activeMenu }: HealthStatusProps) {
    const isStripeConnected = onboardingSteps >= 5 // Mock logic
    const isQrActive = onboardingSteps >= 4 // Mock logic

    const items = [
        {
            id: 'stripe',
            label: 'Pagos con Stripe',
            status: isStripeConnected ? 'ok' : 'critical',
            action: isStripeConnected ? 'Configurar' : 'Conectar ahora',
            href: '/dashboard/settings/payments',
            description: isStripeConnected ? 'Conectado y recibiendo pagos' : 'No puedes recibir pagos online'
        },
        {
            id: 'menu',
            label: 'Menú Digital',
            status: activeMenu ? (outOfStockCount > 0 ? 'warning' : 'ok') : 'critical',
            action: activeMenu ? 'Gestionar' : 'Crear Menú',
            href: '/dashboard/menu',
            description: activeMenu ? (outOfStockCount > 0 ? `${outOfStockCount} productos sin stock` : 'Menú activo y visible') : 'Sin menú publicado'
        },
        {
            id: 'qr',
            label: 'Códigos QR',
            status: isQrActive ? 'ok' : 'warning',
            action: isQrActive ? 'Ver QRs' : 'Generar',
            href: '/dashboard/qr',
            description: isQrActive ? 'QRs generados correctamente' : 'Genera QRs para tus mesas'
        }
    ]

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Estado del Negocio</h3>
                <span className={styles.badge}>{items.filter(i => i.status === 'ok').length}/3 OK</span>
            </div>

            <div className={styles.list}>
                {items.map((item) => (
                    <div key={item.id} className={`${styles.item} ${styles[item.status]}`}>
                        <div className={styles.iconWrapper}>
                            {item.status === 'ok' && <CheckCircle2 className={styles.iconOk} size={20} />}
                            {item.status === 'warning' && <AlertTriangle className={styles.iconWarning} size={20} />}
                            {item.status === 'critical' && <XCircle className={styles.iconCritical} size={20} />}
                        </div>
                        <div className={styles.content}>
                            <div className={styles.itemHeader}>
                                <span className={styles.label}>{item.label}</span>
                                {item.status === 'critical' && <span className={styles.criticalBadge}>Atención</span>}
                            </div>
                            <p className={styles.description}>{item.description}</p>
                        </div>
                        <Link href={item.href} className={styles.actionButton}>
                            {item.action} <ArrowRight size={14} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
