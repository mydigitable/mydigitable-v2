import Link from "next/link"
import styles from "./QuickActions.module.css"

export function QuickActions() {
    return (
        <div className={styles.container}>
            <Link href="/dashboard/staff" className={styles.action}>
                <div className={styles.icon} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>👥</div>
                <div className={styles.content}>
                    <h3 className={styles.title}>Nuevo Staff</h3>
                    <p className={styles.subtitle}>Gestionar equipo</p>
                </div>
            </Link>

            <Link href="/dashboard/settings/hours" className={styles.action}>
                <div className={styles.icon} style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>📅</div>
                <div className={styles.content}>
                    <h3 className={styles.title}>Horarios</h3>
                    <p className={styles.subtitle}>Configurar apertura</p>
                </div>
            </Link>

            <Link href="/dashboard/settings/billing" className={styles.action}>
                <div className={styles.icon} style={{ background: 'var(--success-light)', color: 'var(--success)' }}>💳</div>
                <div className={styles.content}>
                    <h3 className={styles.title}>Facturación</h3>
                    <p className={styles.subtitle}>Ver plan y pagos</p>
                </div>
            </Link>
        </div>
    )
}
