import React from "react";
import { CheckCircle, Lock, Mic, Image as ImageIcon, Calendar, Code, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const SpotlightCard = ({ children, isDark, index, className = "" }) => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-3xl border shadow-sm transition-colors ${className}`}
      style={{
        background: isDark ? '#1C1828' : '#FFFFFF',
        borderColor: isDark ? '#2E2940' : '#E8D9C5',
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${isDark ? 'rgba(201,149,106,0.1)' : 'rgba(123,63,32,0.06)'}, transparent 70%)`,
        }}
      />
      <div className="relative z-10 p-8 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="pb-24 pt-12 px-6 sm:px-12 relative z-10">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight drop-shadow-sm" style={{ color: 'var(--text-primary)' }}>
            Digital Diary
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            A secure, full-stack <strong style={{ color: isDark ? '#C9956A' : '#7B3F20' }}>MERN</strong> capstone project designed to be your personal sanctuary effectively blending security with a visually stunning experience.
          </p>
        </motion.div>

        <SpotlightCard isDark={isDark} index={1} className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Code style={{ color: isDark ? '#E8B86D' : '#C4862A' }} /> Tech Stack
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3 uppercase text-sm tracking-wider" style={{ color: isDark ? '#7B5EA7' : '#5C3A8C' }}>Frontend</h3>
              <p style={{ color: 'var(--text-muted)' }} className="leading-relaxed">React, Tailwind CSS, Lucide Icons, Framer Motion</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 uppercase text-sm tracking-wider" style={{ color: isDark ? '#7B5EA7' : '#5C3A8C' }}>Backend</h3>
              <p style={{ color: 'var(--text-muted)' }} className="leading-relaxed">Node.js, Express, MongoDB, Mongoose, JWT</p>
            </div>
          </div>
        </SpotlightCard>

        <div className="grid gap-8 md:grid-cols-2">
          <SpotlightCard isDark={isDark} index={2}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              📌 Key Features
            </h2>
            <ul className="space-y-4">
              {[
                { icon: <CheckCircle size={18} style={{ color: isDark ? '#C9956A' : '#7B3F20' }} />, text: "Secure Auth (Bcrypt + JWT)" },
                { icon: <ImageIcon size={18} style={{ color: isDark ? '#7B5EA7' : '#5C3A8C' }} />, text: "Multi-image attachment support" },
                { icon: <Mic size={18} style={{ color: isDark ? '#E8B86D' : '#C4862A' }} />, text: "Voice note recording" },
                { icon: <Calendar size={18} style={{ color: isDark ? '#C9956A' : '#7B3F20' }} />, text: "Calendar & Month grouping" },
                { icon: <Lock size={18} style={{ color: isDark ? '#7B5EA7' : '#5C3A8C' }} />, text: "AES-256 Content Encryption" }
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4" style={{ color: 'var(--text-muted)' }}>
                  <span className="p-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </SpotlightCard>

          <SpotlightCard isDark={isDark} index={3}>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                🌐 Project Status
              </h2>
              <ul className="space-y-6">
                <li className="flex flex-col">
                  <span className="flex items-center gap-3 font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: isDark ? '#C9956A' : '#7B3F20' }} />
                    Backend Live
                  </span>
                  <a href="https://s82-balagiri-a-capstone-digitaldiary-2.onrender.com" target="_blank" rel="noopener noreferrer" className="text-sm underline opacity-70 hover:opacity-100 ml-6" style={{ color: 'var(--text-muted)' }}>
                    s82-balagiri-a-capstone...render.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex items-center gap-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: isDark ? '#E8B86D' : '#C4862A' }} />
                    Frontend
                  </span>
                  <span className="text-sm opacity-70" style={{ color: 'var(--text-muted)' }}>Deploying soon on Vercel</span>
                </li>
              </ul>
            </div>

            <div className="mt-10 pt-8 text-center" style={{ borderTop: isDark ? '1px solid #2E2940' : '1px solid #E8D9C5' }}>
              <h2 className="text-xl font-bold mb-3 flex items-center justify-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Heart size={20} style={{ color: isDark ? '#C9956A' : '#7B3F20' }} className="fill-current" /> Author
              </h2>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>BalaGiri</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Digital Diary</p>
              <div className="flex justify-center gap-6 text-sm font-semibold uppercase tracking-wider">
                <a href="https://github.com/bala-Git-code/" className="hover:opacity-100 opacity-70 transition-opacity" style={{ color: isDark ? '#E8B86D' : '#C4862A' }}>GitHub</a>
                <span className="opacity-20" style={{ color: 'var(--text-muted)' }}>|</span>
                <a href="mailto:balagiri702@gmail.com" className="hover:opacity-100 opacity-70 transition-opacity" style={{ color: isDark ? '#E8B86D' : '#C4862A' }}>Email</a>
              </div>
            </div>
          </SpotlightCard>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm mt-16 font-medium italic"
          style={{ color: 'var(--text-muted)' }}
        >
          Designed & Built with <span style={{ color: isDark ? '#C9956A' : '#7B3F20' }}>♡</span> by BalaGiri
        </motion.div>
      </div>
    </div>
  );
};

export default About;
