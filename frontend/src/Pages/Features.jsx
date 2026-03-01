import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Image as LucideImage, Calendar, Archive, Cloud } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FeatureCard = ({ icon: Icon, title, description, index }) => {
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
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      className="group relative h-full flex flex-col p-8 overflow-hidden rounded-[16px] border transition-colors duration-300 shadow-sm"
      style={{
        background: 'var(--color-card-elevated)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at var(--mouse-x, 0) var(--mouse-y, 0), var(--shadow-color), transparent 70%)`,
        }}
      />
      {/* Shimmer on hover pseudo-element effect can be handled by the spotlight or an additional overlay */}

      <div className="relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm border"
          style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}
        >
          <Icon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
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
  // We can keep useTheme if needed for specific logic, but CSS vars handle the styling

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
      className="py-24 relative transition-colors duration-300"
      style={{
        background: 'var(--color-page-bg)',
        borderTop: '1px solid var(--color-border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            WHAT MAKES IT DIFFERENT
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-6 drop-shadow-sm"
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
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
