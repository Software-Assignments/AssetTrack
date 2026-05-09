import { useState, useEffect } from 'react';
import Navbar, { Icon } from '../components/Navbar';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/axiosInstance';

function NotificationPanel() {
    const { notifications, resolveNotification, refresh } = useNotifications();
    const [allNotifs, setAllNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/notifications/all');
                setAllNotifs(Array.isArray(data) ? data : []);
            } catch { /* silent */ }
            setLoading(false);
        })();
    }, [notifications]); // re-fetch when context refreshes

    const handleResolve = async (id) => {
        await resolveNotification(id);
        setAllNotifs(prev => prev.map(n => n.id === id ? { ...n, resolved: true } : n));
    };

    const TYPE_STYLE = {
        WARRANTY_EXPIRY: { bg: '#FEF3C7', color: '#D97706' },
        WARRANTY_EXPIRED: { bg: '#FEE2E2', color: '#DC2626' },
        MAINTENANCE: { bg: '#DBEAFE', color: '#1D4ED8' },
    };

    if (loading) return <div className="spinner-wrap" style={{ height: 120 }}><div className="spinner" /></div>;

    const unresolved = allNotifs.filter(n => !n.resolved);
    const resolved = allNotifs.filter(n => n.resolved);

    return (
        <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p className="section-title" style={{ margin: 0 }}>Live Notification Panel</p>
                <button className="btn btn-secondary btn-sm" onClick={refresh}>↻ Refresh</button>
            </div>

            {unresolved.length === 0 && (
                <div className="empty-state">No active notifications.</div>
            )}

            {unresolved.map(n => {
                const style = TYPE_STYLE[n.type] ?? { bg: '#F1F5F9', color: '#64748B' };
                return (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '8px', background: style.bg, marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: style.color, marginBottom: '2px' }}>
                                {(n.type ?? '').replace(/_/g, ' ')}
                            </div>
                            <div style={{ fontSize: '13px', color: '#374151' }}>{n.message}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                            </div>
                        </div>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleResolve(n.id)}
                            title="Resolve notification"
                        >
                            Resolve
                        </button>
                    </div>
                );
            })}

            {resolved.length > 0 && (
                <details style={{ marginTop: '12px' }}>
                    <summary style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {resolved.length} resolved notification{resolved.length !== 1 ? 's' : ''}
                    </summary>
                    <div style={{ marginTop: '8px' }}>
                        {resolved.map(n => (
                            <div key={n.id} style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontWeight: 500 }}>{(n.type ?? '').replace(/_/g, ' ')}</span> — {n.message}
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}

export default function AlertSettingsPage() {
    const { alertSettings, saveAlertSettings } = useNotifications();
    const [settings, setSettings] = useState({ ...alertSettings });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        saveAlertSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
    const setNum = (key, val) => setSettings(s => ({ ...s, [key]: Number(val) }));

    return (
        <>
            <Navbar />
            <div className="page-wrapper" style={{ maxWidth: '700px' }}>
                <div className="page-header">
                    <h1 className="page-title">Alert Settings</h1>
                </div>

                {saved && (
                    <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                        ✓ Settings saved successfully.
                    </div>
                )}

                {/* Live notification panel */}
                <NotificationPanel />

                <div className="card" style={{ marginBottom: '20px' }}>
                    <p className="section-title">Warranty Expiry Alerts</p>

                    <div className="form-group">
                        <label>Expiry Warning Threshold (days before expiry)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                                type="range"
                                min={7}
                                max={180}
                                step={7}
                                value={settings.warrantyExpiryDays}
                                onChange={e => setNum('warrantyExpiryDays', e.target.value)}
                                style={{ flex: 1, accentColor: 'var(--blue)' }}
                            />
                            <span style={{ fontWeight: 700, color: 'var(--blue)', minWidth: '50px', textAlign: 'right' }}>
                                {settings.warrantyExpiryDays}d
                            </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            You will receive alerts when a warranty expires within this many days.
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>Show Expired Asset Alerts</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Notify when any asset warranty has already expired.</div>
                        </div>
                        <button onClick={() => toggle('showExpiredAlerts')} style={{ width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: settings.showExpiredAlerts ? 'var(--blue)' : 'var(--border)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                            <span style={{ position: 'absolute', top: '3px', left: settings.showExpiredAlerts ? '22px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s', display: 'block' }} />
                        </button>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '20px' }}>
                    <p className="section-title">Status Alerts</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>Show Maintenance Alerts</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Notify when an asset enters maintenance status.</div>
                        </div>
                        <button onClick={() => toggle('showMaintenanceAlerts')} style={{ width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: settings.showMaintenanceAlerts ? 'var(--blue)' : 'var(--border)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                            <span style={{ position: 'absolute', top: '3px', left: settings.showMaintenanceAlerts ? '22px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s', display: 'block' }} />
                        </button>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '20px' }}>
                    <p className="section-title">Preview</p>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="clock" size={14} /> Warranty warnings: <strong style={{ color: 'var(--text)' }}>{settings.warrantyExpiryDays} days</strong> before expiry</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--error)' }} /> Expired alerts: <strong style={{ color: 'var(--text)' }}>{settings.showExpiredAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="settings" size={14} /> Maintenance alerts: <strong style={{ color: 'var(--text)' }}>{settings.showMaintenanceAlerts ? 'Enabled' : 'Disabled'}</strong></div>
                    </div>
                </div>

                <button className="btn btn-primary" onClick={handleSave}>
                    Save Settings
                </button>
            </div>
        </>
    );
}
