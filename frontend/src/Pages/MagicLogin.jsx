import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Loader } from 'lucide-react';

const MagicLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // States
    const [status, setStatus] = useState('Verifying Magic Link...');
    const [stage, setStage] = useState('verifying'); // 'verifying', 'unlocking', 'error'
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    const { magicLoginSuccess, unlock, isUnlocked } = useAuth();

    useEffect(() => {
        // If already unlocked in this active session memory, skip derivation!
        if (isUnlocked) {
            navigate('/diary');
            return;
        }

        const token = searchParams.get('token');
        if (!token) {
            setStatus("No magic token provided.");
            setStage('error');
            return;
        }

        const verifyMagicLogin = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/magic-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();

                if (res.ok && data.token && data.user) {
                    // Receive JWT, Store JWT (handled by magicLoginSuccess)
                    magicLoginSuccess(data.token, data.user);
                    setStatus("Login successful!");
                    setStage('unlocking'); // Move to derivation stage
                } else {
                    setStatus(data.message || "Verification failed");
                    setStage('error');
                }
            } catch (err) {
                console.error("Magic Login Error:", err);
                setStatus("Something went wrong verifying the link");
                setStage('error');
            }
        };

        if (stage === 'verifying') {
            verifyMagicLogin();
        }
    }, [searchParams, stage, magicLoginSuccess]);

    const handleUnlockSubmit = async (e) => {
        e.preventDefault();
        setIsUnlocking(true);
        setErrorMsg('');

        try {
            await unlock(password);
            // After derivation, navigate to /diary
            navigate('/diary');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to unlock diary');
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4">
            <div className="bg-[#1C1828]/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] text-center max-w-md w-full border border-[#2E2940] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#C9956A]" />

                {stage === 'verifying' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-2xl font-bold text-[#F0E6D3] mb-6 animate-pulse">{status}</h2>
                        <div className="flex justify-center">
                            <div className="w-12 h-12 border-4 border-white/10 border-t-[#C9956A] rounded-full animate-spin"></div>
                        </div>
                    </motion.div>
                )}

                {stage === 'error' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
                        <p className="text-[#9B8EA0] mb-6">{status}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 rounded-xl bg-[#C9956A] text-[#0D0D1A] font-bold shadow hover:bg-[#E8B86D] transition-all"
                        >
                            Back to Home
                        </button>
                    </motion.div>
                )}

                {stage === 'unlocking' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="w-16 h-16 bg-[#C9956A]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-[#C9956A]/20">
                            <Lock className="w-8 h-8 text-[#C9956A]" />
                        </div>

                        <h2 className="text-2xl font-bold text-[#F0E6D3] mb-2">{status}</h2>
                        <p className="text-[#9B8EA0] mb-8 text-sm leading-relaxed">
                            To view your end-to-end encrypted notes, please enter your diary password to derive the encryption key securely.
                        </p>

                        <form onSubmit={handleUnlockSubmit} className="space-y-4">
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-xl bg-[#13111C] border border-[#2E2940] text-[#F0E6D3] placeholder:text-[#6B6070] focus:outline-none focus:ring-1 focus:ring-[#C9956A] focus:border-[#C9956A] transition-all text-center text-lg tracking-widest"
                                autoFocus
                            />

                            {errorMsg && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-sm bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                                >
                                    {errorMsg}
                                </motion.p>
                            )}

                            <button
                                type="submit"
                                disabled={!password || isUnlocking}
                                className="w-full py-3.5 rounded-xl bg-[#C9956A] text-[#0D0D1A] font-bold text-lg shadow-[0_4px_20px_rgba(201,149,106,0.35)] hover:bg-[#E8B86D] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {isUnlocking ? (
                                    <>
                                        <Loader className="animate-spin w-5 h-5" />
                                        <span>Unlock...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        <span>Unlock Diary</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MagicLogin;
