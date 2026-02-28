import React from 'react';
import { motion } from 'framer-motion';
import { Key, EyeOff, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SecuritySection = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const badges = [
        {
            title: 'AES-256 Encryption',
            icon: Key,
            desc: 'Military-grade encryption applied client-side.',
        },
        {
            title: 'Zero-Knowledge',
            icon: EyeOff,
            desc: 'We never see your password or your thoughts.',
        },
        {
            title: 'JWT Authentication',
            icon: ShieldAlert,
            desc: 'Secure sessions and automated lockouts.',
        },
    ];

    return (
        <section
            className="py-24 relative"
            id="security"
            style={{
                background: isDark ? '#0D0D1A' : '#FAF3E8',
                borderTop: isDark ? '1px solid #2E2940' : '1px solid #E8D9C5'
            }}
        >
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">

                    {/* Left Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                            Your Privacy Is Non-Negotiable.
                        </h2>
                        <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            We built Digital Diary entirely around the principle that your thoughts belong to you, and only you. Every entry you type is mathematically locked with AES-256 before leaving your device. We couldn't read your diary even if we wanted to.
                        </p>
                        <div
                            className="h-1 w-24 opacity-50 rounded"
                            style={{ background: isDark ? '#C9956A' : '#7B3F20' }}
                        />
                    </motion.div>

                    {/* Right Badges */}
                    <div className="lg:w-1/2 flex flex-col sm:grid sm:grid-cols-2 gap-6 relative">
                        {badges.map((badge, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ type: "spring", stiffness: 150, damping: 12, delay: index * 0.15 }}
                                className={`relative z-10 w-full ${index === 2 ? 'sm:col-span-2 sm:w-1/2 sm:justify-self-center' : ''}`}
                            >
                                <motion.div
                                    animate={{
                                        boxShadow: isDark
                                            ? ['0 0 10px rgba(201,149,106,0.05)', '0 0 25px rgba(201,149,106,0.15)', '0 0 10px rgba(201,149,106,0.05)']
                                            : ['0 0 10px rgba(123,63,32,0.05)', '0 0 25px rgba(123,63,32,0.15)', '0 0 10px rgba(123,63,32,0.05)']
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                                    className="p-6 h-full flex flex-col justify-center border rounded-2xl backdrop-blur-sm"
                                    style={{
                                        background: isDark ? '#13111C' : '#FFFFFF',
                                        borderColor: isDark ? '#2E2940' : '#E8D9C5',
                                    }}
                                >
                                    <div className="flex items-center space-x-4 mb-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{
                                                background: isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.08)',
                                                color: isDark ? '#C9956A' : '#7B3F20'
                                            }}
                                        >
                                            <badge.icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {badge.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{badge.desc}</p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SecuritySection;
