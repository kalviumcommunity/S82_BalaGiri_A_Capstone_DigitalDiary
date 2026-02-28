import React, { useState } from 'react';
import { Lock, Unlock, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const UnlockModal = ({ onUnlock, error, isUnlocking }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onUnlock(password);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#1C1828] p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] max-w-md w-full mx-4 border border-[#2E2940] text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#C9956A]" />

                <div className="w-16 h-16 bg-[#C9956A]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-[#C9956A]/20">
                    <Lock className="w-8 h-8 text-[#C9956A]" />
                </div>

                <h2 className="text-2xl font-bold text-[#F0E6D3] mb-2">Diary Locked</h2>
                <p className="text-[#9B8EA0] mb-8 text-sm leading-relaxed">
                    Your entries are end-to-end encrypted for your privacy. Please enter your password to unlock them.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-[#13111C] border border-[#2E2940] text-[#F0E6D3] placeholder:text-[#6B6070] focus:outline-none focus:ring-1 focus:ring-[#C9956A] focus:border-[#C9956A] transition-all text-center text-lg tracking-widest"
                        autoFocus
                    />

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                        >
                            {error}
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
                                <span>Unlocking...</span>
                            </>
                        ) : (
                            <>
                                <Unlock className="w-5 h-5" />
                                <span>Unlock Diary</span>
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default UnlockModal;
