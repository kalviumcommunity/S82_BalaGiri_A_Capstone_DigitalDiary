import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { derivePasswordKey, decryptMasterKeyForHKDF, deriveEncryptionKey, checkValidator } from '../utils/cryptoUtils';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // STRICT SEPARATION:
    // token = JWT for Backend Auth (stored in localStorage)
    // encryptionKey = Derived Key for Decryption (stored in MEMORY ONLY)
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [encryptionKey, setEncryptionKey] = useState(null);



    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const checkAuth = useCallback(async () => {
        try {
            const storedToken = localStorage.getItem('token');

            if (!storedToken) {
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
                setEncryptionKey(null);
                setLoading(false);
                return;
            }

            // Basic format check (JWT has 3 parts)
            if (storedToken.split('.').length !== 3) {
                console.error("[Auth] Malformed token found, clearing.");
                logout();
                return;
            }

            const headers = {
                'Authorization': `Bearer ${storedToken}`
            };

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/auth/me`, {
                headers,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.isAuthenticated && data.user) {
                    setUser(data.user);
                    setIsAuthenticated(true);
                    // Ensure state matches storage
                    setToken(storedToken);
                } else {
                    // Logic: If server says not authenticated effectively (e.g. valid token structure but session invalid?)
                    // But usually 401 is thrown. If 200 OK but !isAuthenticated, it's weird, but we should logout.
                    logout();
                }
            } else {
                // ONLY logout if explicitly unauthorized (401)
                if (res.status === 401) {
                    console.log("Access denied (401), logging out.");
                    logout();
                } else {
                    console.warn(`[Auth] Server returned ${res.status}, keeping local session for now.`);

                }
            }
        } catch (error) {
            console.error('Auth check failed (Network/Other)', error);
            // checkAuth logic instruction: "Does NOT clear token unless backend returns 401."
            // So on network error, we do NOTHING (keep token).
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleLogout = useCallback(async (reason = "manual") => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/auth/logout`, { method: 'POST' });
        } catch (error) {
            // console.error('Logout failed', error);
        }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setEncryptionKey(null); // Clear key from memory
        navigate('/', { state: { logoutReason: reason } });
    }, [navigate]);

    const lock = useCallback(() => {
        setEncryptionKey(null);
    }, []);

    useEffect(() => {
        if (!token) return;

        // 10 minutes inactivity lock
        const INACTIVITY_TIME = 10 * 60 * 1000;
        let timeoutId;

        const handleInactivity = () => {
            // If we are already locked (no key), no need to lock again, 
            // but we might want to logout if even more time passes? 
            // For now, requirement is just auto-lock on inactivity.
            if (encryptionKey) {
                lock();
            }
        };

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (encryptionKey) {
                timeoutId = setTimeout(handleInactivity, INACTIVITY_TIME);
            }
        };

        // Reset timer on these events
        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        const handleActivity = () => {
            resetTimer();
        };

        resetTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [token, encryptionKey, lock]);

    const login = async (email, password) => {
        try {
            // 1. Derive Password (Hash) for Login
            const passwordForLogin = await deriveEncryptionKey(password); // Using renamed function

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password: passwordForLogin })
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

            // 2. Validate and Store JWT
            if (data.token && data.token.split('.').length === 3) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
            } else {
                throw new Error("Invalid token received from server");
            }

            setUser(data.user);
            setIsAuthenticated(true);

            // 3. Attempt to Derive Encryption Key (for Decryption)
            if (data.user.kdfSalt && data.user.validatorHash) {
                const key = await unlockFn(password, data.user);
                if (!key) {
                    // If for some reason unlockFn returns false/null but didn't throw (though it should throw),
                    // we treat it as a failure to fully login.
                    throw new Error("Failed to derive encryption key.");
                }
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

            setEncryptionKey(mk); // Store ONLY in state
            return mk; // Return the key so login can verify it
        } catch (e) {
            console.error("Unlock failed");
            throw new Error(e.message || "Failed to unlock diary.");
        }
    };

    const logout = (reason) => {
        handleLogout(reason);
    };

    const contextValue = React.useMemo(() => ({
        user,
        isAuthenticated,
        token,
        encryptionKey, // Expose renamed key
        loading,
        login,
        logout,
        unlock,
        lock,
        isUnlocked: !!encryptionKey,
    }), [user, isAuthenticated, token, encryptionKey, loading, login, logout, unlock, lock]);

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
