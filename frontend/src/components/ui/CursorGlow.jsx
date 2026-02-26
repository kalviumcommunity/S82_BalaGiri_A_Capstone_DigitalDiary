import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CursorGlow = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Use springs to interpolate the cursor's movement creating a smooth, trailing effect
    const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
    const cursorX = useSpring(0, springConfig);
    const cursorY = useSpring(0, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            cursorX.set(e.clientX - 200); // Offset by half the width to center the glow
            cursorY.set(e.clientY - 200); // Offset by half the height
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [cursorX, cursorY]);

    return (
        <motion.div
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                x: cursorX,
                y: cursorY,
                width: 400,
                height: 400,
                pointerEvents: 'none',
                zIndex: 50,
            }}
        >
            <div
                className="w-full h-full rounded-full blur-[100px] opacity-15 dark:opacity-[0.1]"
                style={{
                    background: 'radial-gradient(circle, #C9956A 0%, rgba(201,149,106,0.3) 40%, transparent 70%)',
                }}
            />
        </motion.div>
    );
};

export default CursorGlow;
