import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // For lerp
    const cursorX = useRef(0);
    const cursorY = useRef(0);
    const followerX = useRef(0);
    const followerY = useRef(0);

    const [cursorState, setCursorState] = useState('default'); // 'default', 'pointer', 'text', 'card'
    const [dots, setDots] = useState([]);

    useEffect(() => {
        const checkTouch = window.matchMedia('(pointer: coarse)').matches;
        setIsTouchDevice(checkTouch);

        if (checkTouch) return;

        const handleMouseMove = (e) => {
            cursorX.current = e.clientX;
            cursorY.current = e.clientY;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }

            // Spawn ink dots relatively sparsely
            if (Math.random() > 0.85) {
                const id = Date.now() + Math.random();
                setDots(prev => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
                setTimeout(() => {
                    setDots(prev => prev.filter(dot => dot.id !== id));
                }, 600);
            }
        };

        const updateFollower = () => {
            followerX.current += (cursorX.current - followerX.current) * 0.15; // lerp factor
            followerY.current += (cursorY.current - followerY.current) * 0.15;

            if (followerRef.current) {
                followerRef.current.style.transform = `translate3d(${followerX.current}px, ${followerY.current}px, 0)`;
            }
            requestAnimationFrame(updateFollower);
        };

        const handleMouseOver = (e) => {
            const isClickable = e.target.closest('button, a') || e.target.onclick != null || e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button';
            const isText = e.target.closest('input, textarea') || ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'].includes(e.target.tagName.toLowerCase());
            const isCard = e.target.closest('.card-hover');

            if (isCard) setCursorState('card');
            else if (isClickable) setCursorState('pointer');
            else if (isText) setCursorState('text');
            else setCursorState('default');
        };

        const reqId = requestAnimationFrame(updateFollower);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
            cancelAnimationFrame(reqId);
        };
    }, []);

    if (isTouchDevice) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* Dots trail */}
            {dots.map(dot => (
                <div
                    key={dot.id}
                    className="absolute w-1 h-1 rounded-full bg-[var(--color-primary)] opacity-40 transition-opacity duration-500 ease-out"
                    style={{
                        left: dot.x,
                        top: dot.y,
                        transform: 'translate(-50%, -50%)',
                        animation: 'fade-out 0.6s forwards'
                    }}
                />
            ))}

            {/* Follower ring */}
            <div
                ref={followerRef}
                className={`absolute left-0 top-0 w-10 h-10 rounded-full border border-[var(--color-primary)] transition-all duration-300 ease-out origin-center
                    ${cursorState === 'pointer' ? 'scale-150 border-[2px] shadow-[0_0_10px_var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10' : ''}
                    ${cursorState === 'text' ? 'scale-50 opacity-50 border-dashed' : ''}
                    ${cursorState === 'card' ? 'scale-110 border-dotted' : ''}
                `}
                style={{
                    transform: 'translate(-50%, -50%)',
                    marginLeft: '-20px',
                    marginTop: '-20px'
                }}
            />

            {/* Main Cursor */}
            <div
                ref={cursorRef}
                className="absolute left-0 top-0 w-6 h-6 flex items-center justify-center transition-transform duration-100 ease-out"
                style={{
                    marginLeft: '-12px',
                    marginTop: '-12px',
                }}
            >
                {cursorState === 'text' ? (
                    <div className="w-[2px] h-6 bg-[var(--color-primary)] animate-pulse" />
                ) : cursorState === 'card' ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[var(--color-primary)]">
                        <path d="M3 21l3.75-3.75L3 13.5V21zm4.5-4.5l1.5 1.5L21 6V3h-3L7.5 16.5z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" className={`fill-[var(--color-primary)] transition-transform duration-200 ${cursorState === 'pointer' ? 'scale-125 w-6 h-6' : 'w-5 h-5'}`}>
                        {/* Simple feather quill or drop */}
                        <path d="M7,2C3.13,2 0,5.13 0,9C0,11.38 1.19,13.47 3,14.74V22H5V16.4C5.64,16.78 6.31,17 7,17C10.87,17 14,13.87 14,10L14,2H7ZM12,10C12,12.76 9.76,15 7,15C4.24,15 2,12.76 2,10C2,7.24 4.24,5 7,5H12V10Z" transform="translate(4,1)" />
                    </svg>
                )}
            </div>

            <style>{`
                @keyframes fade-out {
                    to { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                }
            `}</style>
        </div>
    );
};

export default CustomCursor;
