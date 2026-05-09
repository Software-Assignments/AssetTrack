import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';


const STATUS_OPTIONS = ['', 'AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'EXPIRED', 'DECOMMISSIONED'];
const TYPE_OPTIONS   = ['', 'LAPTOP', 'SCREEN', 'ACCESSORY'];

const EMPTY = { serialNumber: '', assignedUser: '', status: '', type: '', brand: '' };

export default function AdvancedSearchPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(EMPTY);

    const set = f => e => setFilters(p => ({ ...p, [f]: e.target.value }));

    const handleSearch = e => {
        e.preventDefault();
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
        navigate(`/search/results?${params.toString()}`);
    };

    const handleReset = () => setFilters(EMPTY);

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Advanced Search</h1>
                </div>

                <div className="card" style={{ maxWidth: 640 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                        All fields are optional — combine any filters to narrow results.
                    </p>
                    <form onSubmit={handleSearch} noValidate>
                        <div className="form-group">
                            <label>Serial Number</label>
                            <input type="text" value={filters.serialNumber} onChange={set('serialNumber')} placeholder="Exact or partial serial number" />
                        </div>
                        <div className="form-group">
                            <label>Assigned User</label>

                            <input type="text" value={filters.assignedUser} onChange={set('assignedUser')} placeholder="User email or name" />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select value={filters.type} onChange={set('type')}>
                                {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o || 'Any type'}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={filters.status} onChange={set('status')}>
                                {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o || 'Any status'}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label>Brand</label>
                            <input type="text" value={filters.brand} onChange={set('brand')} placeholder="e.g. Dell, Apple" />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-primary" type="submit">Search</button>
                            <button className="btn btn-secondary" type="button" onClick={handleReset}>Reset</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}