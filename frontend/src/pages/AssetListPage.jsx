import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';

// TODO: confirm status values with backend (AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED)
const STATUS_OPTIONS = ['', 'AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED'];
// TODO: confirm asset type values with backend (LAPTOP, MONITOR, ACCESSORY)
const TYPE_OPTIONS   = ['', 'LAPTOP', 'MONITOR', 'ACCESSORY'];

function statusBadge(s) {
    const map = { AVAILABLE: 'badge-available', ASSIGNED: 'badge-assigned', MAINTENANCE: 'badge-maintenance', RETIRED: 'badge-retired' };
    return <span className={`badge ${map[s] ?? ''}`}>{s ?? '—'}</span>;
}

export default function AssetListPage() {
    const navigate = useNavigate();
    const [assets, setAssets]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [search, setSearch]   = useState('');
    const [type, setType]       = useState('');
    const [status, setStatus]   = useState('');

    // ── Spare laptop widget state ──
    const [spareLoading, setSpareLoading] = useState(false);
    const [spare, setSpare]               = useState(null);   // asset object or null
    const [spareMsg, setSpareMsg]         = useState('');

    const fetchAssets = async () => {
        setLoading(true); setError('');
        try {
            // TODO: confirm query param names with backend (?search=, ?type=, ?status=)
            const params = {};
            if (search) params.search = search;
            if (type)   params.type   = type;
            if (status) params.status = status;
            const { data } = await api.get('/assets', { params });
            setAssets(Array.isArray(data) ? data : data.content ?? []);
        } catch {
            setError('Failed to load assets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssets(); }, [type, status]);   // refetch on filter change

    const handleSearch = () => fetchAssets();

    const findSpare = async () => {
        setSpareLoading(true); setSpare(null); setSpareMsg('');
        try {
            // TODO: confirm spare laptop query params with backend
            const { data } = await api.get('/assets', { params: { type: 'LAPTOP', status: 'AVAILABLE' } });
            const list = Array.isArray(data) ? data : data.content ?? [];
            if (list.length === 0) { setSpareMsg('No spare laptops available.'); }
            else { setSpare(list[0]); }
        } catch {
            setSpareMsg('Could not retrieve spare laptops.');
        } finally {
            setSpareLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Assets</h1>
                </div>

                {/* Spare laptop widget */}
                <div className="spare-widget">
                    <button className="btn btn-primary btn-sm" onClick={findSpare} disabled={spareLoading}>
                        {spareLoading ? 'Searching…' : '⚡ Find Available Spare Laptop'}
                    </button>
                    {spareMsg && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{spareMsg}</span>}
                    {spare && (
                        <div className="spare-widget-result">
                            <strong>{spare.brand} {spare.model}</strong> &nbsp;·&nbsp; S/N: {spare.serialNumber}
                            {spare.lastOwner && <> &nbsp;·&nbsp; Last owner: {spare.lastOwner?.email ?? spare.lastOwner}</>}
                            &nbsp;
                            <a href={`/assets/${spare.id}`}>View details →</a>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="filter-row">
                        <div className="form-group">
                            <label>Search</label>
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                                placeholder="Serial number, brand, model…"
                            />
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

                {/* Table */}
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
                                    <th>Type</th><th>Brand</th><th>Model</th>
                                    <th>Serial No.</th><th>Status</th><th>Assigned To</th>
                                </tr>
                                </thead>
                                <tbody>
                                {assets.map(a => (
                                    <tr key={a.id} className="clickable" onClick={() => navigate(`/assets/${a.id}`)}>
                                        <td>{a.type ?? '—'}</td>
                                        <td>{a.brand ?? '—'}</td>
                                        <td>{a.model ?? '—'}</td>
                                        <td>{a.serialNumber ?? '—'}</td>
                                        <td>{statusBadge(a.status)}</td>
                                        <td>{a.assignedTo?.email ?? a.assignedTo ?? '—'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}