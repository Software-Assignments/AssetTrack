import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { NotificationProvider } from './context/NotificationContext';
import {AuthProvider} from "./context/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <NotificationProvider>
                <App />
            </NotificationProvider>
        </AuthProvider>
    </StrictMode>
);
