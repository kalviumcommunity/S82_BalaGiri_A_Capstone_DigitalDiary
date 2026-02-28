import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Image as LucideImage, Calendar, Archive, Cloud } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const FeatureCard = ({ icon: Icon, title, description, isDark, index }) => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      className={`group relative h-full flex flex-col p-8 overflow-hidden rounded-[16px] border transition-all duration-300 shadow-sm ${isDark
          ? 'bg-[#1C1828] border-[#2E2940] hover:border-[#C9956A]/50 hover:shadow-[0_12px_40px_rgba(201,149,106,0.15)]'
          : 'bg-[#FFFFFF] border-[#E8D9C5] hover:border-[#7B3F20]/40 hover:shadow-[0_12px_40px_rgba(123,63,32,0.12)]'
        }`}
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), ${isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.06)'
            }, transparent 70%)`,
        }}
      />
      {/* Shimmer on hover pseudo-element effect can be handled by the spotlight or an additional overlay */}

      <div className="relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm"
          style={{ background: isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.05)' }}
        >
          <Icon className="w-6 h-6" style={{ color: isDark ? '#C9956A' : '#7B3F20' }} />
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
          {title}
        </h3>
        <p className="text-base text-[var(--text-muted)] leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

function Features() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const features = [
    { icon: Lock, title: 'End-to-End Encryption', desc: 'Your words are encrypted the moment you type them. We built this so even WE cannot read your diary.' },
    { icon: Shield, title: 'Auto-Lock Vault', desc: 'Step away? Your diary seals itself. The encryption key vanishes from memory — no trace, no access.' },
    { icon: LucideImage, title: 'Multimedia Memories', desc: 'Attach photos, voice notes, and feelings. Because some memories need more than words.' },
    { icon: Calendar, title: 'Calendar Time Travel', desc: 'Navigate your past like flipping through pages. Every date holds a chapter of your life.' },
    { icon: Archive, title: 'Zero-Knowledge Architecture', desc: 'Our servers store only encrypted ciphertext. Your key never touches our database. Ever.' },
    { icon: Cloud, title: 'Cross-Device Sync', desc: 'Your encrypted vault follows you everywhere — securely synced to the cloud, readable only by you.' },
  ];

  return (
    <section
      className="py-24 relative"
      style={{
        background: isDark ? '#0F0E1A' : '#FFF8F1',
        borderTop: isDark ? '1px solid #2E2940' : '1px solid #E8D9C5'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ color: isDark ? '#C9956A' : '#7B3F20' }}
          >
            WHAT MAKES IT DIFFERENT
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-6"
          >
            Built for Privacy. Designed for Memory.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-[var(--text-muted)]"
          >
            Every feature exists to protect your story while making it effortless to tell.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <FeatureCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.desc}
              isDark={isDark}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
