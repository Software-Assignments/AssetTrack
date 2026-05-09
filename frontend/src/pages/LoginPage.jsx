import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.email || !form.password) { setError('Email and password are required.'); return; }
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
            const userParams = { email: data.email, fullName: data.fullName, role: data.role };
            login(data.token, userParams);
            if (data.role === 'ADMIN' || data.role === 'MANAGER') {
                navigate('/dashboard');
            } else {
                navigate('/assets');
            }
        } catch (err) {
            setError(err.response?.data?.message ?? 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-card">
                <div className="auth-logo">
                    <span className="auth-logo-text">AssetTrack</span>
                </div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Log in to your account</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 20 }}>
                        <label>Password <span className="required">*</span></label>
                        <input type="password" value={form.password} onChange={set('password')} placeholder="Your password" autoComplete="current-password" />
                    </div>
                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? 'Logging in…' : 'Log In'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}