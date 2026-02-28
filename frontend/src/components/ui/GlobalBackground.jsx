import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Particles = ({ isDark }) => {
    const particles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => {
            const size = Math.random() * 3 + 3; // 3px to 6px
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const duration = Math.random() * 6 + 6; // 6s to 12s
            const delay = Math.random() * 5; // 0s to 5s
            const isGold = Math.random() > 0.5;

            let background;
            if (isDark) {
                background = isGold ? 'rgba(201,149,106,0.5)' : 'rgba(123,94,167,0.4)';
            } else {
                background = 'rgba(123,63,32,0.25)';
            }

            return (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${left}%`,
                        top: `${top}%`,
                        background,
                        animation: `${isDark ? 'floatUp' : 'floatDown'} ${duration}s infinite ease-in-out`,
                        animationDelay: `${delay}s`,
                        willChange: 'transform',
                        transform: 'translateZ(0)'
                    }}
                />
            );
        });
    }, [isDark]);

    return <div className="absolute inset-0 overflow-hidden pointer-events-none">{particles}</div>;
};

const GlobalBackground = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}>
            {isDark ? (
                <>
                    <div className="absolute inset-0 bg-[#0D0D1A]" />

                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            top: '-10%', right: '-5%', width: '700px', height: '700px',
                            background: 'radial-gradient(circle, rgba(201,149,106,0.18) 0%, transparent 70%)',
                            animation: 'orbDrift1 18s ease-in-out infinite',
                            willChange: 'transform', transform: 'translateZ(0)'
                        }}
                    />

                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            bottom: '-15%', left: '-10%', width: '600px', height: '600px',
                            background: 'radial-gradient(circle, rgba(123,94,167,0.14) 0%, transparent 70%)',
                            animation: 'orbDrift2 24s ease-in-out infinite',
                            willChange: 'transform', transform: 'translateZ(0)'
                        }}
                    />

                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            top: '50%', left: '30%', width: '300px', height: '300px',
                            background: 'radial-gradient(circle, rgba(232,184,109,0.07) 0%, transparent 70%)',
                            animation: 'orbDrift3 14s ease-in-out infinite',
                            willChange: 'transform', transform: 'translateZ(0)'
                        }}
                    />

                    <Particles isDark={true} />
                </>
            ) : (
                <>
                    <div className="absolute inset-0 bg-[#FAF3E8]" />

                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            top: '-10%', right: '-5%', width: '700px', height: '700px',
                            background: 'radial-gradient(circle, rgba(196,134,42,0.10) 0%, transparent 70%)',
                            animation: 'orbDrift1 18s ease-in-out infinite',
                            willChange: 'transform', transform: 'translateZ(0)'
                        }}
                    />

                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            bottom: '-15%', left: '-10%', width: '600px', height: '600px',
                            background: 'radial-gradient(circle, rgba(212,144,122,0.09) 0%, transparent 70%)',
                            animation: 'orbDrift2 24s ease-in-out infinite',
                            willChange: 'transform', transform: 'translateZ(0)'
                        }}
                    />

                    <div className="absolute inset-0 paper-texture pointer-events-none" />

                    <Particles isDark={false} />
                </>
            )}
        </div>
    );
};

export default GlobalBackground;
