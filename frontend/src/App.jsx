import React, { useState } from 'react';
import { BookHeart, Moon, Sun, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import DiaryPage from './Pages/Dairypage';
import Features from './Pages/Features';
import LearnMore from './Pages/LearnMore';
import Contact from './Pages/Contact';
import About from './Pages/About';
import VerifyLogin from './Pages/VerifyLogin';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const location = useLocation();

  const themes = {
    dark: {
      background: 'from-[#0B1026] via-[#1B2A4A] to-[#2C4870]',
      text: 'text-[#E1E7FF]',
      subtext: 'text-[#B8C4E8]',
      mountain1: 'bg-[#1B2942]',
      mountain2: 'bg-[#243656]',
      mountain3: 'bg-[#2C4870]',
      button: 'backdrop-blur-lg bg-white/20 border-2 border-white/30 text-[#1B2942] hover:bg-white/30',
      buttonOutline: 'backdrop-blur-lg bg-white/20 border-2 border-white/30 text-[#1B2942] hover:bg-white/30',
    },
    light: {
      background: 'from-[#B8D9F2] via-[#7EB6E6] to-[#4B92D4]',
      text: 'text-[#1B2942]',
      subtext: 'text-[#2C4870]',
      mountain1: 'bg-[#7EB6E6]',
      mountain2: 'bg-[#4B92D4]',
      mountain3: 'bg-[#2C4870]',
      button: 'backdrop-blur-lg bg-white/20 border-2 border-white/30 text-white hover:bg-white/30',
      buttonOutline: 'backdrop-blur-lg bg-white/20 border-2 border-white/30 text-white hover:bg-white/30',
    },
  };

  const currentTheme = isDark ? themes.dark : themes.light;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentTheme.background} ${currentTheme.text} overflow-hidden`}>
      {location.pathname !== '/diary' && (
        <nav className="absolute top-0 w-full p-4 sm:p-6 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 shadow-lg">
            <div className="flex items-center space-x-2 text-white">
              <BookHeart className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-xl sm:text-2xl font-bold tracking-tight">MyDiary</span>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-8 text-sm sm:text-base text-white font-medium">
              <Link to="/" className="hover:text-cyan-300 transition-colors">Home</Link>
              <Link to="/features" className="hover:text-cyan-300 transition-colors">Features</Link>
              <Link to="/about" className="hover:text-cyan-300 transition-colors">About</Link>

              <Link to="/contact" className="hover:text-cyan-300 transition-colors">Contact</Link>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
              >
                {isDark ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={
          <div className="relative min-h-screen overflow-hidden">
            {/* Animated Background Orbs */}
            <motion.div
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -50, 50, 0],
                scale: [1, 1.2, 0.9, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 ${isDark ? 'bg-indigo-600' : 'bg-blue-300'}`}
            />
            <motion.div
              animate={{
                x: [0, -70, 30, 0],
                y: [0, 80, -40, 0],
                scale: [1, 1.1, 0.95, 1]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${isDark ? 'bg-cyan-900' : 'bg-cyan-200'}`}
            />

            <div className="absolute top-20 right-6 sm:top-24 sm:right-32 z-10">
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-24 h-24 sm:w-32 sm:h-32"
              >
                {isDark ? (
                  <Moon className="w-full h-full text-[#E1E7FF] drop-shadow-[0_0_15px_rgba(225,231,255,0.5)]" />
                ) : (
                  <Sun className="w-full h-full text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
                )}
                <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${isDark ? 'bg-[#E1E7FF]' : 'bg-white'}`} />
              </motion.div>
            </div>

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0
                }}
                animate={{
                  y: [null, Math.random() * -100],
                  opacity: [0, Math.random() * 0.8, 0]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                className={`absolute rounded-full pointer-events-none
                  ${i % 3 === 0 ? 'w-1 h-1' : i % 3 === 1 ? 'w-1.5 h-1.5' : 'w-2 h-2'}
                  ${isDark ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white shadow-[0_0_2px_white]'}`}
              />
            ))}

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
              <div className="text-center max-w-3xl">
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg"
                >
                  Welcome to Your Digital Diary
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className={`text-base sm:text-lg mb-8 sm:mb-12 ${currentTheme.subtext} font-medium tracking-wide`}
                >
                  Capture your thoughts, memories, and dreams in a beautiful and secure digital space.
                  Your personal journey begins here.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogin(true)}
                    className={`${currentTheme.button} px-6 sm:px-8 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl hover:shadow-${isDark ? 'white/10' : 'blue-400/20'}`}
                  >
                    <User className="w-5 h-5" />
                    <span>Get Started</span>
                  </motion.button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/learn-more" className={`${currentTheme.buttonOutline} px-6 sm:px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl block`}>
                      Learn More
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            <div className="absolute bottom-0 w-full pointer-events-none z-0">
              <svg className="w-full h-48 sm:h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <motion.path
                  fill={isDark ? '#1B2942' : '#7EB6E6'}
                  fillOpacity="0.6"
                  d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  animate={{
                    d: [
                      "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                      "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,192C672,192,768,224,864,240C960,256,1056,256,1152,240C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                      "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.path
                  fill={isDark ? '#243656' : '#4B92D4'}
                  fillOpacity="0.8"
                  d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  animate={{
                    d: [
                      "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                      "M0,256L48,245.3C96,235,192,213,288,197.3C384,181,480,171,576,181.3C672,192,768,224,864,234.7C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                      "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: -2 }}
                />
                <motion.path
                  fill={isDark ? '#2C4870' : '#2C4870'}
                  fillOpacity="1"
                  d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  animate={{
                    d: [
                      "M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                      "M0,320L48,304C96,288,192,256,288,245.3C384,235,480,245,576,250.7C672,256,768,256,864,240C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                      "M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: -5 }}
                />
              </svg>
            </div>
          </div>
        } />

        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/features" element={<Features currentTheme={currentTheme} />} />
        <Route path="/learn-more" element={<LearnMore currentTheme={currentTheme} />} />
        <Route path="/contact" element={<Contact currentTheme={currentTheme} />} />
        <Route path="/about" element={<About currentTheme={currentTheme} />} />
        <Route path="/verify-login" element={<VerifyLogin />} />

      </Routes>

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          switchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          currentTheme={currentTheme}
        />
      )}
      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          switchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
}

export default App;
