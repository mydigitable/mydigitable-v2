import Link from "next/link"

interface StaffOnShiftProps {
    staff: any[]
}

export function StaffOnShift({ staff }: StaffOnShiftProps) {
    if (staff.length === 0) {
        return (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--tx)' }}>Staff en Turno</h3>
                <p style={{ color: 'var(--tx2)', fontSize: '0.875rem' }}>Añade personal → <Link href="/dashboard/staff" style={{ color: 'var(--green)' }}>Ir a Staff</Link></p>
            </div>
        )
    }

    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--tx)' }}>Staff en Turno</h3>
                <Link href="/dashboard/staff" style={{ fontSize: '0.875rem', color: 'var(--blue)', textDecoration: 'none' }}>Gestionar →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {staff.map((member) => (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: member.is_active ? 'var(--green)' : 'var(--tx3)' }} />
                        <span style={{ color: 'var(--tx)', fontSize: '0.875rem' }}>{member.role === 'waiter' ? 'Mozo' : member.role === 'kitchen' ? 'Cocina' : member.role}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
