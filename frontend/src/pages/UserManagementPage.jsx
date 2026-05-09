import { useEffect, useState } from 'react';
import Navbar, { Icon } from '../components/Navbar';
import api from '../api/axiosInstance';

const ROLES = ['ADMIN', 'MANAGER', 'DEVELOPER', 'USER'];

const roleBadge = {
    ADMIN:     { bg: '#FEE2E2', color: '#DC2626' },
    MANAGER:   { bg: '#FEF3C7', color: '#D97706' },
    DEVELOPER: { bg: '#EDE9FE', color: '#7C3AED' },
    USER:      { bg: '#DBEAFE', color: '#1D4ED8' },
};

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editRole, setEditRole] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/users');
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load users.');
        }
        setLoading(false);
    };

    const startEdit = (user) => {
        setEditingId(user.id);
        setEditRole(user.role);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditRole('');
    };

    const saveRole = async (userId) => {
        setSaving(true);
        try {
            const { data } = await api.put(`/users/${userId}/role`, { role: editRole });
            setUsers(prev => prev.map(u => u.id === userId ? data : u));
            setSuccessMsg('Role updated.');
            setTimeout(() => setSuccessMsg(''), 2500);
            cancelEdit();
        } catch {
            setError('Failed to update role.');
        }
        setSaving(false);
    };

    const toggleEnabled = async (userId) => {
        try {
            const { data } = await api.put(`/users/${userId}/toggle`);
            setUsers(prev => prev.map(u => u.id === userId ? data : u));
            setSuccessMsg('User status updated.');
            setTimeout(() => setSuccessMsg(''), 2500);
        } catch {
            setError('Failed to toggle user status.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="page-header">
                    <h1 className="page-title">User Management</h1>
                    <button className="btn btn-secondary btn-sm" onClick={loadUsers}>↻ Refresh</button>
                </div>

                {successMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ {successMsg}</div>}
                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

                <div className="card">
                    {loading ? (
                        <div className="spinner-wrap"><div className="spinner" /></div>
                    ) : users.length === 0 ? (
                        <div className="empty-state">No users found.</div>
                    ) : (
                        <>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                                {users.length} user{users.length !== 1 ? 's' : ''}
                            </p>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Full Name</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => {
                                            const rs = roleBadge[u.role] ?? roleBadge.USER;
                                            const isEditing = editingId === u.id;
                                            return (
                                                <tr key={u.id}>
                                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.id}</td>
                                                    <td style={{ fontWeight: 500 }}>{u.email}</td>
                                                    <td>{u.fullName ?? '—'}</td>
                                                    <td>
                                                        {isEditing ? (
                                                            <select
                                                                value={editRole}
                                                                onChange={e => setEditRole(e.target.value)}
                                                                style={{ fontSize: 12, padding: '3px 6px', borderRadius: 4, border: '1px solid var(--border)' }}
                                                            >
                                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                            </select>
                                                        ) : (
                                                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: rs.bg, color: rs.color }}>
                                                                {u.role}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: u.enabled ? '#D1FAE5' : '#FEE2E2', color: u.enabled ? '#065F46' : '#DC2626' }}>
                                                            {u.enabled ? 'Active' : 'Disabled'}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                            {isEditing ? (
                                                                <>
                                                                    <button className="btn btn-primary btn-sm" onClick={() => saveRole(u.id)} disabled={saving}>
                                                                        {saving ? '…' : 'Save'}
                                                                    </button>
                                                                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(u)} title="Edit role">
                                                                        <Icon name="user" size={13} />
                                                                        &nbsp;Role
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-secondary btn-sm"
                                                                        onClick={() => toggleEnabled(u.id)}
                                                                        title={u.enabled ? 'Deactivate user' : 'Activate user'}
                                                                        style={{ color: u.enabled ? 'var(--error)' : 'var(--success)' }}
                                                                    >
                                                                        {u.enabled ? 'Deactivate' : 'Activate'}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
