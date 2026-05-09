import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Navbar';

const ALLOWED_ROLES = ['ADMIN', 'MANAGER'];

const STATUS_COLORS = {
    AVAILABLE: '#059669',
    ASSIGNED: '#0F766E',
    IN_REPAIR: '#D97706',
    EXPIRED: '#E11D48',
    DECOMMISSIONED: '#475569',
};

const TYPE_COLORS = ['#0F766E', '#059669', '#14B8A6', '#0284C7', '#4F46E5'];

function StatCard({ label, value, sub, color, icon, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: 'var(--shadow)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow .15s',
            }}
            onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
        >
            <div style={{
                width: '44px', height: '44px',
                borderRadius: '10px',
                background: color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, flexShrink: 0,
                fontSize: '20px',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
                {sub && <div style={{ fontSize: '11px', color: color, marginTop: '2px', fontWeight: 500 }}>{sub}</div>}
            </div>
        </div>
    );
}

function ExpiryWarningBadge({ asset }) {
    const expiry = asset.warrantyExpirationDate ? new Date(asset.warrantyExpirationDate) : null;
    if (!expiry) return null;
    const daysLeft = Math.ceil((expiry - Date.now()) / 86400000);
    if (daysLeft > 30) return null;

    const isExpired = daysLeft <= 0;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            background: isExpired ? '#FEE2E2' : '#FEF3C7',
            color: isExpired ? '#DC2626' : '#D97706',
            marginLeft: '6px',
        }}>
            <Icon name="alert-triangle" size={12} style={{ marginRight: '2px' }} /> {isExpired ? 'Expired' : `${daysLeft}d left`}
        </span>
    );
}

function SuggestedAction({ asset }) {
    const navigate = useNavigate();
    const expiry = asset.warrantyExpirationDate ? new Date(asset.warrantyExpirationDate) : null;
    const daysLeft = expiry ? Math.ceil((expiry - Date.now()) / 86400000) : null;
    const isExpired = daysLeft !== null && daysLeft <= 0;

    if (!isExpired && asset.status !== 'DECOMMISSIONED') return null;

    return (
        <div style={{
            display: 'flex',
            gap: '6px',
            marginTop: '4px',
            flexWrap: 'wrap',
        }}>
            {asset.status === 'ASSIGNED' && (
                <button
                    onClick={(e) => { e.stopPropagation(); navigate('/assets/assign'); }}
                    style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '4px', color: '#1D4ED8', fontSize: '11px', padding: '2px 8px', cursor: 'pointer', fontWeight: 500 }}
                >
                    Reassign →
                </button>
            )}
            {(isExpired || asset.status === 'DECOMMISSIONED') && (
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/assets/${asset.id}`); }}
                    style={{ background: '#F1F5F9', border: '1px solid var(--border)', borderRadius: '4px', color: '#64748B', fontSize: '11px', padding: '2px 8px', cursor: 'pointer', fontWeight: 500 }}
                >
                    Decommission →
                </button>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { notifications, unreadCount } = useNotifications();

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchAssets = useCallback(async () => {
        try {
            const { data } = await api.get('/assets');
            const list = Array.isArray(data) ? data : (data.content ?? []);
            setAssets(list);
            setLastUpdated(new Date());
        } catch {
            // silently fail on poll
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
        const interval = setInterval(fetchAssets, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, [fetchAssets]);

    // Derived stats
    const total = assets.length;
    const byStatus = assets.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
    }, {});
    const byType = assets.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] ?? 0) + 1;
        return acc;
    }, {});

    const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
    const typeData = Object.entries(byType).map(([name, value]) => ({ name, value }));

    // Expiring/expired assets
    const flaggedAssets = assets.filter(a => {
        if (!a.warrantyExpirationDate) return false;
        const daysLeft = Math.ceil((new Date(a.warrantyExpirationDate) - Date.now()) / 86400000);
        return daysLeft <= 30;
    }).sort((a, b) => new Date(a.warrantyExpirationDate) - new Date(b.warrantyExpirationDate));

    // User allocation (by assignedTo email)
    const byUser = assets
        .filter(a => a.assignedTo)
        .reduce((acc, a) => {
            const email = a.assignedTo?.email ?? a.assignedTo ?? 'Unknown';
            acc[email] = (acc[email] ?? 0) + 1;
            return acc;
        }, {});
    const userAllocationData = Object.entries(byUser)
        .map(([name, count]) => ({ name: name.split('@')[0], count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    if (loading) return (
        <>
            <Navbar />
            <div className="spinner-wrap"><div className="spinner" /></div>
        </>
    );



    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        {lastUpdated && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Last updated: {lastUpdated.toLocaleTimeString()} · auto-refreshes every 30s
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {unreadCount > 0 && (
                            <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>
                                <Icon name="alert-triangle" size={12} style={{ marginRight: '4px' }} /> {unreadCount} alert{unreadCount > 1 ? 's' : ''}
                            </span>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={fetchAssets}>↻ Refresh</button>
                    </div>
                </div>

                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <StatCard label="Total Assets" value={total} icon={<Icon name="box" size={24} />} color="#0F766E" onClick={() => navigate('/assets')} />
                    <StatCard label="Available" value={byStatus.AVAILABLE ?? 0} icon={<Icon name="check-circle" size={24} />} color="#059669" sub={total ? `${Math.round(((byStatus.AVAILABLE ?? 0) / total) * 100)}% of fleet` : ''} onClick={() => navigate('/assets')} />
                    <StatCard label="Assigned" value={byStatus.ASSIGNED ?? 0} icon={<Icon name="user" size={24} />} color="#0F766E" onClick={() => navigate('/assets')} />
                    <StatCard label="In Repair" value={byStatus.IN_REPAIR ?? 0} icon={<Icon name="settings" size={24} />} color="#D97706" onClick={() => navigate('/assets')} />
                    <StatCard label="Expiring Soon" value={flaggedAssets.length} icon={<Icon name="clock" size={24} />} color="#E11D48" sub={flaggedAssets.length > 0 ? 'Action needed' : 'All good'} />
                </div>

                {/* Charts row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    {/* Status distribution */}
                    <div className="card">
                        <p className="section-title">Status Distribution</p>
                        {statusData.length === 0 ? (
                            <div className="empty-state">No data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                                        {statusData.map((entry) => (
                                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94A3B8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Type breakdown */}
                    <div className="card">
                        <p className="section-title">Asset Allocation by Type</p>
                        {typeData.length === 0 ? (
                            <div className="empty-state">No data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={typeData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                    <XAxis dataKey="name" fontSize={11} tick={{ fill: '#64748B' }} />
                                    <YAxis fontSize={11} tick={{ fill: '#64748B' }} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                                        {typeData.map((_, i) => (
                                            <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* User allocation bar chart */}
                {userAllocationData.length > 0 && (
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <p className="section-title">Assets per User (Top 8)</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={userAllocationData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                <XAxis type="number" fontSize={11} tick={{ fill: '#64748B' }} />
                                <YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: '#64748B' }} width={55} />
                                <Tooltip />
                                <Bar dataKey="count" name="Assets" fill="#0F766E" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Flagged assets */}
                {flaggedAssets.length > 0 && (
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <p className="section-title" style={{ color: '#DC2626' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Icon name="alert-triangle" size={16} /> Expiring / Expired Assets
                            </div>
                        </p>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                        <th>Warranty</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flaggedAssets.map(a => (
                                        <tr key={a.id} className="clickable" onClick={() => navigate(`/assets/${a.id}`)}>
                                            <td>
                                                <strong>{a.brand} {a.model}</strong>
                                                <ExpiryWarningBadge asset={a} />
                                            </td>
                                            <td>{a.type ?? '—'}</td>
                                            <td>
                                                <span className={`badge badge-${(a.status ?? '').toLowerCase()}`}>
                                                    {a.status ?? '—'}
                                                </span>
                                            </td>
                                            <td>{a.assignedTo?.email ?? a.assignedTo ?? '—'}</td>
                                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {a.warrantyExpirationDate ? new Date(a.warrantyExpirationDate).toLocaleDateString() : '—'}
                                            </td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <SuggestedAction asset={a} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent notifications panel */}
                {notifications.length > 0 && (
                    <div className="card">
                        <p className="section-title">Recent Alerts</p>
                        {notifications.slice(0, 5).map(n => (
                            <div key={n.id} style={{
                                display: 'flex', gap: '12px', padding: '10px 0',
                                borderBottom: '1px solid var(--border)',
                                alignItems: 'flex-start',
                            }}>
                                <div style={{ 
                                    width: '12px', height: '12px', borderRadius: '50%', marginTop: '3px',
                                    background: n.type === 'error' ? 'var(--error)' : n.type === 'warning' ? '#EAB308' : 'var(--blue)'
                                }} />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{n.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.message}</div>
                                </div>
                                {!n.read && (
                                    <span style={{ marginLeft: 'auto', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: '4px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
