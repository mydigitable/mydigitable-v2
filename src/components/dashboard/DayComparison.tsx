interface DayComparisonProps {
    stats: {
        todayRevenue: number
        yesterdayRevenue: number
        todayOrders: number
        averageTicket: number
    }
}

export function DayComparison({ stats }: DayComparisonProps) {
    const revenueDelta = stats.todayRevenue - stats.yesterdayRevenue

    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--tx)' }}>Hoy vs Ayer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--tx2)', fontSize: '0.875rem' }}>Ventas</span>
                    <span style={{ color: revenueDelta >= 0 ? '#16A34A' : '#EF4444', fontWeight: 600 }}>
                        {revenueDelta >= 0 ? '+' : ''}€{revenueDelta.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    )
}
