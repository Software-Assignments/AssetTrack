import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'grid',
        roles: ['ADMIN', 'MANAGER', 'USER'],
    },
    {
        label: 'Assets',
        path: '/assets',
        icon: 'box',
        roles: ['ADMIN', 'MANAGER', 'DEVELOPER'],
    },
    {
        label: 'Register Asset',
        path: '/assets/register',
        icon: 'plus-circle',
        roles: ['ADMIN', 'MANAGER'],
    },
    {
        label: 'Assign / Transfer',
        path: '/assets/assign',
        icon: 'shuffle',
        roles: ['ADMIN', 'MANAGER'],
    },
    {
        label: 'Analytics',
        path: '/analytics',
        icon: 'bar-chart',
        roles: ['ADMIN', 'MANAGER'],
    },
    {
        label: 'Condition Reports',
        path: '/condition-reports',
        icon: 'file-text',
        roles: ['ADMIN', 'MANAGER'],
    },
    {
        label: 'Report Issue',
        path: '/condition-report',
        icon: 'file-text',
        roles: ['ADMIN', 'MANAGER', 'DEVELOPER'],
    },
    {
        label: 'Search',
        path: '/search',
        icon: 'search',
        roles: ['ADMIN', 'MANAGER', 'DEVELOPER'],
    },
    {
        label: 'Alert Settings',
        path: '/alert-settings',
        icon: 'settings',
        roles: ['ADMIN', 'MANAGER'],
    },
];

function Icon({ name, size = 18 }) {
    const s = { width: size, height: size };
    const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...s, viewBox: '0 0 24 24' };
    if (name === 'grid') return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    if (name === 'box') return <svg {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    if (name === 'plus-circle') return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
    if (name === 'shuffle') return <svg {...p}><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
    if (name === 'bar-chart') return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
    if (name === 'file-text') return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
    if (name === 'search') return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    if (name === 'settings') return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>;
    if (name === 'logout') return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
    if (name === 'menu') return <svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    if (name === 'check-circle') return <svg {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    if (name === 'user') return <svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    if (name === 'clock') return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    if (name === 'alert-triangle') return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    if (name === 'bell') return <svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
    return null;
}

export { Icon };

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const userRole = user?.role ?? 'USER';
    const handleLogout = () => { logout(); navigate('/login'); };
    const handleBrandClick = () => {
        if (userRole === 'ADMIN' || userRole === 'MANAGER') navigate('/dashboard');
        else navigate('/assets');
    };
    const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

    const roleBadge = { ADMIN: { bg: '#FEE2E2', color: '#DC2626' }, MANAGER: { bg: '#FEF3C7', color: '#D97706' }, USER: { bg: '#DBEAFE', color: '#1D4ED8' } };
    const rStyle = roleBadge[userRole] ?? roleBadge.USER;

    return (
        <>
            <nav className="navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} title="Toggle menu">
                        <Icon name="menu" />
                    </button>
                    <span className="navbar-brand" style={{ cursor: 'pointer' }} onClick={handleBrandClick}>AssetTrack</span>
                </div>
                <div className="navbar-right">
                    <NotificationBell />
                    {user && <span className="navbar-user">{user.email ?? user.username ?? ''}</span>}
                    {user?.role && (
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: rStyle.bg, color: rStyle.color }}>
                            {user.role}
                        </span>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Log out</button>
                </div>
            </nav>

            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 200, backdropFilter: 'blur(1px)' }} />
            )}

            <aside style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '240px', background: 'var(--white)', borderRight: '1px solid var(--border)', boxShadow: '4px 0 24px rgba(0,0,0,.1)', zIndex: 300, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .25s ease', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--blue)' }}>AssetTrack</div>
                    {user && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{user.email ?? user.username}</div>}
                </div>
                <nav style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {visibleItems.map(item => {
                        const isActive = location.pathname === item.path || (item.path !== '/assets' && location.pathname.startsWith(item.path));
                        return (
                            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '6px', background: isActive ? 'var(--blue-light)' : 'transparent', color: isActive ? 'var(--blue)' : 'var(--text)', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? 600 : 400, textAlign: 'left', marginBottom: '2px', transition: 'background .1s' }}>
                                <span style={{ opacity: isActive ? 1 : 0.55, flexShrink: 0 }}><Icon name={item.icon} size={17} /></span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
                <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', width: '100%' }}>
                        <Icon name="logout" size={16} /> Log out
                    </button>
                </div>
            </aside>
        </>
    );
}
