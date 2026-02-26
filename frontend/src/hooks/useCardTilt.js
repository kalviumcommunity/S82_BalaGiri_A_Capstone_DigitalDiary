import React, { useState, useCallback } from 'react';

export const useCardTilt = (config = {}) => {
    const { maxTilt = 10, scale = 1.02 } = config;
    const [style, setStyle] = useState({});

    const onMouseMove = useCallback((e) => {
        const card = e.currentTarget;
        const box = card.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;

        const centerX = box.width / 2;
        const centerY = box.height / 2;

        // Calculate rotation percentage based on distance from center
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
            transition: 'none', // Remove transition for smooth tracking
            zIndex: 10
        });
    }, [maxTilt, scale]);

    const onMouseLeave = useCallback(() => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s ease',
            zIndex: 1
        });
    }, []);

    return { onMouseMove, onMouseLeave, style };
};
