import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const EMPTY = { assetId: '', description: '', severity: 'LOW' };

export default function ConditionReportPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY);
    const [assets, setAssets] = useState([]);
    const [assetsLoading, setAssetsLoading] = useState(true);
    const [assetsError, setAssetsError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAssets = async () => {
            setAssetsLoading(true);
            setAssetsError('');
            try {
                const params = {};
                if (user?.id) params.assignedTo = user.id;
                const { data } = await api.get('/assets/search', { params });
                setAssets(Array.isArray(data) ? data : data.content ?? []);
            } catch {
                setAssetsError('Could not load your assigned assets.');
            } finally {
                setAssetsLoading(false);
            }
        };
        loadAssets();
    }, [user]);

    const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        if (!form.assetId) return 'Please select an asset.';
        if (!form.description.trim()) return 'Description is required.';
        return null;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setError(''); setSuccess('');
        setLoading(true);
        try {
            await api.post('/reports', {
                assetId: form.assetId,
                issueDescription: form.description,
                severity: form.severity,
            });
            setSuccess('Condition report submitted successfully!');
            setForm(EMPTY);
            setTimeout(() => navigate('/assets'), 2000);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Failed to submit report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Report Asset Condition</h1>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/assets')}>← Back</button>
                </div>

                <div className="card" style={{ maxWidth: 600 }}>
                    {error   && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    {assetsError && <div className="alert alert-error">{assetsError}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label>Asset <span className="required">*</span></label>
                            {assetsLoading ? (
                                <select disabled><option>Loading assets…</option></select>
                            ) : (
                                <select value={form.assetId} onChange={set('assetId')}>
                                    <option value="">Select asset…</option>
                                    {assets.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.brand} {a.model} — {a.serialNumber}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {!assetsLoading && assets.length === 0 && !assetsError && (
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                    No assets currently assigned to you.
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Severity <span className="required">*</span></label>
                            <select value={form.severity} onChange={set('severity')}>
                                {SEVERITY_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label>Condition Description <span className="required">*</span></label>
                            <textarea
                                value={form.description}
                                onChange={set('description')}
                                placeholder="Describe the condition or issue with this asset…"
                                rows={5}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading || assetsLoading}
                        >
                            {loading ? 'Submitting…' : 'Submit Report'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
