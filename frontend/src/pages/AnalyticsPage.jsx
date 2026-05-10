import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell
} from 'recharts';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const TYPE_COLORS = { LAPTOP: '#0F766E', SCREEN: '#14B8A6', ACCESSORY: '#0284C7' };
const SEV_COLORS  = { LOW: '#059669', MEDIUM: '#D97706', HIGH: '#F97316', CRITICAL: '#E11D48', UNKNOWN: '#94A3B8' };

function buildAllocationChartData(entries) {
    const map = {};
    entries.forEach(e => {
        if (!e.assignDate) return;
        const month = e.assignDate.slice(0, 7);
        if (!map[month]) map[month] = { month, LAPTOP: 0, SCREEN: 0, ACCESSORY: 0 };
        const type = e.assetType ?? 'LAPTOP';
        if (map[month][type] !== undefined) map[month][type]++;
        else map[month][type] = 1;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

function buildConditionChartData(summary) {
    if (!summary?.reportsBySeverity) return [];
    return Object.entries(summary.reportsBySeverity).map(([condition, count]) => ({ condition, count }));
}

function buildUsageChartData(stats) {
    if (!stats?.mostAllocatedAssets?.length) return [];
    return stats.mostAllocatedAssets.map(a => ({
        user: `${a.brand} ${a.model}`,
        asset: a.serialNumber,
        days: a.allocationCount,
    }));
}

export default function AnalyticsPage() {
    const [rawHistory,   setRawHistory]   = useState([]);
    const [rawCondition, setRawCondition] = useState(null);
    const [rawUsage,     setRawUsage]     = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [activeTab,    setActiveTab]    = useState('allocation');

    useEffect(() => {
        (async () => {
            const [usageRes, historyRes, conditionRes] = await Promise.allSettled([
                api.get('/analytics/usage'),
                api.get('/analytics/allocation-history'),
                api.get('/analytics/condition-summary'),
            ]);
            if (usageRes.status     === 'fulfilled') setRawUsage(usageRes.value.data);
            if (historyRes.status   === 'fulfilled') setRawHistory(historyRes.value.data ?? []);
            if (conditionRes.status === 'fulfilled') setRawCondition(conditionRes.value.data);
            setLoading(false);
        })();
    }, []);

    const allocationChartData = buildAllocationChartData(rawHistory);
    const conditionChartData  = buildConditionChartData(rawCondition);
    const usageChartData      = buildUsageChartData(rawUsage);

    const TAB_LABELS = [
        { key: 'allocation', label: 'Allocation History' },
        { key: 'condition',  label: 'Condition Summary'  },
        { key: 'duration',   label: 'Usage Duration'     },
    ];

    if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner" /></div></>;

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Reporting &amp; Analytics</h1>
                </div>

                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '4px', width: 'fit-content', border: '1px solid var(--border)' }}>
                    {TAB_LABELS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            style={{
                                padding: '7px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                fontSize: '13px', fontWeight: activeTab === t.key ? 600 : 400,
                                background: activeTab === t.key ? 'var(--white)' : 'transparent',
                                color: activeTab === t.key ? 'var(--blue)' : 'var(--text-muted)',
                                boxShadow: activeTab === t.key ? 'var(--shadow)' : 'none', transition: 'all .15s',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Allocation History ── */}
                {activeTab === 'allocation' && (
                    <div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Asset Allocation History by Type</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Assignments per month, grouped by asset type</p>
                            {allocationChartData.length === 0 ? (
                                <div className="empty-state">No allocation history data available.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={allocationChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="month" fontSize={11} tick={{ fill: '#64748B' }} />
                                        <YAxis fontSize={11} tick={{ fill: '#64748B' }} allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="LAPTOP"    name="Laptop"    stackId="a" fill="#0F766E" />
                                        <Bar dataKey="SCREEN"    name="Screen"    stackId="a" fill="#14B8A6" />
                                        <Bar dataKey="ACCESSORY" name="Accessory" stackId="a" fill="#0284C7" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {rawUsage && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                {[
                                    { label: 'Total Allocations',   value: rawUsage.totalAllocations   ?? 0 },
                                    { label: 'Active Allocations',  value: rawUsage.activeAllocations  ?? 0 },
                                    { label: 'Avg Duration (days)', value: rawUsage.avgAllocationDays  ?? 0 },
                                ].map(s => (
                                    <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--blue)' }}>{s.value}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="card">
                            <p className="section-title">Allocation Detail</p>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr><th>Asset Serial</th><th>Brand &amp; Model</th><th>Assigned To</th><th>Assign Date</th><th>Return Date</th></tr>
                                    </thead>
                                    <tbody>
                                        {rawHistory.length === 0 ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No records</td></tr>
                                        ) : rawHistory.map((row, i) => (
                                            <tr key={i}>
                                                <td><strong>{row.assetSerialNumber}</strong></td>
                                                <td>{row.assetBrand} {row.assetModel}</td>
                                                <td>{row.userEmail}</td>
                                                <td>{row.assignDate ?? '—'}</td>
                                                <td>{row.returnDate ?? <span style={{ color: '#059669', fontWeight: 500 }}>Active</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Condition Summary ── */}
                {activeTab === 'condition' && (
                    <div>
                        {rawCondition && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                {[
                                    { label: 'Total Reports',   value: rawCondition.totalReports ?? 0 },
                                    { label: 'Severity Types',  value: Object.keys(rawCondition.reportsBySeverity ?? {}).length },
                                ].map(s => (
                                    <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--blue)' }}>{s.value}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Reports by Severity</p>
                            {conditionChartData.length === 0 ? (
                                <div className="empty-state">No condition reports yet. Submit condition reports to populate this view.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={conditionChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="condition" fontSize={11} tick={{ fill: '#64748B' }} />
                                        <YAxis fontSize={11} tick={{ fill: '#64748B' }} allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Reports" radius={[4, 4, 0, 0]}>
                                            {conditionChartData.map((e, i) => (
                                                <Cell key={i} fill={SEV_COLORS[e.condition] ?? '#94A3B8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="card">
                            <p className="section-title">Recent Condition Reports</p>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Asset Serial</th><th>Reported By</th><th>Severity</th><th>Notes</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {(rawCondition?.recentReports ?? []).length === 0 ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No reports</td></tr>
                                        ) : rawCondition.recentReports.map((r, i) => (
                                            <tr key={i}>
                                                <td><strong>{r.assetSerialNumber}</strong></td>
                                                <td>{r.reportedByEmail}</td>
                                                <td><span style={{ fontSize: '12px', fontWeight: 600, color: SEV_COLORS[r.conditionStatus] ?? '#64748B' }}>{r.conditionStatus}</span></td>
                                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes}</td>
                                                <td>{r.reportedAt?.slice(0, 10) ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Usage Duration ── */}
                {activeTab === 'duration' && (
                    <div>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <p className="section-title">Most Allocated Assets (by allocation count)</p>
                            {usageChartData.length === 0 ? (
                                <div className="empty-state">No usage data available. Assign assets to users first.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={usageChartData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                        <XAxis type="number" fontSize={11} tick={{ fill: '#64748B' }} allowDecimals={false}
                                            label={{ value: 'Allocations', position: 'insideBottomRight', offset: -10, fontSize: 11, fill: '#64748B' }} />
                                        <YAxis type="category" dataKey="user" fontSize={10} tick={{ fill: '#64748B' }} width={75} />
                                        <Tooltip formatter={(v) => [`${v} allocations`, 'Count']} />
                                        <Bar dataKey="days" name="Allocations" radius={[0, 4, 4, 0]} fill="#0F766E" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="card">
                            <p className="section-title">Most Allocated Assets — Detail</p>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Brand &amp; Model</th><th>Serial Number</th><th>Allocation Count</th></tr></thead>
                                    <tbody>
                                        {(rawUsage?.mostAllocatedAssets ?? []).length === 0 ? (
                                            <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                                        ) : rawUsage.mostAllocatedAssets.map((a, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 500 }}>{a.brand} {a.model}</td>
                                                <td>{a.serialNumber}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--blue)', minWidth: '30px' }}>{a.allocationCount}</span>
                                                        <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: '#F1F5F9', overflow: 'hidden', maxWidth: '100px' }}>
                                                            <div style={{
                                                                width: `${Math.min(100, (a.allocationCount / (rawUsage.mostAllocatedAssets[0]?.allocationCount || 1)) * 100)}%`,
                                                                height: '100%', background: '#0F766E', borderRadius: '999px'
                                                            }} />
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
