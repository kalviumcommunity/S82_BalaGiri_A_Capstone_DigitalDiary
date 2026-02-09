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
                className="bg-[#1e293b] p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-white/10 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-cyan-500/20">
                    <Lock className="w-8 h-8 text-cyan-400" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Diary Locked</h2>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                    Your entries are end-to-end encrypted for your privacy. Please enter your password to unlock them.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all text-center text-lg tracking-widest"
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
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
