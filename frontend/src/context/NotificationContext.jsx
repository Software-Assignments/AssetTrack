import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

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

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const endpoint =
                user.role === 'ADMIN' || user.role === 'MANAGER'
                    ? '/notifications/all'
                    : '/notifications';
            const { data } = await api.get(endpoint);
            const list = Array.isArray(data) ? data : [];
            setNotifications(
                list.map(n => ({
                    id: n.id,
                    type: n.type,
                    title: (n.type ?? '').replace(/_/g, ' '),
                    message: n.message,
                    assetId: n.assetId,
                    timestamp: n.createdAt,
                    read: n.read ?? false,
                    resolved: n.resolved ?? false,
                }))
            );
        } catch {
            // Network error — keep existing notifications
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
        } catch { /* optimistic */ }
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(async () => {
        const unread = notifications.filter(n => !n.read);
        await Promise.allSettled(unread.map(n => api.put(`/notifications/${n.id}/read`)));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, [notifications]);

    const resolveNotification = useCallback(async (id) => {
        try {
            await api.put(`/notifications/${id}/resolve`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, resolved: true, read: true } : n)
            );
        } catch { /* silent */ }
    }, []);

    const unreadCount = notifications.filter(n => !n.read && !n.resolved).length;

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
            resolveNotification,
            alertSettings,
            saveAlertSettings,
            refresh: fetchNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
