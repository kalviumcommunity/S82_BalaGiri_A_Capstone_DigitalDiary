import React from 'react';
import { motion } from 'framer-motion';
import { useMagnetic } from '../../hooks/useMagnetic';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    onClick,
    type = 'button',
    icon: Icon,
    ...props
}) => {
    const { ref, x, y, onMouseMove, onMouseEnter, onMouseLeave } = useMagnetic();

    const baseStyles =
        'relative inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none group';

    const variants = {
        primary:
            'bg-[#7B3F20] text-[#FFFFFF] shadow-[0_4px_20px_rgba(123,63,32,0.35)] hover:bg-[#5C2E14] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(123,63,32,0.45)] dark:bg-[#C9956A] dark:text-[#0D0D1A] dark:shadow-[0_4px_20px_rgba(201,149,106,0.35)] dark:hover:bg-[#E8B86D] dark:hover:shadow-[0_8px_28px_rgba(201,149,106,0.5)] transition-all duration-300',
        secondary:
            'bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:bg-opacity-10 transition-all duration-300',
        ghost:
            'bg-transparent text-[var(--text-primary)] hover:bg-[var(--color-border)] hover:bg-opacity-50 transition-all duration-300',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const sizeClass = props.size ? sizes[props.size] : sizes.md;

    return (
        <motion.button
            ref={ref}
            style={{ x, y }}
            type={type}
            onClick={onClick}
            onMouseMove={onMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`${baseStyles} ${variants[variant]} ${sizeClass} ${className}`}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            {Icon && <Icon className="w-5 h-5 mr-2 relative z-10" />}
            <span className="relative z-10 font-bold">{children}</span>
        </motion.button>
    );
};

export default Button;
