import React from 'react';
import { motion } from 'framer-motion';

function Features({ currentTheme, isDark }) {
  const bgClass = isDark ? 'from-[#0B1026] via-[#1B2A4A] to-[#2C4870]' : 'from-[#B8D9F2] via-[#7EB6E6] to-[#4B92D4]';
  const textClass = isDark ? 'text-white' : 'text-[#1B2942]';
  const cardBg = isDark ? 'bg-[#1B2942]/60 border-white/10' : 'bg-white/60 border-white/40';
  const cardText = isDark ? 'text-gray-300' : 'text-gray-700';

  const features = [
    { emoji: '🗓️', title: 'Calendar Access', desc: 'Navigate your journey through time with an intuitive calendar view.' },
    { emoji: '🔐', title: 'AES-256 Encryption', desc: 'Military-grade protection ensures your deepest thoughts remain yours alone.' },
    { emoji: '🗑️', title: 'Smart Deletion', desc: 'Remove entries safely with instant cleanup of associated media files.' },
    { emoji: '📂', title: 'Organized Archives', desc: 'Automatically grouped by Month and Year for seamless browsing.' },
    { emoji: '☁️', title: 'Hybrid Storage', desc: 'Optimized media handling with support for both efficient local and cloud storage.' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgClass} ${textClass} pt-32 pb-20 px-6 sm:px-12`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 drop-shadow-sm">
            Powerful Features
          </h1>
          <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Everything you need to chronicle your life securely and beautifully.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className={`p-8 rounded-3xl shadow-lg border backdrop-blur-xl transition-colors ${cardBg}`}
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4 filter drop-shadow-md">{item.emoji}</span>
                <h3 className={`text-xl font-bold ${textClass}`}>{item.title}</h3>
              </div>
              <p className={`${cardText} leading-relaxed`}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Features;
