import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Shield, Lock, Cloud, BookHeart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useMouseParallax } from '../../hooks/useMouseParallax';

const Hero = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isUnlocked } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const parallaxOffset = useMouseParallax(0.02);

    const titleWords1 = "Your thoughts.".split(' ');
    const titleWords2 = "Sacred. Encrypted.".split(' ');
    const titleWords3 = "Forever yours.".split(' ');

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
        },
    };

    const child = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", damping: 12, stiffness: 100 },
        },
    };

    return (
        <section className="relative min-h-screen flex items-center pt-20 pb-12 bg-transparent text-[var(--text-primary)]">
            <div className="w-full max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Text Content */}
                <div className="flex flex-col items-start space-y-8 max-w-xl mx-auto lg:mx-0">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="visible"
                        className="text-6xl lg:text-8xl font-black leading-tight tracking-tight flex flex-col"
                        style={{ x: parallaxOffset.x, y: parallaxOffset.y }}
                    >
                        <div className="flex flex-wrap overflow-hidden pb-1">
                            {titleWords1.map((word, index) => (
                                <motion.span variants={child} key={`1-${index}`} className="mr-3">{word}</motion.span>
                            ))}
                        </div>
                        <div className="flex flex-wrap overflow-hidden pb-1 text-[var(--color-primary)]">
                            {titleWords2.map((word, index) => (
                                <motion.span variants={child} key={`2-${index}`} className="mr-3">{word}</motion.span>
                            ))}
                        </div>
                        <div className="flex flex-wrap overflow-hidden pb-1">
                            {titleWords3.map((word, index) => (
                                <motion.span variants={child} key={`3-${index}`} className="mr-3">{word}</motion.span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="text-lg md:text-xl text-[var(--text-muted)] max-w-lg leading-relaxed"
                    >
                        Not a note app. Not a cloud drive. A private sanctuary — where your memories are sealed with military-grade encryption before they ever leave your hands. Only you hold the key.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                if (isAuthenticated && isUnlocked) {
                                    navigate('/diary');
                                } else {
                                    navigate('/', { state: { openLogin: true } });
                                }
                            }}
                        >
                            Begin Writing →
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-full sm:w-auto px-8"
                            onClick={() => {
                                const element = document.getElementById('how-it-works');
                                element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            See How It Works
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.8, duration: 0.8 }}
                        className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)] font-medium pt-4"
                    >
                        <span className="flex items-center bg-[var(--color-border)] px-3 py-1.5 rounded-full"><Lock className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> AES-256 Encrypted</span>
                        <span className="flex items-center bg-[var(--color-border)] px-3 py-1.5 rounded-full"><Shield className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> Zero-Knowledge</span>
                        <span className="flex items-center bg-[var(--color-border)] px-3 py-1.5 rounded-full"><Cloud className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> Cloud Synced</span>
                    </motion.div>
                </div>

                {/* Right Illustration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 100 }}
                    className="relative flex justify-center items-center w-full"
                >
                    {/* Glowing background behind the book (pulse animation defined in index.css diaryGlow for dark mode but we use it via inline style or class) */}
                    <div className="absolute w-80 h-80 z-0 bg-transparent" />

                    {/* Main Book Graphic */}
                    <div
                        className="relative z-10 w-72 h-96 flex "
                        style={{
                            background: isDark
                                ? 'linear-gradient(145deg, #1C1828, #13111C)'
                                : 'linear-gradient(145deg, #EDD5B5, #DFC49A)', // Darker cream gradient for light mode visibility
                            border: isDark ? '2px solid #C9956A' : '2px solid #A0622A',
                            boxShadow: isDark
                                ? '0 0 40px rgba(201,149,106,0.2), 0 0 80px rgba(201,149,106,0.08), 8px 8px 32px rgba(0,0,0,0.5)'
                                : '12px 12px 40px rgba(100,50,20,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
                            borderRadius: '12px',
                            animation: isDark ? 'diaryGlow 3s ease-in-out infinite' : 'none'
                        }}
                    >
                        {/* Spine */}
                        <div
                            className="h-full rounded-l-[10px]"
                            style={{
                                background: isDark ? 'linear-gradient(180deg, #C9956A, #7B5EA7)' : 'linear-gradient(180deg, #7B3F20, #5C2E14)',
                                width: '18px',
                                boxShadow: isDark ? '2px 0 8px rgba(0,0,0,0.8)' : '2px 0 8px rgba(123,63,32,0.4)',
                            }}
                        />

                        {/* Right side content */}
                        <div className="flex-1 flex flex-col justify-center items-center relative p-6">
                            <BookHeart
                                className="w-16 h-16 mb-8"
                                style={{
                                    color: isDark ? '#C9956A' : '#7B3F20',
                                    strokeWidth: 2.5
                                }}
                            />

                            {/* Ruled lines on card face */}
                            <div className="absolute top-[20%] right-0 left-[18px] flex flex-col items-center gap-3 w-full opacity-60 pointer-events-none">
                                <div style={{ background: isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.08)', height: '1px', width: '60%' }} />
                                <div style={{ background: isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.08)', height: '1px', width: '60%' }} />
                                <div style={{ background: isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.08)', height: '1px', width: '60%' }} />
                                <div style={{ background: isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.08)', height: '1px', width: '60%' }} />
                            </div>

                            {/* Glowing lock */}
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center relative mt-4 shadow-lg"
                                style={{
                                    border: isDark ? '2px solid #C9956A' : '2px solid #C4862A',
                                    background: isDark ? 'rgba(201,149,106,0.1)' : 'rgba(196,134,42,0.1)',
                                }}
                            >
                                <Lock
                                    className="w-6 h-6"
                                    style={{ color: isDark ? '#C9956A' : '#C4862A' }}
                                />
                            </div>
                        </div>

                        {/* Pages effect on the right edge */}
                        <div className="absolute right-0 top-3 bottom-3 w-[4px] rounded-r-md bg-white opacity-80" style={{ boxShadow: '-1px 0 2px rgba(0,0,0,0.1)' }} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
