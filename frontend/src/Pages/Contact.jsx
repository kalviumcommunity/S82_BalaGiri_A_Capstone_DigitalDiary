import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

function Contact() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen px-6 pt-32 pb-20 flex justify-center items-center transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="max-w-xl w-full backdrop-blur-xl rounded-3xl p-6 sm:p-10 text-center border relative overflow-hidden transition-colors duration-300"
        style={{
          background: 'var(--color-card-elevated)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 25px 50px -12px var(--shadow-color)'
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--color-highlight)',
            boxShadow: `0 0 20px var(--color-highlight)`
          }}
        ></div>

        <h1 className="text-4xl font-bold mb-8 tracking-tight drop-shadow-sm text-[var(--text-primary)]">
          Get in Touch
        </h1>

        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-widest opacity-80 font-semibold mb-2 text-[var(--text-muted)]">
            Created By
          </h2>
          <p className="text-3xl font-bold mb-2 text-[var(--color-primary)]">BalaGiri</p>
          <p className="text-sm font-medium text-[var(--text-muted)]">Digital Diary</p>
        </div>

        <div className="space-y-4">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://github.com/bala-Git-code/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full p-5 rounded-xl border transition-all overflow-hidden relative group"
            style={{
              background: 'var(--color-card-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-[var(--color-highlight)]"></div>
            <span className="text-xs uppercase tracking-wider block mb-1 text-[var(--text-primary)] opacity-80">Check out my work</span>
            <span className="font-semibold text-lg text-[var(--color-highlight)]">github.com/bala-Git-code</span>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="mailto:balagiri702@gmail.com"
            className="block w-full p-5 rounded-xl border transition-all overflow-hidden relative group"
            style={{
              background: 'var(--color-card-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-[var(--color-primary)]"></div>
            <span className="text-xs uppercase tracking-wider block mb-1 text-[var(--text-primary)] opacity-80">Contact me at</span>
            <span className="font-semibold text-lg text-[var(--color-primary)]">balagiri702@gmail.com</span>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

export default Contact;
