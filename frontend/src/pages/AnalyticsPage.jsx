import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const TYPE_COLORS = { LAPTOP: '#0F766E', MONITOR: '#14B8A6', ACCESSORY: '#0284C7' };

function fmt(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString();
}

function daysBetween(a, b) {
    if (!a || !b) return 0;
    return Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}

export default function AnalyticsPage() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('allocation'); // allocation | condition | duration

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/assets');
                const list = Array.isArray(data) ? data : (data.content ?? []);
                setAssets(list);
            } catch { /* handled */ }
            setLoading(false);
        })();
    }, []);

    // ── Allocation history per asset ──
    // Group assets by type + month purchased (proxy for "allocation over time")
    const allocationByMonth = assets.reduce((acc, a) => {
        if (!a.purchaseDate) return acc;
        const month = a.purchaseDate.slice(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = { month, LAPTOP: 0, MONITOR: 0, ACCESSORY: 0, OTHER: 0 };
        const t = a.type ?? 'OTHER';
        acc[month][t] = (acc[month][t] ?? 0) + 1;
        return acc;
    }, {});
    const allocationData = Object.values(allocationByMonth).sort((a, b) => a.month.localeCompare(b.month));

    // ── Condition timeline ──
    // Map condition to score for line chart
    const COND_SCORE = { EXCELLENT: 5, GOOD: 4, FAIR: 3, POOR: 2, CRITICAL: 1 };
    const conditionTimeline = assets
        .filter(a => a.condition)
        .map(a => ({
            id: a.id,
            label: `${a.brand ?? ''} ${a.model ?? ''}`.trim() || a.serialNumber,
            condition: a.condition,
            score: COND_SCORE[a.condition] ?? 3,
            date: a.purchaseDate,
            type: a.type,
        }))
        .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

    const conditionDistribution = conditionTimeline.reduce((acc, a) => {
        acc[a.condition] = (acc[a.condition] ?? 0) + 1;
        return acc;
    }, {});
    const conditionBarData = Object.entries(conditionDistribution).map(([cond, count]) => ({ cond, count }));

    // ── Usage duration per user per asset ──
    const usageData = assets
        .filter(a => a.assignedTo && a.purchaseDate)
        .map(a => {
            const email = a.assignedTo?.email ?? a.assignedTo ?? 'Unknown';
            const days = daysBetween(a.purchaseDate, a.warrantyExpirationDate ?? new Date().toISOString());
            return {
                user: email.split('@')[0],
                asset: `${a.brand ?? ''} ${a.model ?? ''}`.trim() || a.serialNumber,
                type: a.type,
                days,
                status: a.status,
                id: a.id,
            };
        })
        .sort((a, b) => b.days - a.days)
        .slice(0, 12);

    const TAB_LABELS = [
        { key: 'allocation', label: 'Allocation History' },
        { key: 'condition', label: 'Condition Timeline' },
        { key: 'duration', label: 'Usage Duration' },
    ];

    if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner" /></div></>;

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Reporting & Analytics</h1>
                </div>

                {/* Tab bar */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '4px', width: 'fit-content', border: '1px solid var(--border)' }}>
                    {TAB_LABELS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            style={{
                                padding: '7px 18px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: activeTab === t.key ? 600 : 400,
                                background: activeTab === t.key ? 'var(--white)' : 'transparent',
                                color: activeTab === t.key ? 'var(--blue)' : 'var(--text-muted)',
                                boxShadow: activeTab === t.key ? 'var(--shadow)' : 'none',
                                transition: 'all .15s',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Allocation History ── */}
                {activeTab === 'allocation' && (
                    <div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Asset Allocation History by Type</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                Assets acquired per month, grouped by type
                            </p>
                            {allocationData.length === 0 ? (
                                <div className="empty-state">No purchase date data available.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={allocationData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="month" fontSize={11} tick={{ fill: '#64748B' }} />
                                        <YAxis fontSize={11} tick={{ fill: '#64748B' }} />
                                        <Tooltip />
                                        <Bar dataKey="LAPTOP" name="Laptop" stackId="a" fill="#0F766E" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="MONITOR" name="Monitor" stackId="a" fill="#14B8A6" />
                                        <Bar dataKey="ACCESSORY" name="Accessory" stackId="a" fill="#0284C7" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Table */}
                        <div className="card">
                            <p className="section-title">All Assets — Allocation Detail</p>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Asset</th><th>Type</th><th>Status</th><th>Assigned To</th>
                                            <th>Purchase Date</th><th>Warranty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assets.map(a => (
                                            <tr key={a.id}>
                                                <td><strong>{a.brand} {a.model}</strong><br/><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.serialNumber}</span></td>
                                                <td><span style={{ fontSize: '12px', fontWeight: 500, color: TYPE_COLORS[a.type] ?? '#64748B' }}>{a.type ?? '—'}</span></td>
                                                <td><span className={`badge badge-${(a.status ?? '').toLowerCase()}`}>{a.status ?? '—'}</span></td>
                                                <td>{a.assignedTo?.email ?? a.assignedTo ?? '—'}</td>
                                                <td style={{ fontSize: '12px' }}>{fmt(a.purchaseDate)}</td>
                                                <td style={{ fontSize: '12px' }}>{fmt(a.warrantyExpirationDate)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tab: Condition Timeline ── */}
                {activeTab === 'condition' && (
                    <div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Asset Condition Distribution</p>
                            {conditionBarData.length === 0 ? (
                                <div className="empty-state">No condition data available. Add condition reports to see this data.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={conditionBarData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="cond" fontSize={11} tick={{ fill: '#64748B' }} />
                                        <YAxis fontSize={11} tick={{ fill: '#64748B' }} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Assets" radius={[4, 4, 0, 0]}>
                                            {conditionBarData.map((e, i) => {
                                                const c = { EXCELLENT: '#059669', GOOD: '#0F766E', FAIR: '#D97706', POOR: '#F97316', CRITICAL: '#E11D48' };
                                                return <Cell key={i} fill={c[e.cond] ?? '#94A3B8'} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Condition list */}
                        <div className="card">
                            <p className="section-title">Asset Condition Timeline View</p>
                            {conditionTimeline.length === 0 ? (
                                <div className="empty-state">No condition data. Submit condition reports to populate this view.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {conditionTimeline.map((a, i) => {
                                        const COND_COLOR = { EXCELLENT: '#059669', GOOD: '#0F766E', FAIR: '#D97706', POOR: '#F97316', CRITICAL: '#E11D48' };
                                        const color = COND_COLOR[a.condition] ?? '#64748B';
                                        const barWidth = (a.score / 5) * 100;
                                        return (
                                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: i < conditionTimeline.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                <div style={{ width: '120px', flexShrink: 0, fontSize: '12px', fontWeight: 500 }}>{a.label}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', width: '70px', flexShrink: 0 }}>{fmt(a.date)}</div>
                                                <div style={{ flex: 1, height: '8px', borderRadius: '999px', background: '#F1F5F9', overflow: 'hidden' }}>
                                                    <div style={{ width: `${barWidth}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width .3s' }} />
                                                </div>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color, width: '70px', textAlign: 'right', flexShrink: 0 }}>{a.condition}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Tab: Usage Duration ── */}
                {activeTab === 'duration' && (
                    <div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Usage Duration per User per Asset (days)</p>
                            {usageData.length === 0 ? (
                                <div className="empty-state">No assigned assets with purchase dates found.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={usageData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                        <XAxis type="number" fontSize={11} tick={{ fill: '#64748B' }} label={{ value: 'Days', position: 'insideBottomRight', offset: -10, fontSize: 11, fill: '#64748B' }} />
                                        <YAxis type="category" dataKey="user" fontSize={10} tick={{ fill: '#64748B' }} width={75} />
                                        <Tooltip formatter={(v) => [`${v} days`, 'Duration']} />
                                        <Bar dataKey="days" name="Days in use" radius={[0, 4, 4, 0]}>
                                            {usageData.map((e, i) => (
                                                <Cell key={i} fill={TYPE_COLORS[e.type] ?? '#94A3B8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="card">
                            <p className="section-title">Usage Duration — Detail Table</p>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>User</th><th>Asset</th><th>Type</th><th>Status</th><th>Days in Use</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usageData.map((u, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 500 }}>{u.user}</td>
                                                <td>{u.asset}</td>
                                                <td><span style={{ fontSize: '12px', fontWeight: 500, color: TYPE_COLORS[u.type] ?? '#64748B' }}>{u.type ?? '—'}</span></td>
                                                <td><span className={`badge badge-${(u.status ?? '').toLowerCase()}`}>{u.status ?? '—'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--blue)', minWidth: '40px' }}>{u.days}</span>
                                                        <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: '#F1F5F9', overflow: 'hidden', maxWidth: '100px' }}>
                                                            <div style={{ width: `${Math.min(100, (u.days / (usageData[0]?.days || 1)) * 100)}%`, height: '100%', background: '#0F766E', borderRadius: '999px' }} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
