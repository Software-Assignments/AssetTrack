import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ALLOWED_ROLES = ['ADMIN', 'MANAGER'];
const ASSET_TYPES = ['LAPTOP', 'SCREEN', 'ACCESSORY'];

const EMPTY = { type: '', brand: '', model: '', serialNumber: '', purchaseDate: '', warrantyExpiry: '' };

export default function AssetRegistrationPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm]       = useState(EMPTY);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Role guard
    if (!ALLOWED_ROLES.includes(user?.role)) {
        return (
            <>
                <Navbar />
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>Only Admins and Managers can register new assets.</p>
                </div>
            </>
        );
    }

    const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        const { type, brand, model, serialNumber, purchaseDate, warrantyExpiry } = form;
        if (!type || !brand || !model || !serialNumber || !purchaseDate || !warrantyExpiry)
            return 'All fields are required.';
        return null;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setError(''); setSuccess('');
        setLoading(true);
        try {
            await api.post('/assets', form);
            setSuccess('Asset registered successfully!');
            setTimeout(() => navigate('/assets'), 1500);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Failed to register asset.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Register New Asset</h1>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/assets')}>← Back</button>
                </div>

                <div className="card" style={{ maxWidth: 600 }}>
                    {error   && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label>Asset Type <span className="required">*</span></label>
                            <select value={form.type} onChange={set('type')}>
                                <option value="">Select type…</option>
                                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Brand <span className="required">*</span></label>
                            <input type="text" value={form.brand} onChange={set('brand')} placeholder="e.g. Dell" />
                        </div>
                        <div className="form-group">
                            <label>Model <span className="required">*</span></label>
                            <input type="text" value={form.model} onChange={set('model')} placeholder="e.g. XPS 15" />
                        </div>
                        <div className="form-group">
                            <label>Serial Number <span className="required">*</span></label>
                            <input type="text" value={form.serialNumber} onChange={set('serialNumber')} placeholder="Unique serial number" />
                        </div>
                        <div className="form-group">
                            <label>Purchase Date <span className="required">*</span></label>
                            <input type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label>Warranty Expiration Date <span className="required">*</span></label>
                            <input type="date" value={form.warrantyExpiry} onChange={set('warrantyExpiry')} />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Registering…' : 'Register Asset'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}