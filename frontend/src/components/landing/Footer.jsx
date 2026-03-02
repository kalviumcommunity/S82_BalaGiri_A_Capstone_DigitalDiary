import React from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <footer
            className="py-12 relative overflow-hidden"
            style={{
                background: isDark ? '#080810' : '#EDE0CC',
                borderTop: isDark ? '1px solid #2E2940' : '1px solid #E8D9C5'
            }}
        >
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="text-2xl font-bold mb-2">
                            <span style={{ color: isDark ? '#C9956A' : '#7B3F20' }}>Digital</span>
                            <span style={{ color: 'var(--text-primary)' }}> Diary</span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            Your memories. Your encryption. Your sanctuary.
                        </p>
                    </div>

                    <div className="flex items-center space-x-6 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        <a href="/features" className="hover:text-[var(--color-primary)] transition-colors">Features</a>
                        <a href="/about" className="hover:text-[var(--color-primary)] transition-colors">About</a>
                        <a href="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact</a>
                    </div>

                    <div className="flex items-center">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="mt-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    <p>© 2025 Digital Diary — Privacy by Design</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
