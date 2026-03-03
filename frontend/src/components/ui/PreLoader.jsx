import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

// Defined outside component so it's stable and never changes between renders
const FULL_TEXT = 'Digital Diary';

const PreLoader = ({ onComplete }) => {
    const [typedText, setTypedText] = useState('');
    const [isExiting, setIsExiting] = useState(false);
    const isDoneTyping = typedText.length === FULL_TEXT.length;

    // Read theme synchronously from localStorage to avoid any flash
    const isDark = useMemo(() => {
        try {
            return (localStorage.getItem('theme') || 'dark') === 'dark';
        } catch {
            return true;
        }
    }, []);

    // Theme-matched colors
    const colors = isDark
        ? {
            bg: '#0D0D1A',
            glowOrb: 'rgba(201, 149, 106, 0.08)',
            primary: '#C9956A',
            text: '#F0E6D3',
            subtext: 'rgba(240, 230, 211, 0.6)',
            particle: 'rgba(201, 149, 106, 0.4)',
        }
        : {
            bg: '#FAF3E8',
            glowOrb: 'rgba(123, 63, 32, 0.07)',
            primary: '#7B3F20',
            text: '#1E0F00',
            subtext: 'rgba(30, 15, 0, 0.55)',
            particle: 'rgba(123, 63, 32, 0.25)',
        };

    // Type one character every 100ms until the full text is shown
    useEffect(() => {
        if (typedText.length >= FULL_TEXT.length) return;
        const timeout = setTimeout(() => {
            setTypedText(FULL_TEXT.slice(0, typedText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
    }, [typedText]);  // FULL_TEXT is module-level constant, no need in deps

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onComplete(), 700);
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    // Generate particles once so they don't re-randomise on each render
    const particles = useMemo(() =>
        Array.from({ length: 18 }, (_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth - window.innerWidth / 2,
            y: Math.random() * window.innerHeight - window.innerHeight / 2,
            floatY: Math.random() * -180,
            duration: Math.random() * 2 + 2.5,
            delay: Math.random() * 2,
            scale: Math.random() * 1.5 + 0.8,
        })), []);

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
                    style={{ backgroundColor: colors.bg }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                >
                    {/* Floating particles — theme-aware */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute w-2 h-2 rounded-full pointer-events-none"
                            style={{ background: colors.particle }}
                            initial={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
                            animate={{
                                y: [p.y, p.y + p.floatY],
                                opacity: [0, 0.8, 0],
                                scale: [0, p.scale, 0],
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                delay: p.delay,
                            }}
                        />
                    ))}

                    {/* Soft radial glow blob — no more dark circle */}
                    <motion.div
                        className="absolute rounded-full pointer-events-none blur-3xl"
                        style={{ background: `radial-gradient(circle, ${colors.glowOrb}, transparent 70%)` }}
                        initial={{ width: 0, height: 0, opacity: 0 }}
                        animate={{ width: '90vw', height: '90vw', opacity: 1 }}
                        transition={{ duration: 2.5, ease: 'easeOut' }}
                    />

                    {/* Main content */}
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.75, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                        >
                            <BookOpen
                                className="w-16 h-16 mb-6"
                                style={{ color: colors.primary }}
                            />
                        </motion.div>

                        <h1
                            className="text-4xl md:text-5xl font-bold tracking-wider mb-3 flex items-center"
                            style={{ color: colors.text }}
                        >
                            {typedText}
                            {/* Cursor blinks while typing, disappears once done */}
                            {!isDoneTyping && (
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.75 }}
                                    className="inline-block w-[3px] h-10 ml-1"
                                    style={{ background: colors.primary }}
                                />
                            )}
                        </h1>

                        <motion.p
                            className="tracking-widest text-sm uppercase"
                            style={{ color: colors.subtext }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                        >
                            Your thoughts. Your privacy.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PreLoader;
