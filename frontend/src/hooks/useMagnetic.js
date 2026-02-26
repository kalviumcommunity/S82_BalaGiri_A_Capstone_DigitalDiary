import { useRef, useState } from 'react';
import { useSpring } from 'framer-motion';

export const useMagnetic = () => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const motionX = useSpring(0, springConfig);
    const motionY = useSpring(0, springConfig);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        // Max pull is somewhat limited
        motionX.set(distanceX * 0.15);
        motionY.set(distanceY * 0.15);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        motionX.set(0);
        motionY.set(0);
    };

    return {
        ref,
        x: motionX,
        y: motionY,
        onMouseMove: handleMouseMove,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
    };
};
