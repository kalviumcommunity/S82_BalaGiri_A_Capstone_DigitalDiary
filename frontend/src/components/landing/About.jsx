import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const paragraphs = [
    "Digital Diary was built on a single belief: your private thoughts should remain private.",
    "In a world where apps monetize your data, we built something different — a journaling experience where the architecture itself makes surveillance impossible."
  ];

  return (
    <section
      id="about"
      className="py-24 relative overflow-hidden"
      style={{
        background: isDark ? '#13111C' : '#F5EBD8',
        borderTop: isDark ? '1px solid #2E2940' : '1px solid #E8D9C5'
      }}
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">

        {/* Decorative Quotation Mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="absolute top-10 left-1/2 -translate-x-1/2 text-[20rem] font-serif leading-none select-none pointer-events-none"
          style={{ color: isDark ? '#C9956A' : '#7B3F20' }}
        >
          &ldquo;
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-4xl lg:text-5xl font-bold mb-12 relative z-10"
          style={{ color: 'var(--text-primary)' }}
        >
          Not Just a Diary. A Digital Sanctuary.
        </motion.h2>

        <div className="space-y-6 text-xl md:text-2xl leading-relaxed max-w-3xl relative z-10">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              style={{ color: 'var(--text-muted)' }}
            >
              {p}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 text-sm font-medium tracking-widest uppercase"
          style={{ color: isDark ? '#7B5EA7' : '#5C3A8C' }}
        >
          Privacy by Design
        </motion.div>
      </div>
    </section>
  );
};

export default About;
