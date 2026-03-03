import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    onClick,
    type = 'button',
    icon: Icon,
    size,
    ...props
}) => {
    const baseStyles =
        'relative inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    const variantStyles = {
        primary: {
            className: 'bg-[#7B3F20] text-[#FFFFFF] dark:bg-[#C9956A] dark:text-[#0D0D1A]',
            shadow: '0 4px 14px rgba(123, 63, 32, 0.45)',
            hoverShadow: '0 12px 32px rgba(123, 63, 32, 0.55), 0 4px 8px rgba(0,0,0,0.2)',
            darkShadow: '0 4px 14px rgba(201,149,106,0.40)',
            darkHoverShadow: '0 12px 32px rgba(201,149,106,0.55), 0 4px 8px rgba(0,0,0,0.15)',
        },
        secondary: {
            className: 'bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)]',
            shadow: '0 2px 8px rgba(123,63,32,0.12)',
            hoverShadow: '0 10px 28px rgba(123,63,32,0.22), 0 4px 8px rgba(0,0,0,0.1)',
        },
        ghost: {
            className: 'bg-transparent text-[var(--text-primary)]',
            shadow: 'none',
            hoverShadow: '0 8px 20px rgba(0,0,0,0.12)',
        },
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const sizeClass = size ? sizes[size] : sizes.md;
    const v = variantStyles[variant] || variantStyles.primary;

    return (
        <motion.button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${v.className} ${sizeClass} ${className}`}
            style={{ boxShadow: v.shadow }}
            initial={{ y: 0, boxShadow: v.shadow }}
            whileHover={{
                y: -5,
                scale: 1.03,
                boxShadow: v.hoverShadow,
                transition: { type: 'spring', stiffness: 320, damping: 18 }
            }}
            whileTap={{
                y: 0,
                scale: 0.97,
                boxShadow: v.shadow,
                transition: { type: 'spring', stiffness: 400, damping: 20 }
            }}
            {...props}
        >
            {Icon && <Icon className="w-5 h-5 mr-2 relative z-10" />}
            <span className="relative z-10 font-bold">{children}</span>
        </motion.button>
    );
};

export default Button;

