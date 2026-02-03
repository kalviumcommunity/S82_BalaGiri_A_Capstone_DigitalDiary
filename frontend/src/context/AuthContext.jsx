import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useIdleTimer from '../hooks/useIdleTimer';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = useCallback(() => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
        navigate('/');
    }, [navigate]);

    // Use the idle timer hook
    // Time: 30 minutes (1800000ms) or 15 minutes as requested. 
    // User asked for "15 or 30 minutes". Let's do 15 minutes (900000ms).
    // Changed to 5 minutes (300000ms) as per conversation history mentioning 5 mins previously, 
    // but prompt says 15 or 30. I'll stick to 15 mins (900000) to be safe with prompt.
    // Actually, let's Stick to the 5 mins default in the hook if that was the prior agreement, 
    // but the prompt explicitly says "15 or 30 minutes". I will Use 15 minutes.
    useIdleTimer(900000, handleLogout, !!token);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('lastActivity', Date.now().toString());
    };

    const logout = () => {
        handleLogout();
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
