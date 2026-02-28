import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-[#FFF8F0] dark:bg-[#13111C] border border-[#E8D9C5] dark:border-[#2E2940] shadow-sm hover:shadow-[0_0_15px_var(--color-primary)] transition-shadow duration-300 relative overflow-hidden"
            aria-label="Toggle Theme"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="relative w-6 h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {theme === 'light' ? (
                        <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute"
                        >
                            <Moon className="w-5 h-5 text-[#5C3A8C]" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute"
                        >
                            <Sun className="w-5 h-5 text-[#E8B86D]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
};

export default ThemeToggle;
