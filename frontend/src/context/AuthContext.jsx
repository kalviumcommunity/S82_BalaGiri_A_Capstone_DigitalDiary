import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useIdleTimer from '../hooks/useIdleTimer';
import { derivePasswordKey, decryptMasterKeyForHKDF, deriveAuthToken, checkValidator } from '../utils/cryptoUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // MASTER KEY: Kept ONLY in memory.
    // Derived from password on Login/Unlock. Wiped on Logout/Timeout.
    const [masterKey, setMasterKey] = useState(null);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if user is authenticated (HTTP Only Cookie)
    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.isAuthenticated && data.user) {
                    setUser(data.user);
                    setIsAuthenticated(true);
                    // Note: masterKey remains null after refresh until explicit unlock
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                    setMasterKey(null);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setMasterKey(null);
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
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        }
        setUser(null);
        setIsAuthenticated(false);
        setMasterKey(null); // CRITICAL: Wipe Key
        navigate('/');
    }, [navigate]);

    useIdleTimer(300000, handleLogout, isAuthenticated); // 5 mins idle

    const login = async (email, password) => {
        try {
            // 1. Derive Auth Token (Split Key)
            const authToken = await deriveAuthToken(password);

            // 2. Authenticate with Server
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: authToken }) // Send Hash, not Password
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Login failed');
            }

            const data = await res.json();
            setUser(data.user);
            setIsAuthenticated(true);

            // 3. Derive Master Key & Verify
            if (data.user.kdfSalt && data.user.validatorHash) {
                await unlockFn(password, data.user);
            }

            return data;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };

    /**
     * Unlocks the diary by deriving the Master Key from the password.
     * Validates against the stored Validator Hash.
     */
    const unlock = async (password) => {
        if (!user) throw new Error("No user loaded");
        await unlockFn(password, user);
    };

    const unlockFn = async (password, userData) => {
        try {
            if (!userData.kdfSalt || !userData.encryptedMasterKey || !userData.masterKeyIV) {
                throw new Error("User has no encryption setup or logic is outdated.");
            }

            // 1. Derive Password Key (KEK)
            const passwordKey = await derivePasswordKey(password, userData.kdfSalt);

            // 2. Unwrap Master Key
            const mk = await decryptMasterKeyForHKDF(passwordKey, userData.encryptedMasterKey, userData.masterKeyIV);

            // 3. Verify with Validator Hash (Zero-Knowledge Check)
            if (userData.validatorHash) {
                const isValid = await checkValidator(userData.validatorHash, mk);
                if (!isValid) throw new Error("Invalid password (encryption check failed)");
            }

            setMasterKey(mk);
            console.log("Master Key derived and in memory.");
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
        isUnlocked: !!masterKey, // Convenience flag
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
