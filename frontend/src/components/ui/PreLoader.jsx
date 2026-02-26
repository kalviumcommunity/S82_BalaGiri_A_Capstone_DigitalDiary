import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const PreLoader = ({ onComplete }) => {
    const [typedText, setTypedText] = useState('');
    const [isExiting, setIsExiting] = useState(false);
    const fullText = 'Digital Diary';

    useEffect(() => {
        let timeout;
        if (typedText.length < fullText.length) {
            timeout = setTimeout(() => {
                setTypedText(fullText.slice(0, typedText.length + 1));
            }, 100);
        }
        return () => clearTimeout(timeout);
    }, [typedText]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onComplete(), 800);
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-theme-bg overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                    {/* Particle effect using simple CSS/Framer motion */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-theme-primary/20"
                            initial={{
                                x: Math.random() * window.innerWidth - window.innerWidth / 2,
                                y: Math.random() * window.innerHeight - window.innerHeight / 2,
                                scale: 0,
                            }}
                            animate={{
                                y: [null, Math.random() * -200],
                                opacity: [0, 1, 0],
                                scale: [0, Math.random() * 2 + 1, 0],
                            }}
                            transition={{
                                duration: Math.random() * 2 + 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}

                    <motion.div
                        className="absolute rounded-full bg-theme-card opacity-30 blur-3xl pointer-events-none"
                        initial={{ width: 0, height: 0 }}
                        animate={{ width: '150vw', height: '150vw' }}
                        transition={{ duration: 3, ease: 'easeOut' }}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <BookOpen className="w-16 h-16 text-theme-primary mb-6 animate-pulse" />
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-bold text-theme-text tracking-wider mb-3 flex items-center">
                            {typedText}
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="inline-block w-[3px] h-10 ml-1 bg-theme-primary"
                            />
                        </h1>

                        <motion.p
                            className="text-theme-text opacity-70 tracking-widest text-sm uppercase"
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
