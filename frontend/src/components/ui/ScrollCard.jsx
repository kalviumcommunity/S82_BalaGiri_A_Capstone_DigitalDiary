import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

const ScrollCard = ({ children, className = '' }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

    // Parallax tilt on scroll
    const scrollRotateX = useTransform(scrollYProgress, [0, 1], [3, -3]);

    // Mouse tilt values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springRotateX = useSpring(mouseY, { stiffness: 300, damping: 30 });
    const springRotateY = useSpring(mouseX, { stiffness: 300, damping: 30 });

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);

        mouseX.set(x * 8);
        mouseY.set(y * -8);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <div ref={ref} className="relative perspective-1000 w-full h-full">
            <motion.div
                className={`card-hover glass dark:glass-dark rounded-xl overflow-hidden shadow-lg transition-transform duration-300 ${className}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ scale: 1.02 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX: springRotateX,
                    rotateY: springRotateY,
                }}
            >
                <motion.div style={{ rotateX: scrollRotateX }} className="w-full h-full relative">
                    {children}
                </motion.div>
            </motion.div>
            <style>{`.perspective-1000 { perspective: 1000px; }`}</style>
        </div>
    );
};

export default ScrollCard;
