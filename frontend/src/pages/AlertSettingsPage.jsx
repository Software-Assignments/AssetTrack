import { useState } from 'react';
import Navbar, { Icon } from '../components/Navbar';
import { useNotifications } from '../context/NotificationContext';

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
            <div className="page-wrapper" style={{ maxWidth: '640px' }}>
                <div className="page-header">
                    <h1 className="page-title">Alert Settings</h1>
                </div>

                {saved && (
                    <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                        ✓ Settings saved successfully.
                    </div>
                )}

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
                        <button
                            onClick={() => toggle('showExpiredAlerts')}
                            style={{
                                width: '44px', height: '24px', borderRadius: '999px',
                                border: 'none', cursor: 'pointer',
                                background: settings.showExpiredAlerts ? 'var(--blue)' : 'var(--border)',
                                position: 'relative', transition: 'background .2s', flexShrink: 0,
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '3px',
                                left: settings.showExpiredAlerts ? '22px' : '3px',
                                width: '18px', height: '18px',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                                transition: 'left .2s',
                                display: 'block',
                            }} />
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
                        <button
                            onClick={() => toggle('showMaintenanceAlerts')}
                            style={{
                                width: '44px', height: '24px', borderRadius: '999px',
                                border: 'none', cursor: 'pointer',
                                background: settings.showMaintenanceAlerts ? 'var(--blue)' : 'var(--border)',
                                position: 'relative', transition: 'background .2s', flexShrink: 0,
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '3px',
                                left: settings.showMaintenanceAlerts ? '22px' : '3px',
                                width: '18px', height: '18px',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                                transition: 'left .2s',
                                display: 'block',
                            }} />
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
