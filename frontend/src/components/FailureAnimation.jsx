import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const FailureAnimation = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-24 right-4 z-[60] bg-[#0f172a]/60 backdrop-blur-2xl border border-red-500/30 text-white px-8 py-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(239,68,68,0.3)] flex items-center space-x-4 overflow-hidden"
            >
                <div className="absolute inset-0 bg-red-500/10" />
                <div className="relative flex items-center space-x-3">
                    <div className="bg-red-500/20 p-2 rounded-full">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="font-semibold text-lg tracking-wide">{message}</span>
                </div>
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1 bg-red-400/50"
                />
            </motion.div>
        </AnimatePresence>
    );
};

export default FailureAnimation;
