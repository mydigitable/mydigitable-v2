"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { ArrowUp, ArrowDown, ShoppingBag, CreditCard, Bell, Users, Plus, List, QrCode, UserPlus, Clock } from "lucide-react"
import styles from "./DashboardModern.module.css"

interface DashboardModernClientProps {
    initialData: any
}

export function DashboardModernClient({ initialData }: DashboardModernClientProps) {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Polling every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData()
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    const refreshData = async () => {
        setLoading(true)
        // Re-fetch essential realtime data
        const { count: activeOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', data.restaurant.id)
            .in('status', ['pending', 'preparing', 'ready'])

        // ... (other refreshes could go here)

        setData((prev: any) => ({
            ...prev,
            stats: { ...prev.stats, activeOrdersCount: activeOrders || 0 }
        }))
        setLoading(false)
    }

    // Mock chart data (since we might not have 7 days of real data yet)
    const chartData = [
        { name: 'Lun', ventas: 120 },
        { name: 'Mar', ventas: 250 },
        { name: 'Mie', ventas: 180 },
        { name: 'Jue', ventas: 300 },
        { name: 'Vie', ventas: 280 },
        { name: 'Sab', ventas: 450 },
        { name: 'Dom', ventas: 380 },
    ]

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.welcome}>Hola, {data.restaurant.name}! 👋</h1>
                    <p className={styles.date}>Hoy es {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className={styles.headerActions}>
                    <span className={styles.planBadge}>Plan BÁSICO</span>
                    <a href="/pricing" className={styles.upgradeLink}>Ver planes →</a>
                </div>
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {/* Ventas */}
                <div className={styles.card}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#22c55e' }}>💰</div>
                        <span className={`${styles.statTrend} ${styles.trendUp}`}>▲ 12%</span>
                    </div>
                    <div className={styles.statValue}>€{data.stats.todayRevenue.toFixed(2)}</div>
                    <div className={styles.statSubtitle}>{data.stats.todayOrders} pedidos hoy</div>
                </div>

                {/* Pedidos Activos */}
                <div className={styles.card}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: '#dbeafe', color: '#3b82f6' }}>📦</div>
                        <span className={styles.statTrend} style={{ color: '#3b82f6' }}>En vivo</span>
                    </div>
                    <div className={styles.statValue}>{data.stats.activeOrdersCount}</div>
                    <div className={styles.statSubtitle}>Pedidos en curso</div>
                </div>

                {/* Mesas */}
                <div className={styles.card}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: '#ffedd5', color: '#f97316' }}>🪑</div>
                        <span className={styles.statTrend} style={{ color: '#f97316' }}>{data.tables.filter((t: any) => t.status === 'occupied').length}/{data.tables.length}</span>
                    </div>
                    <div className={styles.statValue}>
                        {Math.round((data.tables.filter((t: any) => t.status === 'occupied').length / (data.tables.length || 1)) * 100)}%
                    </div>
                    <div className={styles.statSubtitle}>Ocupación actual</div>
                    <div style={{ height: '4px', background: '#ffe4e6', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${(data.tables.filter((t: any) => t.status === 'occupied').length / (data.tables.length || 1)) * 100}%`, background: '#f97316', height: '100%' }} />
                    </div>
                </div>

                {/* Ticket Medio */}
                <div className={styles.card}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: '#f3e8ff', color: '#a855f7' }}>📊</div>
                    </div>
                    <div className={styles.statValue}>€{data.stats.averageTicket.toFixed(2)}</div>
                    <div className={styles.statSubtitle}>Promedio por pedido</div>
                </div>
            </div>

            {/* Chart Section */}
            <div className={styles.chartContainer}>
                <h3 className={styles.sectionTitle}>📈 Ventas últimos 7 días</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `€${val}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                formatter={(value: any) => [`€${value}`, 'Ventas']}
                            />
                            <Area type="monotone" dataKey="ventas" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Split Section: Actions & Notifications */}
            <div className={styles.twoColumnGrid}>
                {/* Quick Actions */}
                <div>
                    <h3 className={styles.sectionTitle}>🚀 Acciones rápidas</h3>
                    <div className={styles.actionList}>
                        <ActionCard icon={<Plus size={20} />} label="Nuevo pedido manual" color="green" />
                        <ActionCard icon={<List size={20} />} label="Ver menú completo" color="blue" />
                        <ActionCard icon={<QrCode size={20} />} label="Generar códigos QR" color="purple" />
                        <ActionCard icon={<UserPlus size={20} />} label="Agregar staff" color="orange" />
                    </div>
                </div>

                {/* Notifications & Top Products */}
                <div>
                    <h3 className={styles.sectionTitle}>🔔 Notificaciones</h3>
                    <div className={styles.notificationList}>
                        {data.waiterCalls.map((call: any) => (
                            <div key={call.id} className={styles.notificationItem} style={{ borderLeftColor: '#ef4444' }}>
                                <Bell size={16} color="#ef4444" />
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Mesa {call.table_id} llama al mozo</span>
                                </div>
                                <span className={styles.notifTime}>Hace 2m</span>
                            </div>
                        ))}
                        <div className={styles.notificationItem} style={{ borderLeftColor: '#22c55e' }}>
                            <ShoppingBag size={16} color="#22c55e" />
                            <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Pedido #123 listo</span>
                            </div>
                            <span className={styles.notifTime}>Hace 5m</span>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>🔥 Top Productos</h3>
                    <div className={styles.productList}>
                        <ProductRow name="Pizza Margarita" count={24} percent={85} color="#ef4444" />
                        <ProductRow name="Hamburguesa Clásica" count={18} percent={64} color="#f97316" />
                        <ProductRow name="Pasta Carbonara" count={15} percent={50} color="#eab308" />
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>📋 Últimos pedidos</div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th># ID</th>
                            <th>Mesa</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Hace</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.activeOrders.map((order: any) => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 600 }}>#{order.id.toString().slice(0, 4)}</td>
                                <td>{order.table_id || '-'}</td>
                                <td style={{ fontWeight: 700 }}>€{order.total?.toFixed(2)}</td>
                                <td>
                                    <span className={styles.statusPill} style={{
                                        background: order.status === 'completed' ? '#dcfce7' : order.status === 'preparing' ? '#fff7ed' : '#fee2e2',
                                        color: order.status === 'completed' ? '#166534' : order.status === 'preparing' ? '#c2410c' : '#b91c1c'
                                    }}>
                                        {order.status === 'completed' ? 'Completado' : order.status === 'preparing' ? 'En cocina' : order.status}
                                    </span>
                                </td>
                                <td style={{ color: '#6b7280' }}><Clock size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> 5m</td>
                            </tr>
                        ))}

                        {/* Fake rows for demo if empty */}
                        {data.activeOrders.length === 0 && [1, 2, 3].map((i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>#{140 + i}</td>
                                <td>{3 + i}</td>
                                <td style={{ fontWeight: 700 }}>€{(15 + i * 5).toFixed(2)}</td>
                                <td>
                                    <span className={styles.statusPill} style={{ background: '#dcfce7', color: '#166534' }}>Completado</span>
                                </td>
                                <td style={{ color: '#6b7280' }}><Clock size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> {10 + i}m</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Sub-components
function ActionCard({ icon, label, color }: { icon: any, label: string, color: string }) {
    const colors: any = {
        green: { bg: '#dcfce7', text: '#166534' },
        blue: { bg: '#dbeafe', text: '#1e40af' },
        purple: { bg: '#f3e8ff', text: '#6b21a8' },
        orange: { bg: '#ffedd5', text: '#9a3412' }
    }
    return (
        <button className={styles.actionButton} style={{ borderLeft: `4px solid ${colors[color].text}` }}>
            <div style={{ padding: 8, borderRadius: 8, background: colors[color].bg, color: colors[color].text }}>
                {icon}
            </div>
            <span>{label}</span>
        </button>
    )
}

function ProductRow({ name, count, percent, color }: { name: string, count: number, percent: number, color: string }) {
    return (
        <div className={styles.productRow}>
            <span className={styles.productName}>{name} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({count})</span></span>
            <div className={styles.progressBarTrack}>
                <div className={styles.progressBarFill} style={{ width: `${percent}%`, background: color }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '30px' }}>{percent}%</span>
        </div>
    )
}
