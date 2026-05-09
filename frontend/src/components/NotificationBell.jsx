import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const ICON_COLOR = {
    error: '#EF4444',
    warning: '#D97706',
    info: '#2563EB',
};

const ICON_BG = {
    error: '#FEE2E2',
    warning: '#FEF3C7',
    info: '#DBEAFE',
};

function TypeIcon({ type }) {
    const color = ICON_COLOR[type] ?? '#64748B';
    if (type === 'error') return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    );
    if (type === 'warning') return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    );
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/>
        </svg>
    );
}

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    // Close panel when clicking outside
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleNotificationClick = (n) => {
        markAsRead(n.id);
        if (n.assetId) {
            navigate(`/assets/${n.assetId}`);
            setOpen(false);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--text-muted)',
                    transition: 'background .15s',
                }}
                title="Notifications"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: '#EF4444',
                        color: '#fff',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: 700,
                        minWidth: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                        lineHeight: 1,
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '360px',
                    maxHeight: '480px',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 8px 32px rgba(0,0,0,.12)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--surface)',
                    }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>
                            Notifications
                            {unreadCount > 0 && (
                                <span style={{
                                    marginLeft: '8px',
                                    background: '#EF4444',
                                    color: '#fff',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '1px 7px',
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: 'var(--blue)',
                                    fontWeight: 500,
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                padding: '40px 24px',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: '13px',
                            }}>
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔔</div>
                                No notifications
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border)',
                                        background: n.read ? 'transparent' : '#F0F7FF',
                                        cursor: n.assetId ? 'pointer' : 'default',
                                        transition: 'background .1s',
                                    }}
                                >
                                    {/* Type icon */}
                                    <div style={{
                                        flexShrink: 0,
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: ICON_BG[n.type] ?? '#F1F5F9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: '1px',
                                    }}>
                                        <TypeIcon type={n.type} />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: n.read ? 500 : 600,
                                            color: 'var(--text)',
                                            marginBottom: '2px',
                                        }}>
                                            {n.title}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-muted)',
                                            lineHeight: 1.4,
                                        }}>
                                            {n.message}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--text-muted)',
                                            marginTop: '4px',
                                        }}>
                                            {timeAgo(n.timestamp)}
                                        </div>
                                    </div>

                                    {/* Unread dot */}
                                    {!n.read && (
                                        <div style={{
                                            flexShrink: 0,
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: 'var(--blue)',
                                            marginTop: '6px',
                                        }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '10px 16px',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--surface)',
                        textAlign: 'center',
                    }}>
                        <button
                            onClick={() => { navigate('/alert-settings'); setOpen(false); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                fontWeight: 500,
                            }}
                        >
                            ⚙ Alert Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
