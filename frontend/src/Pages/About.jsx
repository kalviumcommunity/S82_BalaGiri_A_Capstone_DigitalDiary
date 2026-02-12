import React from "react";
import { CheckCircle, Lock, Mic, Image, Calendar, Code, Heart } from "lucide-react";
import { motion } from "framer-motion";

const About = ({ currentTheme, isDark }) => {
  const bgClass = isDark ? 'from-[#0B1026] via-[#1B2A4A] to-[#2C4870]' : 'from-[#B8D9F2] via-[#7EB6E6] to-[#4B92D4]';
  const textClass = isDark ? 'text-white' : 'text-[#1B2942]';
  const cardBg = isDark ? 'bg-[#1B2942]/60 border-white/10' : 'bg-white/60 border-white/40';
  const subText = isDark ? 'text-gray-300' : 'text-gray-700';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgClass} ${textClass} pt-32 pb-20 px-6 sm:px-12`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight drop-shadow-sm">Digital Diary</h1>
          <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${subText} leading-relaxed`}>
            A secure, full-stack <strong>MERN</strong> capstone project designed to be your personal sanctuary effectively blending security with a visually stunning experience.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className={`p-8 rounded-3xl backdrop-blur-xl border shadow-lg mb-10 ${cardBg}`}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Code className="text-cyan-400" /> Tech Stack
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 opacity-80 uppercase text-sm tracking-wider">Frontend</h3>
              <p className={`${subText}`}>React, Tailwind CSS, Lucide Icons, Framer Motion</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 opacity-80 uppercase text-sm tracking-wider">Backend</h3>
              <p className={`${subText}`}>Node.js, Express, MongoDB, Mongoose, JWT</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div variants={itemVariants} className={`p-8 rounded-3xl backdrop-blur-xl border shadow-lg ${cardBg}`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">📌 Key Features</h2>
            <ul className="space-y-3">
              {[
                { icon: <CheckCircle size={18} className="text-emerald-400" />, text: "Secure Auth (Bcrypt + JWT)" },
                { icon: <Image size={18} className="text-purple-400" />, text: "Multi-image attachment support" },
                { icon: <Mic size={18} className="text-red-400" />, text: "Voice note recording" },
                { icon: <Calendar size={18} className="text-yellow-400" />, text: "Calendar & Month grouping" },
                { icon: <Lock size={18} className="text-cyan-400" />, text: "AES-256 Content Encryption" }
              ].map((item, idx) => (
                <li key={idx} className={`flex items-center gap-3 ${subText}`}>
                  {item.icon} {item.text}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className={`p-8 rounded-3xl backdrop-blur-xl border shadow-lg ${cardBg} flex flex-col justify-between`}>
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">🌐 Project Status</h2>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <span className="flex items-center gap-2 font-semibold text-emerald-400"><CheckCircle size={16} /> Backend Live</span>
                  <a href="https://s82-balagiri-a-capstone-digitaldiary-2.onrender.com" target="_blank" rel="noopener noreferrer" className={`text-sm underline opacity-70 hover:opacity-100 ${subText} ml-6`}>
                    s82-balagiri-a-capstone...render.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center gap-2 font-semibold text-yellow-400">🚧 Frontend</span>
                  <span className={`text-sm opacity-70 ${subText}`}>Deploying soon on Vercel</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <Heart size={20} className="text-red-500 fill-red-500" /> Author
              </h2>
              <p className="text-lg font-semibold">BalaGiri</p>
              <p className={`text-sm ${subText} mb-2`}>Digital Diary</p>
              <div className="flex justify-center gap-4 text-sm font-medium">
                <a href="https://github.com/bala-Git-code/" className="hover:text-cyan-400 transition-colors">GitHub</a>
                <span className="opacity-30">|</span>
                <a href="mailto:balagiri702@gmail.com" className="hover:text-cyan-400 transition-colors">Email</a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="text-center text-sm opacity-60 mt-16 font-medium">
          Designed & Built with ❤️ by BalaGiri
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
