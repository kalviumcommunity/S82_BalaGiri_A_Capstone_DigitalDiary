import React from 'react';
import { motion } from 'framer-motion';
import { Lock, PenTool, Cloud } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const HowItWorks = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const steps = [
        {
            icon: Lock,
            title: "Create Your Vault",
            desc: "Sign up and your password becomes your encryption key. We derive it. We never store it.",
        },
        {
            icon: PenTool,
            title: "Write Without Fear",
            desc: "Every entry encrypts instantly on your device. What you write stays truly private.",
        },
        {
            icon: Cloud,
            title: "Access Anywhere, Always Safely",
            desc: "Your encrypted diary follows you across devices. Auto-lock keeps it sealed when you step away.",
        }
    ];

    return (
        <section
            id="how-it-works"
            className="py-24 relative overflow-hidden"
            style={{
                background: 'var(--color-page-bg)',
                borderTop: '1px solid var(--color-border)'
            }}
        >
            <div className="container mx-auto px-6 max-w-lg md:max-w-4xl relative z-10">
                <div className="text-center mb-20 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)]"
                    >
                        Three Steps to Your Sanctuary
                    </motion.h2>
                </div>

                <div className="relative flex flex-col items-center">
                    {/* Connecting Vertical Line using framer-motion since animation-timeline has spotty support but user asked for CSS scroll-driven. We'll use whileInView drawing */}
                    <motion.div
                        className="absolute left-[36px] md:left-1/2 top-0 bottom-0 w-[2px] -ml-[1px]"
                        style={{
                            background: isDark ? 'linear-gradient(to bottom, #C9956A 0%, #7B5EA7 100%)' : 'linear-gradient(to bottom, #7B3F20 0%, #5C3A8C 100%)',
                            transformOrigin: 'top'
                        }}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true, margin: "-50%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    <div className="flex flex-col gap-16 md:gap-24 w-full">
                        {steps.map((step, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <div key={index} className={`relative flex items-center w-full ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                                    {/* Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ type: "spring", stiffness: 200, damping: 12, delay: index * 0.2 }}
                                        className="absolute left-0 md:left-1/2 w-16 h-16 md:-ml-8 rounded-full border-[3px] flex items-center justify-center z-10 bg-[var(--color-card-bg)]"
                                        style={{ borderColor: isDark ? '#C9956A' : '#7B3F20' }}
                                    >
                                        <step.icon className="w-6 h-6" style={{ color: isDark ? '#C9956A' : '#7B3F20' }} />
                                    </motion.div>

                                    {/* Content Card */}
                                    <motion.div
                                        initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                                        className={`w-full md:w-1/2 pl-24 md:pl-0 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}
                                    >
                                        <div className="p-8 rounded-2xl shadow-sm border backdrop-blur-sm"
                                            style={{
                                                background: isDark ? '#1C1828' : '#FFFFFF',
                                                borderColor: isDark ? '#2E2940' : '#E8D9C5',
                                            }}
                                        >
                                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-[var(--text-muted)] leading-relaxed text-base">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
