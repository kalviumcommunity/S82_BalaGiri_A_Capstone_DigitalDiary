import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Book } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full border-[3px] flex items-center justify-center bg-white dark:bg-[#1C1828] transition-transform hover:scale-105"
                style={{
                    borderColor: isDark ? '#C9956A' : '#7B3F20',
                    color: isDark ? '#C9956A' : '#7B3F20'
                }}
            >
                <User className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl z-50 overflow-hidden border backdrop-blur-xl"
                        style={{
                            background: isDark ? 'rgba(28, 24, 40, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                            borderColor: isDark ? '#2E2940' : '#E8D9C5'
                        }}
                    >
                        <div className="p-5 border-b" style={{ borderColor: isDark ? '#2E2940' : '#E8D9C5' }}>
                            <p className="font-bold text-lg truncate" style={{ color: 'var(--text-primary)' }}>
                                {user?.name || 'My Account'}
                            </p>
                            <p className="text-sm opacity-70 truncate" style={{ color: 'var(--text-muted)' }}>
                                {user?.email}
                            </p>
                        </div>
                        <div className="p-3 space-y-1">
                            <button
                                onClick={() => { setIsOpen(false); navigate('/diary'); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-colors"
                                style={{ color: 'var(--text-primary)' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.05)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Book className="w-5 h-5" style={{ color: isDark ? '#C9956A' : '#7B3F20' }} />
                                My Entries
                            </button>
                            <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl" style={{ color: 'var(--text-primary)' }}>
                                <span className="text-sm font-medium">Appearance</span>
                                <ThemeToggle />
                            </div>
                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-colors"
                                style={{ color: 'var(--text-primary)' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.05)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Settings className="w-5 h-5" style={{ color: isDark ? '#C9956A' : '#7B3F20' }} />
                                Settings
                            </button>
                            <div className="h-px w-full my-2" style={{ background: isDark ? '#2E2940' : '#E8D9C5' }} />
                            <button
                                onClick={() => { setIsOpen(false); logout(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileMenu;
