import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('jwt') || null);
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    });

    const login = (jwt, userData) => {
        localStorage.setItem('jwt', jwt);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(jwt);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);