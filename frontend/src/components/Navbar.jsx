import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// TODO (other members): add nav links here as pages are built out
export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <span className="navbar-brand">AssetTrack</span>
            <div className="navbar-right">
                {user && (
                    <span className="navbar-user">{user.email ?? user.username ?? ''}</span>
                )}
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </nav>
    );
}