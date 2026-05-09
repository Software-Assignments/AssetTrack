import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function SignUpPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '',email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        if (!form.fullName || !form.email || !form.password || !form.confirm)
            return 'All fields are required.';
        if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
        if (form.password.length < 8) return 'Password must be at least 8 characters.';
        if (form.password !== form.confirm) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/signup', {fullName: form.fullName,email: form.email, password: form.password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message ?? 'Registration failed. Please try again.');
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
                <h1 className="auth-title">Create an account</h1>
                <p className="auth-subtitle">Sign up to get started</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label>Full Name <span className="required">*</span></label>
                        <input type="text" value={form.fullName} onChange={set('fullName')} placeholder="Your full name"
                               autoComplete="name"/>
                    </div>
                    <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                               autoComplete="email"/>
                    </div>
                    <div className="form-group">
                        <label>Password <span className="required">*</span></label>
                        <input type="password" value={form.password} onChange={set('password')}
                               placeholder="Min. 8 characters" autoComplete="new-password"/>
                    </div>
                    <div className="form-group" style={{marginBottom: 20}}>
                        <label>Confirm password <span className="required">*</span></label>
                        <input type="password" value={form.confirm} onChange={set('confirm')}
                               placeholder="Repeat password" autoComplete="new-password"/>
                    </div>
                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? 'Creating account…' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}