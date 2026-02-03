import React from 'react';
import { motion } from 'framer-motion';

function Contact({ currentTheme, isDark }) {
  // Dynamic Theme Colors
  const bgClass = isDark ? 'from-[#0B1026] via-[#1B2A4A] to-[#2C4870]' : 'from-[#B8D9F2] via-[#7EB6E6] to-[#4B92D4]';
  const textClass = isDark ? 'text-white' : 'text-[#1B2942]';
  const cardBg = isDark ? 'bg-[#1B2942]/60 border-white/10' : 'bg-white/60 border-white/40';
  const cardText = isDark ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgClass} ${textClass} px-6 pt-32 pb-20 flex justify-center items-center`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className={`max-w-xl w-full ${cardBg} backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10 text-center border relative overflow-hidden`}
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.6)]"></div>

        <h1 className="text-4xl font-bold mb-8 tracking-tight drop-shadow-sm">Get in Touch</h1>

        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-2">Created By</h2>
          <p className="text-3xl font-bold mb-2 text-cyan-400">BalaGiri</p>
          <p className={`${cardText} text-sm font-medium`}>Digital Diary</p>
        </div>

        <div className="space-y-4">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://github.com/bala-Git-code/"
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full p-4 rounded-xl border border-white/10 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/40 hover:bg-white/60'} transition-all`}
          >
            <span className="text-xs uppercase tracking-wider opacity-60 block mb-1">Check out my work</span>
            <span className="font-semibold text-cyan-400 text-lg">github.com/bala-Git-code</span>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="mailto:balagiri702@gmail.com"
            className={`block w-full p-4 rounded-xl border border-white/10 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/40 hover:bg-white/60'} transition-all`}
          >
            <span className="text-xs uppercase tracking-wider opacity-60 block mb-1">Contact me at</span>
            <span className="font-semibold text-lg">balagiri702@gmail.com</span>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

export default Contact;
