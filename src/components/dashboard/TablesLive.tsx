import Link from "next/link"
import styles from "./TablesLive.module.css"

interface TablesLiveProps {
    tables: any[]
    waiterCalls: any[]
}

export function TablesLive({ tables, waiterCalls }: TablesLiveProps) {
    if (tables.length === 0) {
        return (
            <div className={styles.empty}>
                <p>Configura tus mesas → <Link href="/dashboard/tables">Ir a Mesas</Link></p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Mesas en Vivo</h3>
            <div className={styles.grid}>
                {tables.map((table) => {
                    const hasCalling = waiterCalls.some(call => call.table_id === table.id)
                    return (
                        <Link href={`/dashboard/tables`} key={table.id} className={`${styles.table} ${styles[`table${table.status}`]}`}>
                            {hasCalling && <span className={styles.calling}>🔔</span>}
                            <div className={styles.tableNumber}>Mesa {table.number}</div>
                            {table.status === 'occupied' && table.current_amount && (
                                <div className={styles.tableAmount}>€{table.current_amount.toFixed(2)}</div>
                            )}
                            {table.status === 'paying' && <div className={styles.tableIcon}>💳</div>}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
