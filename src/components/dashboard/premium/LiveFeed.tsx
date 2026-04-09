
import Link from 'next/link'
import { ShoppingBag, CreditCard, Bell, RotateCw } from 'lucide-react'
import styles from './LiveFeed.module.css'

interface LiveFeedProps {
    restaurantId: string
}

export function LiveFeed({ restaurantId }: LiveFeedProps) {
    // Mock data - replace with realtime from DashboardClient
    const activities = [
        { id: 1, type: 'order', title: 'Pedido #482', subtitle: 'Mesa 4 • 3 items', time: '2 min', value: '€45.50', status: 'preparing' },
        { id: 2, type: 'payment', title: 'Pago Recibido', subtitle: 'Visa •••• 4242', time: '5 min', value: '€22.00', status: 'completed' },
        { id: 3, type: 'call', title: 'Llamada al Mozo', subtitle: 'Mesa 8', time: '8 min', value: '', status: 'pending' },
        { id: 4, type: 'order', title: 'Pedido #481', subtitle: 'Mesa 2 • 1 item', time: '12 min', value: '€12.50', status: 'completed' },
        { id: 5, type: 'stock', title: 'Stock Bajo', subtitle: 'Coca Cola Zero', time: '1h', value: '2 un.', status: 'warning' },
    ]

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Actividad en Vivo</h3>
                <button className={styles.refreshButton}>
                    <RotateCw size={14} />
                </button>
            </div>

            <div className={styles.list}>
                {activities.map((item) => (
                    <div key={item.id} className={styles.item}>
                        <div className={`${styles.iconBase} ${styles[item.type]}`}>
                            {item.type === 'order' && <ShoppingBag size={18} />}
                            {item.type === 'payment' && <CreditCard size={18} />}
                            {item.type === 'call' && <Bell size={18} />}
                            {item.type === 'stock' && <RotateCw size={18} />}
                        </div>

                        <div className={styles.content}>
                            <div className={styles.topLine}>
                                <span className={styles.title}>{item.title}</span>
                                <span className={styles.time}>{item.time}</span>
                            </div>
                            <div className={styles.bottomLine}>
                                <span className={styles.subtitle}>{item.subtitle}</span>
                                {item.value && <span className={styles.value}>{item.value}</span>}
                            </div>
                        </div>

                        <div className={`${styles.statusDot} ${styles[item.status]}`} />
                    </div>
                ))}
            </div>

            <Link href="/dashboard/orders" className={styles.footerLink}>
                Ver todos los movimientos →
            </Link>
        </div>
    )
}
