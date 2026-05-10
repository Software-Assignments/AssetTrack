import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';

export default function AssignTransferPage() {
    const navigate = useNavigate();
    const [assets, setAssets]   = useState([]);
    const [users, setUsers]     = useState([]);
    const [assetId, setAssetId] = useState('');
    const [userId, setUserId]   = useState('');
    const [transfer, setTransfer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchErr, setFetchErr] = useState('');
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [aRes, uRes] = await Promise.all([
                    api.get('/assets'),
                    api.get('/users'),
                ]);
                setAssets(Array.isArray(aRes.data) ? aRes.data : aRes.data.content ?? []);
                setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data.content ?? []);
            } catch {
                setFetchErr('Failed to load assets or users. Check that GET /users is implemented.');
            }
        };
        load();
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!assetId || !userId) { setError('Please select both an asset and a user.'); return; }
        setError(''); setSuccess('');
        setLoading(true);
        try {
            await api.post(`/assets/${assetId}/allocate`, { userId, transfer });
            setSuccess('Asset assigned successfully!');
            setTimeout(() => navigate(`/assets/${assetId}`), 1500);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Assignment failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Assign / Transfer Asset</h1>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/assets')}>← Back</button>
                </div>

                <div className="card" style={{ maxWidth: 500 }}>
                    {fetchErr && <div className="alert alert-error">{fetchErr}</div>}
                    {error    && <div className="alert alert-error">{error}</div>}
                    {success  && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label>Asset <span className="required">*</span></label>
                            <select value={assetId} onChange={e => setAssetId(e.target.value)}>
                                <option value="">Select asset…</option>
                                {assets.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.brand} {a.model} — {a.serialNumber}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label>Assign To <span className="required">*</span></label>
                            <select value={userId} onChange={e => setUserId(e.target.value)}>
                                <option value="">Select user…</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.email ?? u.username ?? u.name ?? u.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={transfer}
                                    onChange={e => setTransfer(e.target.checked)}
                                />
                                Transfer (asset is already assigned to someone else)
                            </label>
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading || !!fetchErr}>
                            {loading ? (transfer ? 'Transferring…' : 'Assigning…') : (transfer ? 'Transfer Asset' : 'Assign Asset')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}