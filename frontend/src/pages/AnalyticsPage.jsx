import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell
} from 'recharts';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const TYPE_COLORS = { LAPTOP: '#0F766E', MONITOR: '#14B8A6', ACCESSORY: '#0284C7' };

function fmt(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString();
}

export default function AnalyticsPage() {
    const [allocationHistory, setAllocationHistory] = useState([]);
    const [conditionSummary, setConditionSummary] = useState([]);
    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('allocation');

    useEffect(() => {
        (async () => {
            try {
                const [usageRes, historyRes, conditionRes] = await Promise.allSettled([
                    api.get('/analytics/usage'),
                    api.get('/analytics/allocation-history'),
                    api.get('/analytics/condition-summary'),
                ]);
                if (usageRes.status === 'fulfilled') setUsageData(usageRes.value.data ?? []);
                if (historyRes.status === 'fulfilled') setAllocationHistory(historyRes.value.data ?? []);
                if (conditionRes.status === 'fulfilled') setConditionSummary(conditionRes.value.data ?? []);
            } catch { /* handled per-request above */ }
            setLoading(false);
        })();
    }, []);

    const TAB_LABELS = [
        { key: 'allocation', label: 'Allocation History' },
        { key: 'condition', label: 'Condition Summary' },
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

                {/* Allocation History */}
                {activeTab === 'allocation' && (
                    <div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Asset Allocation History by Type</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                Assets acquired per month, grouped by type
                            </p>
                            {allocationHistory.length === 0 ? (
                                <div className="empty-state">No allocation history data available.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={allocationHistory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="month" fontSize={11} tick={{ fill: '#64748B' }} />
                                        <YAxis fontSize={11} tick={{ fill: '#64748B' }} />
                                        <Tooltip />
                                        <Bar dataKey="LAPTOP" name="Laptop" stackId="a" fill="#0F766E" />
                                        <Bar dataKey="MONITOR" name="Monitor" stackId="a" fill="#14B8A6" />
                                        <Bar dataKey="ACCESSORY" name="Accessory" stackId="a" fill="#0284C7" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="card">
                            <p className="section-title">Allocation Detail</p>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Month</th><th>Laptops</th><th>Monitors</th><th>Accessories</th><th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allocationHistory.map((row, i) => (
                                            <tr key={i}>
                                                <td><strong>{row.month}</strong></td>
                                                <td>{row.LAPTOP ?? 0}</td>
                                                <td>{row.MONITOR ?? 0}</td>
                                                <td>{row.ACCESSORY ?? 0}</td>
                                                <td><strong>{(row.LAPTOP ?? 0) + (row.MONITOR ?? 0) + (row.ACCESSORY ?? 0)}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Condition Summary */}
                {activeTab === 'condition' && (
                    <div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Asset Condition Distribution</p>
                            {conditionSummary.length === 0 ? (
                                <div className="empty-state">No condition data available. Submit condition reports to populate this view.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={conditionSummary} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="condition" fontSize={11} tick={{ fill: '#64748B' }} />
                                        <YAxis fontSize={11} tick={{ fill: '#64748B' }} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Assets" radius={[4, 4, 0, 0]}>
                                            {conditionSummary.map((e, i) => {
                                                const c = { EXCELLENT: '#059669', GOOD: '#0F766E', FAIR: '#D97706', POOR: '#F97316', CRITICAL: '#E11D48' };
                                                return <Cell key={i} fill={c[e.condition] ?? '#94A3B8'} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="card">
                            <p className="section-title">Condition Breakdown</p>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Condition</th><th>Asset Count</th></tr></thead>
                                    <tbody>
                                        {conditionSummary.map((row, i) => (
                                            <tr key={i}>
                                                <td><strong>{row.condition}</strong></td>
                                                <td>{row.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Usage Duration */}
                {activeTab === 'duration' && (
                    <div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Usage Duration per User per Asset (days)</p>
                            {usageData.length === 0 ? (
                                <div className="empty-state">No usage duration data available.</div>
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
