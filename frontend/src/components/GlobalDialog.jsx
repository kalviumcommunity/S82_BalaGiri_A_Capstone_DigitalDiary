import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { useDialog } from '../context/DialogContext';

const GlobalDialog = ({ isDark }) => {
    const { dialogState, closeDialog } = useDialog();
    const { isOpen, type, message, defaultValue } = dialogState;
    const [inputValue, setInputValue] = useState(defaultValue || '');
    const inputRef = useRef(null);

    // Reset input value when dialog opens
    useEffect(() => {
        if (isOpen && type === 'prompt') {
            setInputValue(defaultValue || '');
            // Focus input after animation
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, type, defaultValue]);

    // Handle Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirm();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, inputValue]); // Depend on inputValue to ensure current state is captured

    const handleConfirm = () => {
        if (type === 'prompt') {
            closeDialog(inputValue);
        } else if (type === 'confirm') {
            closeDialog(true);
        } else {
            closeDialog(true); // Alert
        }
    };

    const handleCancel = () => {
        if (type === 'prompt') {
            closeDialog(null);
        } else if (type === 'confirm') {
            closeDialog(false);
        } else {
            closeDialog(true); // Alert can only be dismissed (effectively OK)
        }
    };

    // Theme Variables
    const overlayBg = 'bg-black/60 backdrop-blur-sm';
    const modalBg = isDark ? 'bg-[#1e293b]' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-slate-800';
    const subtextColor = isDark ? 'text-slate-300' : 'text-slate-600';
    const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
    const inputBg = isDark ? 'bg-black/30' : 'bg-slate-100';

    // Button Styles
    const btnPrimary = 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25';
    const btnSecondary = isDark
        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200';

    // Icons based on type
    const getIcon = () => {
        if (type === 'confirm') return <HelpCircle className="w-8 h-8 text-cyan-400" />;
        if (type === 'prompt') return <CheckCircle className="w-8 h-8 text-cyan-400" />; // Or specific icon
        return <AlertCircle className="w-8 h-8 text-cyan-400" />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${overlayBg}`}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className={`${modalBg} rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl border ${borderColor} relative overflow-hidden`}
                    >
                        {/* Decorative gradient glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none`} />

                        <div className="flex flex-col items-center text-center">
                            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'} border ${borderColor}`}>
                                {getIcon()}
                            </div>

                            <h3 className={`text-xl font-bold mb-2 ${textColor} tracking-tight`}>
                                {type === 'confirm' ? 'Confirmation' : type === 'prompt' ? 'Input Required' : 'Notice'}
                            </h3>

                            <p className={`${subtextColor} mb-6 leading-relaxed`}>
                                {message}
                            </p>

                            {type === 'prompt' && (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl mb-6 ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
                                />
                            )}

                            <div className="flex gap-3 w-full">
                                {(type === 'confirm' || type === 'prompt') && (
                                    <button
                                        onClick={handleCancel}
                                        className={`flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 ${btnSecondary}`}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 py-2.5 rounded-xl font-bold transition-all duration-200 ${btnPrimary}`}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GlobalDialog;
