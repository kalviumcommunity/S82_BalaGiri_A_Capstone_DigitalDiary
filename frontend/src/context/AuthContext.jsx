import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useIdleTimer from '../hooks/useIdleTimer';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
    const [privateKey, setPrivateKey] = useState(null); // CryptoKey
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = useCallback(() => {
        setToken(null);
        setUser(null);
        setPrivateKey(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        navigate('/');
    }, [navigate]);

    useIdleTimer(900000, handleLogout, !!token);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (newToken, userData) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
        localStorage.setItem('lastActivity', Date.now().toString());
    };

    const logout = () => {
        handleLogout();
    };

    const isAuthenticated = !!token;

    const contextValue = React.useMemo(() => ({
        token,
        user,
        privateKey,
        setPrivateKey,
        isAuthenticated,
        login,
        logout,
        loading
    }), [token, user, privateKey, isAuthenticated, loading, login, logout]);

    return (
        <AuthContext.Provider value={contextValue}>
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
