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
                className="fixed top-24 right-4 z-[60] glass text-theme-text px-6 py-4 rounded-xl flex items-center shadow-theme overflow-hidden min-w-[300px] border-l-4"
                style={{ borderLeftColor: 'var(--color-danger)' }}
            >
                <div className="absolute inset-0 bg-[var(--color-danger)] opacity-[0.08]" />

                <div className="relative flex items-center space-x-3 w-full">
                    <div className="flex-shrink-0 flex items-center justify-center p-2 rounded-full bg-[var(--color-page-bg)] border border-theme-border shadow-sm">
                        <AlertCircle className="w-5 h-5" style={{ color: 'var(--color-danger)' }} />
                    </div>
                    <span className="font-medium text-[15px] tracking-wide">{message}</span>
                </div>
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-[3px]"
                    style={{ backgroundColor: 'var(--color-danger)' }}
                />
            </motion.div>
        </AnimatePresence>
    );
};

export default FailureAnimation;
