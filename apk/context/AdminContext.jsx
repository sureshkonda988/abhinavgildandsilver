import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

const API_BASE = 'https://www.abhinavgoldandsilver.com/api';

export const AdminProvider = ({ children }) => {
    const [adminSettings, setAdminSettings] = useState({
        ticker: 'Welcome to Abhinav Gold & Silver - Quality Purity Guaranteed',
        videos: []
    });

    const syncAdminSettings = async () => {
        try {
            // Fetch ticker and basic settings from backend
            const settingsRes = await axios.get(`${API_BASE}/rates/settings`);
            const videosRes = await axios.get(`${API_BASE}/videos`);
            
            setAdminSettings(prev => ({
                ...prev,
                ticker: settingsRes.data?.ticker || prev.ticker,
                videos: videosRes.data || prev.videos,
            }));
        } catch (error) {
            console.error("Failed to sync Admin Settings in App:", error.message);
        }
    };

    useEffect(() => {
        syncAdminSettings();
        const poller = setInterval(syncAdminSettings, 10000); // 10s sync
        return () => clearInterval(poller);
    }, []);

    return (
        <AdminContext.Provider value={{ adminSettings }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
