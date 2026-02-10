import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useIdleTimer from '../hooks/useIdleTimer';
import { deriveKey, decryptData } from '../utils/encryptionUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [privateKey, setPrivateKey] = useState(null); // Decrypted Private Key (Memory Only)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if user is authenticated (HTTP Only Cookie)
    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed', error);
            setUser(null);
            setIsAuthenticated(false);
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
        setPrivateKey(null); // Wipe key
        navigate('/');
    }, [navigate]);

    useIdleTimer(300000, handleLogout, isAuthenticated); // 5 mins idle

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Login failed');
            }

            const data = await res.json();
            setUser(data.user);
            setIsAuthenticated(true);

            // Derive Wrapping Key & Decrypt Private Key
            if (data.user.salt && data.user.encryptedPrivateKey && data.user.iv) {
                await unlockFn(password, data.user);
            }

            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const unlock = async (password) => {
        if (!user) throw new Error("No user loaded");
        await unlockFn(password, user);
    };

    const unlockFn = async (password, userData) => {
        try {
            // 1. Derive wrapping key from password
            const wrappingKey = await deriveKey(password, userData.salt);

            // 2. Decrypt the stored private key
            // Note: decryptData returns string, assuming encryptedPrivateKey sends stringified PEM or similar?
            // If encryptedPrivateKey is hex, decryptData handles it.
            const decryptedKeyStr = await decryptData(
                userData.encryptedPrivateKey,
                userData.iv,
                wrappingKey
            );

            // 3. Import the Private Key (assuming it's PEM or JWK)
            // For now, let's store it as is, or import if we use it for signing/decrypting actual data
            // Assuming the system expects a CryptoKey object for 'privateKey'
            // We need to know the format. If it was stored as PEM/string, we might need to import it.
            // Let's assume for now we just store the "Unwrapped" key material (string/object) 
            // until we see how it's used in components. 
            // If previous implementation expected CryptoKey, we should import it.
            // But let's keep it simple: Store the usable private key.

            setPrivateKey(decryptedKeyStr);
            console.log("Private key decrypted and in memory");
        } catch (e) {
            console.error("Unlock failed", e);
            throw new Error("Invalid password or corrupted key");
        }
    };

    const logout = () => {
        handleLogout();
    };

    const contextValue = React.useMemo(() => ({
        user,
        isAuthenticated,
        privateKey,
        setPrivateKey,
        loading,
        login,
        logout,
        unlock,
        checkAuth
    }), [user, isAuthenticated, privateKey, loading, login, logout, unlock, checkAuth]);

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
