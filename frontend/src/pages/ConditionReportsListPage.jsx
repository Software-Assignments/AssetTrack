import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ALLOWED_ROLES = ['ADMIN', 'MANAGER'];

function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
}

function severityBadge(s) {
    if (!s) return '—';
    const map = {
        LOW:    { bg: '#DCFCE7', color: '#15803D' },
        MEDIUM: { bg: '#FEF9C3', color: '#A16207' },
        HIGH:   { bg: '#FEE2E2', color: '#B91C1C' },
    };
    const style = map[s.toUpperCase()] ?? { bg: '#F1F5F9', color: '#64748B' };
    return (
        <span className="badge" style={{ background: style.bg, color: style.color }}>
            {s}
        </span>
    );
}

export default function ConditionReportsListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Role guard
    if (!ALLOWED_ROLES.includes(user?.role)) {
        return (
            <>
                <Navbar />
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>Only Admins and Managers can view condition reports.</p>
                </div>
            </>
        );
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get('/reports');
                setReports(Array.isArray(data) ? data : data.content ?? []);
            } catch {
                setError('Failed to load condition reports.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Condition Reports</h1>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="card">
                    {loading ? (
                        <div className="spinner-wrap"><div className="spinner" /></div>
                    ) : reports.length === 0 ? (
                        <div className="empty-state">No condition reports found.</div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Serial No.</th>
                                    <th>Reported By</th>
                                    <th>Date</th>
                                    <th>Severity</th>
                                    <th>Description</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reports.map((r, i) => (
                                    <tr
                                        key={r.id ?? i}
                                        className={r.asset?.id ? 'clickable' : ''}
                                        onClick={() => r.asset?.id && navigate(`/assets/${r.asset.id}`)}
                                        title={r.asset?.id ? 'View asset details' : undefined}
                                    >
                                        <td>
                                            {`${r.assetBrand ?? ''} ${r.assetModel ?? ''}`.trim() || r.assetId || '—'}
                                        </td>
                                        <td>{r.assetSerialNumber ?? '—'}</td>
                                        <td>{r.reportedByEmail ?? r.reportedByName ?? '—'}</td>
                                        <td>{fmt(r.reportedAt)}</td>
                                        <td>{severityBadge(r.conditionStatus)}</td>
                                        <td style={{ maxWidth: 300 }}>
                                                <span style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}>
                                                    {r.notes ?? '—'}
                                                </span>
                                        </td>
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
