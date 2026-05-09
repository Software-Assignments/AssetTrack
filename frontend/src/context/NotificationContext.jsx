import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Mock alert generation based on asset data
function generateAlertsFromAssets(assets) {
    const alerts = [];
    const now = new Date();

    assets.forEach(asset => {
        // Expiry / warranty warnings
        if (asset.warrantyExpiry) {
            const expiry = new Date(asset.warrantyExpiry);
            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 0) {
                alerts.push({
                    id: `warranty-expired-${asset.id}`,
                    type: 'error',
                    title: 'Warranty Expired',
                    message: `${asset.brand} ${asset.model} (${asset.serialNumber}) warranty has expired.`,
                    assetId: asset.id,
                    timestamp: new Date().toISOString(),
                    read: false,
                });
            } else if (daysLeft <= 30) {
                alerts.push({
                    id: `warranty-expiring-${asset.id}`,
                    type: 'warning',
                    title: 'Warranty Expiring Soon',
                    message: `${asset.brand} ${asset.model} warranty expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
                    assetId: asset.id,
                    timestamp: new Date().toISOString(),
                    read: false,
                });
            }
        }

        // Retired/maintenance status alerts
        if (asset.status === 'IN_REPAIR') {
            alerts.push({
                id: `maintenance-${asset.id}`,
                type: 'info',
                title: 'Asset in Maintenance',
                message: `${asset.brand} ${asset.model} (${asset.serialNumber}) is currently under maintenance.`,
                assetId: asset.id,
                timestamp: new Date().toISOString(),
                read: false,
            });
        }
    });

    return alerts;
}

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [alertSettings, setAlertSettings] = useState(() => {
        const saved = localStorage.getItem('alertSettings');
        return saved ? JSON.parse(saved) : {
            warrantyExpiryDays: 30,
            showMaintenanceAlerts: true,
            showExpiredAlerts: true,
        };
    });

    const fetchAndGenerateAlerts = useCallback(async () => {
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) return;
        try {
            const { data } = await api.get('/assets');
            const assets = Array.isArray(data) ? data : (data.content ?? []);
            const generated = generateAlertsFromAssets(assets);

            setNotifications(prev => {
                // Merge: keep read state for existing notifications, add new ones
                const readSet = new Set(prev.filter(n => n.read).map(n => n.id));
                return generated.map(n => ({ ...n, read: readSet.has(n.id) }));
            });
        } catch {
            // If API fails, don't clear existing notifications
        }
    }, []);

    // Poll every 30 seconds for real-time updates
    useEffect(() => {
        fetchAndGenerateAlerts();
        const interval = setInterval(fetchAndGenerateAlerts, 30000);
        return () => clearInterval(interval);
    }, [fetchAndGenerateAlerts]);

    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const saveAlertSettings = useCallback((settings) => {
        setAlertSettings(settings);
        localStorage.setItem('alertSettings', JSON.stringify(settings));
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            alertSettings,
            saveAlertSettings,
            refresh: fetchAndGenerateAlerts,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
