import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { Shield, Lock, Cloud, BookHeart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_FLIP_INTERVAL = 220;    // ms between each page flip
const OPEN_PAUSE = 1000;   // ms to stay open before auto-close
const FLIP_DURATION = 0.6;    // framer-motion spring duration (s)

const PAGES = [
    { id: 1, heading: 'Dear Diary...', lines: 11 },
    { id: 2, heading: 'March 2025', lines: 11 },
    { id: 3, heading: 'My Thoughts', lines: 11 },
    { id: 4, heading: 'Things I Love ♥', lines: 11 },
];

const Page = ({ page, index, flipped, total }) => (
    <motion.div
        animate={{ rotateY: flipped ? -178 : 0 }}
        transition={{
            duration: FLIP_DURATION,
            ease: [0.25, 0.8, 0.25, 1],
        }}
        style={{
            position: 'absolute',
            top: '8px', bottom: '8px', left: '16px', right: '8px',
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            zIndex: total - index,
        }}
    >
        <div style={{
            position: 'absolute', inset: 0,
            background: index % 2 === 0 ? '#FBF5E6' : '#FFF8EE',
            borderRadius: '3px 8px 8px 3px',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
            boxShadow: '-3px 0 14px rgba(0,0,0,0.25), 2px 0 4px rgba(0,0,0,0.08)',
            padding: '24px 20px 18px 20px',
            display: 'flex', flexDirection: 'column', gap: '9px',
        }}>
            <p style={{
                color: '#7B3F20', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: '6px',
            }}>
                {page.heading}
            </p>
            {Array.from({ length: page.lines }, (_, i) => (
                <div key={i} style={{
                    height: '1px',
                    background: 'rgba(123,63,32,0.18)',
                    width: i % 5 === 4 ? '55%' : '100%',
                }} />
            ))}
        </div>

        <div style={{
            position: 'absolute', inset: 0,
            background: index % 2 === 0 ? '#FFF8EE' : '#FBF5E6',
            borderRadius: '8px 3px 3px 8px',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            overflow: 'hidden',
            padding: '24px 20px 18px 20px',
            display: 'flex', flexDirection: 'column', gap: '9px',
        }}>
            {Array.from({ length: 12 }, (_, i) => (
                <div key={i} style={{
                    height: '1px',
                    background: 'rgba(123,63,32,0.15)',
                    width: i % 4 === 3 ? '60%' : '100%',
                }} />
            ))}
        </div>
    </motion.div>
);

// phase: 'idle' | 'opening' | 'open' | 'closing'
const DiaryBook = ({ isDark }) => {
    const [phase, setPhase] = useState('idle');
    const [coverOpen, setCoverOpen] = useState(false);
    const [flippedCount, setFlippedCount] = useState(0);
    const cycleRef = useRef(null);

    const clearCycle = () => {
        if (cycleRef.current) clearTimeout(cycleRef.current);
    };

    const delay = (ms) => new Promise(res => { cycleRef.current = setTimeout(res, ms); });

    const runCycle = async () => {
        if (phase !== 'idle') return;

        setPhase('opening');

        // 1. Cover opens first
        setCoverOpen(true);
        await delay(350);

        // 2. Pages flip one by one
        for (let i = 1; i <= PAGES.length; i++) {
            setFlippedCount(i);
            await delay(PAGE_FLIP_INTERVAL);
        }

        // 3. Pause so user can see the open book
        setPhase('open');
        await delay(OPEN_PAUSE);

        // 4. Auto close — pages flip BACK in reverse
        setPhase('closing');
        for (let i = PAGES.length - 1; i >= 0; i--) {
            setFlippedCount(i);
            await delay(PAGE_FLIP_INTERVAL);
        }

        // 5. Pause slightly then cover closes LAST
        await delay(250);
        setCoverOpen(false);
        await delay(700); // let cover animation finish

        setPhase('idle');
    };

    useEffect(() => () => clearCycle(), []);

    const c = isDark ? {
        cover: 'linear-gradient(160deg, #2A2045 0%, #1C1828 50%, #100E1A 100%)',
        coverSheen: 'linear-gradient(130deg, rgba(201,149,106,0.14) 0%, transparent 55%)',
        spine: 'linear-gradient(180deg, #C9956A 0%, #7B5EA7 100%)',
        border: '#C9956A',
        shadow: '20px 28px 65px rgba(0,0,0,0.8), 0 0 45px rgba(201,149,106,0.15), 5px 5px 0 rgba(0,0,0,0.5)',
        backPanel: '#090814',
        pageEdge: ['rgba(201,149,106,0.15)', 'rgba(201,149,106,0.09)', 'rgba(201,149,106,0.05)'],
        primary: '#C9956A',
        lockBg: 'rgba(201,149,106,0.15)',
        lockBorder: '#C9956A',
        groove: 'rgba(201,149,106,0.13)',
        groundGlow: 'radial-gradient(ellipse, rgba(201,149,106,0.45), transparent 70%)',
        hint: 'rgba(201,149,106,0.6)',
    } : {
        // Light theme — warm amber/honey tan, matches original design
        cover: 'linear-gradient(145deg, #EDD5B5, #DFC49A)',
        coverSheen: 'linear-gradient(130deg, rgba(255,255,255,0.10) 0%, transparent 50%)',
        spine: 'linear-gradient(180deg, #7B3F20 0%, #5C2E14 100%)',
        border: '#A0622A',
        shadow: '12px 18px 50px rgba(100,50,20,0.3), 0 4px 0 rgba(80,30,10,0.2), inset 0 1px 0 rgba(255,255,255,0.35)',
        backPanel: '#C9A87A',
        pageEdge: ['rgba(180,130,80,0.55)', 'rgba(180,130,80,0.35)', 'rgba(180,130,80,0.18)'],
        primary: '#7B3F20',
        lockBg: 'rgba(123,63,32,0.1)',
        lockBorder: '#7B3F20',
        groove: 'rgba(123,63,32,0.12)',
        groundGlow: 'radial-gradient(ellipse, rgba(100,50,20,0.28), transparent 70%)',
        hint: 'rgba(107,45,14,0.5)',
    };


    return (
        <div
            className="diary-float"
            style={{ display: 'inline-block' }}
        >
            <div
                onClick={runCycle}
                style={{
                    position: 'relative',
                    width: '290px', height: '390px',
                    perspective: '1400px',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    userSelect: 'none',
                }}
            >
                <motion.div
                    animate={{ opacity: coverOpen ? 0.65 : 0.35, scaleX: coverOpen ? 1.2 : 1 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        position: 'absolute', bottom: '-26px',
                        left: '50%', transform: 'translateX(-50%)',
                        width: '210px', height: '28px',
                        borderRadius: '50%',
                        background: c.groundGlow,
                        filter: 'blur(10px)',
                        pointerEvents: 'none',
                    }}
                />

                <div style={{
                    position: 'absolute',
                    top: '10px', left: '8px',
                    width: '262px', height: '374px',
                    background: c.backPanel,
                    borderRadius: '13px',
                    zIndex: 0,
                }} />

                {c.pageEdge.map((bg, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        right: `${-1 - i * 2}px`,
                        top: '10px', bottom: '10px',
                        width: '7px',
                        background: bg,
                        borderRadius: '0 4px 4px 0',
                        zIndex: 1,
                    }} />
                ))}

                <div style={{
                    position: 'absolute', inset: 0,
                    zIndex: 2,
                    transformStyle: 'preserve-3d',
                }}>
                    {PAGES.map((page, index) => (
                        <Page
                            key={page.id}
                            page={page}
                            index={index}
                            flipped={index < flippedCount}
                            total={PAGES.length}
                        />
                    ))}
                </div>

                <motion.div
                    animate={{ rotateY: coverOpen ? -178 : 0 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        position: 'absolute', inset: 0,
                        transformOrigin: 'left center',
                        transformStyle: 'preserve-3d',
                        zIndex: 20,
                    }}
                >
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: c.cover,
                        border: `2px solid ${c.border}`,
                        borderRadius: '12px',
                        backfaceVisibility: 'hidden',
                        boxShadow: c.shadow,
                        overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', inset: 0, background: c.coverSheen, pointerEvents: 'none' }} />

                        <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0, width: '22px',
                            background: c.spine,
                            borderRadius: '10px 0 0 10px',
                            boxShadow: '3px 0 14px rgba(0,0,0,0.5)',
                            zIndex: 2,
                        }} />

                        <div style={{
                            position: 'absolute',
                            left: '22px', right: 0, top: 0, bottom: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '24px 18px',
                            gap: '18px',
                        }}>
                            <div style={{ position: 'absolute', top: '14%', left: '12%', right: '12%', display: 'flex', flexDirection: 'column', gap: '11px', opacity: 0.55 }}>
                                {[...Array(3)].map((_, i) => <div key={i} style={{ height: '1px', background: c.groove }} />)}
                            </div>

                            <BookHeart style={{
                                width: '60px', height: '60px', color: c.primary, strokeWidth: 2.2,
                                filter: isDark
                                    ? 'drop-shadow(0 0 12px rgba(201,149,106,0.5))'
                                    : 'drop-shadow(0 3px 8px rgba(0,0,0,0.35))',
                            }} />

                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%',
                                border: `2px solid ${c.lockBorder}`,
                                background: c.lockBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isDark
                                    ? '0 4px 18px rgba(201,149,106,0.3)'
                                    : '0 4px 14px rgba(0,0,0,0.3)',
                            }}>
                                <Lock style={{ width: '22px', height: '22px', color: c.primary }} />
                            </div>

                            <div style={{ position: 'absolute', bottom: '14%', left: '12%', right: '12%', display: 'flex', flexDirection: 'column', gap: '11px', opacity: 0.55 }}>
                                {[...Array(2)].map((_, i) => <div key={i} style={{ height: '1px', background: c.groove }} />)}
                            </div>

                            <div style={{
                                position: 'absolute', right: 0, top: '10px', bottom: '10px', width: '5px',
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(160,98,42,0.3)',
                                borderRadius: '0 3px 3px 0',
                            }} />
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute', inset: 0,
                        background: '#F8EDD8',
                        borderRadius: '12px',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        overflow: 'hidden',
                        padding: '24px 20px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                    }}>
                        {Array.from({ length: 13 }, (_, i) => (
                            <div key={i} style={{ height: '1px', background: 'rgba(123,63,32,0.13)', width: i % 4 === 3 ? '58%' : '100%' }} />
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {phase === 'idle' && (
                        <motion.p key="hint"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            style={{
                                position: 'absolute',
                                bottom: '-46px', left: '50%', transform: 'translateX(-50%)',
                                whiteSpace: 'nowrap', color: c.hint,
                                fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
                                pointerEvents: 'none',
                            }}
                        >
                            ↑ Click to open
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Hero = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isUnlocked } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 },
        },
    };

    const wordVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    };

    const titleLine1 = 'Your thoughts.'.split(' ');
    const titleLine2 = 'Sacred. Encrypted.'.split(' ');
    const titleLine3 = 'Forever yours.'.split(' ');

    return (
        <section className="relative min-h-screen flex items-center pt-20 pb-12 bg-transparent text-[var(--text-primary)]">
            <div className="w-full max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                <div className="flex flex-col items-start space-y-8 max-w-xl mx-auto lg:mx-0">

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-6xl lg:text-8xl font-black leading-tight tracking-tight flex flex-col"
                    >
                        <div className="flex flex-wrap overflow-hidden pb-1">
                            {titleLine1.map((w, i) => (
                                <motion.span variants={wordVariants} key={`1-${i}`} className="mr-3">{w}</motion.span>
                            ))}
                        </div>
                        <div className="flex flex-wrap overflow-hidden pb-1 text-[var(--color-primary)]">
                            {titleLine2.map((w, i) => (
                                <motion.span variants={wordVariants} key={`2-${i}`} className="mr-3">{w}</motion.span>
                            ))}
                        </div>
                        <div className="flex flex-wrap overflow-hidden pb-1">
                            {titleLine3.map((w, i) => (
                                <motion.span variants={wordVariants} key={`3-${i}`} className="mr-3">{w}</motion.span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                        className="text-lg md:text-xl text-[var(--text-muted)] max-w-lg leading-relaxed"
                    >
                        Not a note app. Not a cloud drive. A private sanctuary — where your memories are sealed with military-grade encryption before they ever leave your hands. Only you hold the key.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
                        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
                    >
                        <motion.div
                            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(123,63,32,0.3)' }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            className="w-full sm:w-auto"
                        >
                            <Button variant="primary" size="lg" className="w-full"
                                onClick={() => {
                                    if (isAuthenticated && isUnlocked) navigate('/diary');
                                    else navigate('/', { state: { openLogin: true } });
                                }}>
                                Begin Writing →
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            className="w-full sm:w-auto"
                        >
                            <Button variant="secondary" size="lg" className="w-full px-8"
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                                See How It Works
                            </Button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2, duration: 0.5, ease: 'easeOut' }}
                        className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)] font-medium pt-4"
                    >
                        <span className="flex items-center bg-[var(--color-border)] px-3 py-1.5 rounded-full">
                            <Lock className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> AES-256 Encrypted
                        </span>
                        <span className="flex items-center bg-[var(--color-border)] px-3 py-1.5 rounded-full">
                            <Shield className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> Zero-Knowledge
                        </span>
                        <span className="flex items-center bg-[var(--color-border)] px-3 py-1.5 rounded-full">
                            <Cloud className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> Cloud Synced
                        </span>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.82, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6, type: 'spring', stiffness: 85 }}
                    className="relative flex justify-center items-center w-full"
                    style={{ paddingBottom: '72px' }}
                >
                    <DiaryBook isDark={isDark} />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
