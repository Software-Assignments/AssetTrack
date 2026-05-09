import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';

function statusBadge(s) {
    const map = {
        AVAILABLE: 'badge-available', ASSIGNED: 'badge-assigned',
        IN_REPAIR: 'badge-maintenance', EXPIRED: 'badge-expired', DECOMMISSIONED: 'badge-retired'
    };
    return <span className={`badge ${map[s] ?? ''}`}>{s ?? '—'}</span>;
}

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError('');
            try {
                // Build params object from URL search params
                const params = {};
                for (const [key, value] of searchParams.entries()) {
                    if (value) params[key] = value;
                }

                const { data } = await api.get('/assets/search', { params });
                setResults(Array.isArray(data) ? data : data.content ?? []);
            } catch {
                setError('Failed to load search results.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [searchParams]);

    // Build a human-readable summary of active filters
    const activeFilters = [];
    for (const [key, value] of searchParams.entries()) {
        if (value) activeFilters.push(`${key}: ${value}`);
    }



    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Search Results</h1>
                    <Link to="/search" className="btn btn-secondary btn-sm">← Back to Search</Link>
                </div>

                {activeFilters.length > 0 && (
                    <div className="alert alert-info" style={{ marginBottom: 20 }}>
                        Filters: {activeFilters.join(' · ')}
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                <div className="card">
                    {loading ? (
                        <div className="spinner-wrap"><div className="spinner" /></div>
                    ) : results.length === 0 ? (
                        <div className="empty-state">
                            No results found.{' '}
                            <Link to="/search">Adjust your filters</Link>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                                {results.length} result{results.length !== 1 ? 's' : ''} found
                            </p>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Brand</th>
                                        <th>Model</th>
                                        <th>Serial No.</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {results.map(a => (
                                        <tr
                                            key={a.id}
                                            className="clickable"
                                            onClick={() => navigate(`/assets/${a.id}`)}
                                        >
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
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
