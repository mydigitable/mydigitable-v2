import Link from "next/link"

interface MenuStatusProps {
    activeMenu: any
    outOfStockCount: number
}

export function MenuStatus({ activeMenu, outOfStockCount }: MenuStatusProps) {
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--tx)' }}>Estado del Menú</h3>
            {activeMenu ? (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', background: 'var(--green-light)', color: 'var(--green)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ● {activeMenu.name}
                        </span>
                    </div>
                    {outOfStockCount > 0 && (
                        <p style={{ color: 'var(--red)', fontSize: '0.875rem' }}>
                            {outOfStockCount} productos sin stock
                        </p>
                    )}
                    <Link href="/dashboard/menu" style={{ display: 'block', width: '100%', padding: '0.75rem', background: 'var(--green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>
                        Ir al menú →
                    </Link>
                </div>
            ) : (
                <p style={{ color: 'var(--tx2)', fontSize: '0.875rem' }}>Crea tu primer menú → <Link href="/dashboard/menu" style={{ color: 'var(--green)' }}>Ir al Menú</Link></p>
            )}
        </div>
    )
}
