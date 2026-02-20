import Link from "next/link"

export function ActivityFeed({ restaurantId }: { restaurantId: string }) {
    // Mock data for now - in real app this would come from Supabase
    const activities = [
        { id: 1, type: 'payment', title: 'Mesa 4 pagó con tarjeta', time: 'Hace 2 min', amount: '€45.50', link: '/dashboard/orders/123' },
        { id: 2, type: 'order', title: 'Nuevo pedido en Mesa 2', time: 'Hace 5 min', items: '2x Burger, 2x Cola', link: '/dashboard/orders/124' },
        { id: 3, type: 'tip', title: 'Propina digital recibida', time: 'Hace 12 min', amount: '€5.00', link: '/dashboard/orders/125' },
        { id: 4, type: 'call', title: 'Mesa 6 llama al mozo', time: 'Hace 15 min', status: 'Atendida', link: '/dashboard/tables' },
    ]

    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--tx)' }}>Actividad Reciente</h3>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {activities.map((activity) => (
                    <Link href={activity.link} key={activity.id} style={{ display: 'flex', alignItems: 'start', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', textDecoration: 'none', transition: 'background 0.2s' }} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
                            background: activity.type === 'payment' ? 'var(--green-light)' : activity.type === 'order' ? '#DBEAFE' : activity.type === 'tip' ? '#FCE7F3' : '#FEF3C7',
                            color: activity.type === 'payment' ? 'var(--green)' : activity.type === 'order' ? '#2563EB' : activity.type === 'tip' ? '#DB2777' : '#D97706'
                        }}>
                            {activity.type === 'payment' ? '💳' : activity.type === 'order' ? '📦' : activity.type === 'tip' ? '❤️' : '🔔'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 500, color: 'var(--tx)', fontSize: '0.9375rem' }}>{activity.title}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--tx3)' }}>{activity.time}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--tx2)' }}>
                                {activity.items || activity.amount || activity.status}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
