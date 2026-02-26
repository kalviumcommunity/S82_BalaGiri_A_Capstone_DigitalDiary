import { useState, useEffect } from 'react';

export function useMouseParallax(intensity = 0.05) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (window.innerWidth / 2 - e.clientX) * intensity;
            const y = (window.innerHeight / 2 - e.clientY) * intensity;
            setOffset({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [intensity]);

    return offset;
}
