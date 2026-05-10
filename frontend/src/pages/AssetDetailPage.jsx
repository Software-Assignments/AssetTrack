import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
}

export default function AssetDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [asset, setAsset] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const { user } = useAuth();
    const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const markInRepair = async () => {
        try {
            const { data } = await api.patch(`/assets/${id}/mark-in-repair`);
            setAsset(data);
        } catch {
            setError('Failed to mark asset as IN_REPAIR.');
        }
    };

    const markRepaired = async () => {
        try {
            const { data } = await api.patch(`/assets/${id}/mark-repaired`);
            setAsset(data);
        } catch {
            setError('Failed to mark asset as Repaired.');
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true); setError('');
            try {
                const { data } = await api.get(`/assets/${id}`);
                setAsset(data);

                try {
                    const { data: hist } = await api.get(`/assets/${id}/allocation-history`);
                    setHistory(Array.isArray(hist) ? hist : hist.content ?? []);
                } catch {
                    // Endpoint may not exist yet — leave history empty
                    setHistory([]);
                }
            } catch {
                setError('Failed to load asset details.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this asset?")) return;
        try {
            await api.delete(`/assets/${id}`);
            navigate('/assets');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to delete asset. It might still be assigned to a user.');
        }
    };

    if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner" /></div></>;
    if (error) return <><Navbar /><div className="page-wrapper"><div className="alert alert-error">{error}</div></div></>;

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Asset Detail</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {user?.role === 'ADMIN' && (
                            <button className="btn btn-secondary btn-sm" style={{ color: '#DC2626', borderColor: '#FCA5A5' }} onClick={handleDelete}>
                                Delete Asset
                            </button>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/assets')}>← Back to Assets</button>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 20 }}>
                    <p className="section-title">Asset Information</p>
                    <div className="detail-grid">
                        <div className="detail-item"><label>Type</label><p>{asset?.type ?? '—'}</p></div>
                        <div className="detail-item"><label>Brand</label><p>{asset?.brand ?? '—'}</p></div>
                        <div className="detail-item"><label>Model</label><p>{asset?.model ?? '—'}</p></div>
                        <div className="detail-item"><label>Serial Number</label><p>{asset?.serialNumber ?? '—'}</p></div>
                        <div className="detail-item"><label>Status</label><p>{asset?.status ?? '—'}</p></div>
                        <div className="detail-item"><label>Assigned To</label><p>{asset?.currentOwnerEmail ?? '—'}</p></div>
                        <div className="detail-item"><label>Purchase Date</label><p>{fmt(asset?.purchaseDate)}</p></div>
                        <div className="detail-item"><label>Warranty Expires</label><p>{fmt(asset?.warrantyExpiry)}</p></div>
                    </div>
                    {isManagerOrAdmin && asset && (
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            {asset.status !== 'DECOMMISSIONED' && asset.status !== 'EXPIRED' && asset.status !== 'IN_REPAIR' && (
                                <button className="btn btn-primary" onClick={markInRepair}>
                                    Send to Repair
                                </button>
                            )}
                            {asset.status === 'IN_REPAIR' && (
                                <button className="btn btn-primary" onClick={markRepaired}>
                                    Mark as Repaired
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="card">
                    <p className="section-title">Allocation History</p>
                    {history.length === 0 ? (
                        <div className="empty-state">No allocation history found.</div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User Email</th>
                                        <th>Assign Date</th>
                                        <th>Return Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((h, i) => (
                                        <tr key={i}>
                                            <td>{h.userEmail ?? h.userFullName ?? '—'}</td>
                                            <td>{fmt(h.assignDate)}</td>
                                            <td>{fmt(h.returnDate)}</td>
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