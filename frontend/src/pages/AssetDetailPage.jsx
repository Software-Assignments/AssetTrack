import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';

function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
}

export default function AssetDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset]     = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true); setError('');
            try {
                const { data } = await api.get(`/assets/${id}`);
                setAsset(data);

                try {
                    // Fixed: correct endpoint is /allocation-history
                    const { data: hist } = await api.get(`/assets/${id}/allocation-history`);
                    setHistory(Array.isArray(hist) ? hist : hist.content ?? []);
                } catch {
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

    if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner" /></div></>;
    if (error)   return <><Navbar /><div className="page-wrapper"><div className="alert alert-error">{error}</div></div></>;

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Asset Detail</h1>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/assets')}>← Back to Assets</button>
                </div>

                <div className="card" style={{ marginBottom: 20 }}>
                    <p className="section-title">Asset Information</p>
                    <div className="detail-grid">
                        <div className="detail-item"><label>Type</label><p>{asset?.type ?? '—'}</p></div>
                        <div className="detail-item"><label>Brand</label><p>{asset?.brand ?? '—'}</p></div>
                        <div className="detail-item"><label>Model</label><p>{asset?.model ?? '—'}</p></div>
                        <div className="detail-item"><label>Serial Number</label><p>{asset?.serialNumber ?? '—'}</p></div>
                        <div className="detail-item"><label>Status</label><p>{asset?.status ?? '—'}</p></div>
                        {/* Fixed: correct field is currentOwnerEmail */}
                        <div className="detail-item"><label>Assigned To</label><p>{asset?.currentOwnerEmail ?? '—'}</p></div>
                        <div className="detail-item"><label>Purchase Date</label><p>{fmt(asset?.purchaseDate)}</p></div>
                        {/* Fixed: correct field is warrantyExpiry, not warrantyExpirationDate */}
                        <div className="detail-item"><label>Warranty Expires</label><p>{fmt(asset?.warrantyExpiry)}</p></div>
                    </div>
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
                                    <th>Assigned User</th>
                                    <th>Assign Date</th>
                                    <th>Return Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {history.map((h, i) => (
                                    <tr key={i}>
                                        {/* Fixed: correct fields from AllocationHistoryDTO */}
                                        <td>{h.userFullName ?? h.userEmail ?? '—'}</td>
                                        <td>{fmt(h.assignDate)}</td>
                                        <td>{h.returnDate ? fmt(h.returnDate) : 'Currently Assigned'}</td>
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
