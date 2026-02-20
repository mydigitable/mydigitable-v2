export function TopProducts({ restaurantId }: { restaurantId: string }) {
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--tx)' }}>Top Productos</h3>
            <p style={{ color: 'var(--tx2)', fontSize: '0.875rem' }}>Sin pedidos hoy</p>
        </div>
    )
}
