import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useIdleTimer from '../hooks/useIdleTimer';
import { derivePasswordKey, decryptMasterKeyForHKDF, deriveAuthToken, checkValidator } from '../utils/cryptoUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [masterKey, setMasterKey] = useState(null);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/auth/me`, {
                headers,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.isAuthenticated && data.user) {
                    setUser(data.user);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                    setMasterKey(null);
                    if (token) localStorage.removeItem('token');
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setMasterKey(null);
                if (token) localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth check failed', error);
            setUser(null);
            setIsAuthenticated(false);
            setMasterKey(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleLogout = useCallback(async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error('Logout failed', error);
        }
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setMasterKey(null);
        navigate('/');
    }, [navigate]);

    useIdleTimer(300000, handleLogout, isAuthenticated);

    const login = async (email, password) => {
        try {
            const authToken = await deriveAuthToken(password);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password: authToken })
            });

            if (!res.ok) {
                let errorMessage = 'Login failed';
                try {
                    const err = await res.json();
                    errorMessage = err.message || errorMessage;
                } catch (e) {
                    errorMessage = res.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();

            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            setUser(data.user);
            setIsAuthenticated(true);

            if (data.user.kdfSalt && data.user.validatorHash) {
                await unlockFn(password, data.user);
            }

            return data;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };


    const unlock = async (password) => {
        if (!user) throw new Error("No user loaded");
        await unlockFn(password, user);
    };

    const unlockFn = async (password, userData) => {
        try {
            if (!userData.kdfSalt || !userData.encryptedMasterKey || !userData.masterKeyIV) {
                throw new Error("User has no encryption setup or logic is outdated.");
            }

            const passwordKey = await derivePasswordKey(password, userData.kdfSalt);

            const mk = await decryptMasterKeyForHKDF(passwordKey, userData.encryptedMasterKey, userData.masterKeyIV);

            if (userData.validatorHash) {
                const isValid = await checkValidator(userData.validatorHash, mk);
                if (!isValid) throw new Error("Invalid password (encryption check failed)");
            }

            setMasterKey(mk);
            return true;
        } catch (e) {
            console.error("Unlock failed", e);
            throw new Error(e.message || "Failed to unlock diary.");
        }
    };

    const logout = () => {
        handleLogout();
    };

    const contextValue = React.useMemo(() => ({
        user,
        isAuthenticated,
        masterKey,
        loading,
        login,
        logout,
        unlock,
        isUnlocked: !!masterKey,
    }), [user, isAuthenticated, masterKey, loading, login, logout, unlock]);

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
