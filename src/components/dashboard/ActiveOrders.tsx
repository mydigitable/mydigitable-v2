import Link from "next/link"

interface ActiveOrdersProps {
    orders: any[]
}

export function ActiveOrders({ orders }: ActiveOrdersProps) {
    if (orders.length === 0) {
        return (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--tx)' }}>Pedidos Activos</h3>
                <p style={{ color: 'var(--green)', fontSize: '0.875rem' }}>Sin pedidos activos ahora ✓</p>
            </div>
        )
    }

    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--tx)' }}>Pedidos Activos</h3>
                <Link href="/dashboard/orders" style={{ fontSize: '0.875rem', color: 'var(--blue)', textDecoration: 'none' }}>Ver todos →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.slice(0, 4).map((order) => (
                    <Link href={`/dashboard/orders/${order.id}`} key={order.id} style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '8px', textDecoration: 'none', display: 'block' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--tx)' }}>Mesa {order.table_id || '—'}</span>
                            <span style={{ color: 'var(--tx2)', fontSize: '0.875rem' }}>€{order.total_amount?.toFixed(2)}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--tx3)' }}>{order.status}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
