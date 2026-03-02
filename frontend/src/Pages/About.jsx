import React from "react";
import { Heart, Sparkles, BookOpen, Rocket, Coffee } from "lucide-react";
import { motion } from "framer-motion";

const SpotlightCard = ({ children, index, className = "" }) => {
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
      className={`group relative overflow-hidden rounded-3xl shadow-sm transition-colors duration-300 border ${className}`}
      style={{
        background: 'var(--color-card-elevated)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), var(--shadow-color), transparent 70%)`,
        }}
      />
      <div className="relative z-10 p-8 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

const About = () => {
  return (
    <div className="pb-24 pt-12 px-6 sm:px-12 relative z-10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-sm">
            <Sparkles className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight drop-shadow-sm text-[var(--text-primary)]">
            Our Story
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-[var(--text-muted)]">
            Digital Diary began as a capstone vision—a challenge to merge military-grade security with an undeniably beautiful user experience.
          </p>
        </motion.div>

        <SpotlightCard index={1} className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
            <BookOpen className="text-[var(--color-highlight)]" /> The Vision
          </h2>
          <p className="leading-relaxed text-[var(--text-muted)] text-lg mb-6">
            In an era where personal data is constantly mined and monitored, finding a truly private digital space is nearly impossible. Digital Diary wasn't just built to be another note-taking app; it was engineered to be a <span className="font-semibold text-[var(--text-primary)]">sanctuary</span>.
          </p>
          <p className="leading-relaxed text-[var(--text-muted)] text-lg">
            Every line of code in this MERN stack application was written with a single promise: <span className="italic">Your thoughts belong solely to you.</span> By implementing end-to-end AES-256 encryption within a seamless interface, we've proven that privacy does not have to come at the cost of aesthetics.
          </p>
        </SpotlightCard>



        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm mt-16 font-medium italic text-[var(--text-muted)] tracking-wide flex items-center justify-center gap-1"
        >
          Designed & Built with <Heart size={14} className="text-[var(--color-primary)] fill-[var(--color-primary)] mx-1" /> by BalaGiri
        </motion.div>
      </div>
    </div>
  );
};

export default About;
