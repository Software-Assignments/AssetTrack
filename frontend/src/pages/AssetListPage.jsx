import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar, { Icon } from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['', 'AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'EXPIRED', 'DECOMMISSIONED'];
const TYPE_OPTIONS = ['', 'LAPTOP', 'SCREEN', 'ACCESSORY'];

function statusBadge(s) {
    const map = { AVAILABLE: 'badge-available', ASSIGNED: 'badge-assigned', IN_REPAIR: 'badge-maintenance', EXPIRED: 'badge-expired', DECOMMISSIONED: 'badge-retired' };
    return <span className={`badge ${map[s] ?? ''}`}>{s ?? '—'}</span>;
}

function ExpiryIndicator({ warrantyExpiry }) {
    if (!warrantyExpiry) return null;
    const daysLeft = Math.ceil((new Date(warrantyExpiry) - Date.now()) / 86400000);
    if (daysLeft > 30) return null;
    const isExpired = daysLeft <= 0;
    return (
        <span title={isExpired ? 'Warranty expired' : `Warranty expires in ${daysLeft} days`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
            background: isExpired ? '#FEE2E2' : '#FEF3C7',
            color: isExpired ? '#DC2626' : '#D97706',
            marginLeft: '6px',
            verticalAlign: 'middle',
        }}>
            <Icon name="alert-triangle" size={12} style={{ marginRight: '2px' }} /> {isExpired ? 'Expired' : `${daysLeft}d`}
        </span>
    );
}

export default function AssetListPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [status, setStatus] = useState('');

    const [spareLoading, setSpareLoading] = useState(false);
    const [spare, setSpare] = useState(null);
    const [spareMsg, setSpareMsg] = useState('');

    const fetchAssets = async () => {
        setLoading(true); setError('');
        try {
            const params = {};
            if (search) params.serialNumber = search;
            if (type) params.type = type;
            if (status) params.status = status;
            const { data } = await api.get('/assets/search', { params });
            setAssets(Array.isArray(data) ? data : data.content ?? []);
        } catch {
            setError('Failed to load assets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssets(); }, [type, status]);

    const handleSearch = () => fetchAssets();

    const findSpare = async () => {
        setSpareLoading(true); setSpare(null); setSpareMsg('');
        try {
            const { data } = await api.get('/assets/spare-laptop');
            if (!data || Object.keys(data).length === 0) { setSpareMsg('No spare laptops available.'); }
            else { setSpare(data); }
        } catch {
            setSpareMsg('Could not retrieve spare laptops.');
        } finally {
            setSpareLoading(false);
        }
    };

    const expiringCount = assets.filter(a => {
        if (!a.warrantyExpiry) return false;
        return Math.ceil((new Date(a.warrantyExpiry) - Date.now()) / 86400000) <= 30;
    }).length;



    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Welcome, {user?.email?.split('@')[0] || user?.username || 'User'}!</h1>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>Asset Management Directory</p>
                    </div>
                    {expiringCount > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEE2E2', color: '#DC2626', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px' }}>
                            <Icon name="alert-triangle" size={14} /> {expiringCount} warranty alert{expiringCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Spare laptop widget */}
                <div className="spare-widget">
                    <button className="btn btn-primary btn-sm" onClick={findSpare} disabled={spareLoading}>
                        {spareLoading ? 'Searching…' : 'Find Available Spare Laptop'}
                    </button>
                    {spareMsg && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{spareMsg}</span>}
                    {spare && (
                        <div className="spare-widget-result">
                            <strong>{spare.brand} {spare.model}</strong> &nbsp;·&nbsp; S/N: {spare.serialNumber}
                            {spare.lastOwnerEmail && <> &nbsp;·&nbsp; Last owner: {spare.lastOwnerEmail}</>}
                            &nbsp;<a href={`/assets/${spare.id}`}>View details →</a>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="filter-row">
                        <div className="form-group">
                            <label>Search</label>
                            <SearchBar value={search} onChange={setSearch} placeholder="Serial number, brand, model…" />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select value={type} onChange={e => setType(e.target.value)}>
                                {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o || 'All types'}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)}>
                                {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o || 'All statuses'}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                        </div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="card">
                    {loading ? (
                        <div className="spinner-wrap"><div className="spinner" /></div>
                    ) : assets.length === 0 ? (
                        <div className="empty-state">No assets found.</div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Type</th><th>Brand / Model</th>
                                        <th>Serial No.</th><th>Status</th><th>Assigned To</th><th>Warranty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map(a => {
                                        const daysLeft = a.warrantyExpiry
                                            ? Math.ceil((new Date(a.warrantyExpiry) - Date.now()) / 86400000)
                                            : null;
                                        const isExpired = daysLeft !== null && daysLeft <= 0;
                                        const isExpiring = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
                                        return (
                                            <tr
                                                key={a.id}
                                                className="clickable"
                                                onClick={() => navigate(`/assets/${a.id}`)}
                                                style={{
                                                    background: isExpired ? '#FFF5F5' : isExpiring ? '#FFFBEB' : undefined,
                                                }}
                                            >
                                                <td>{a.type ?? '—'}</td>
                                                <td>
                                                    <strong>{a.brand} {a.model}</strong>
                                                    <ExpiryIndicator warrantyExpiry={a.warrantyExpiry} />
                                                </td>
                                                <td>{a.serialNumber ?? '—'}</td>
                                                <td>{statusBadge(a.status)}</td>
                                                <td>{a.currentOwnerEmail ?? '—'}</td>
                                                <td style={{ fontSize: '12px', color: isExpired ? '#DC2626' : isExpiring ? '#D97706' : 'var(--text-muted)' }}>
                                                    {a.warrantyExpiry
                                                        ? new Date(a.warrantyExpiry).toLocaleDateString()
                                                        : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
