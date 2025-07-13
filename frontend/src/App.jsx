import React, { useState } from 'react';
import { BookHeart, Moon, Sun, User } from 'lucide-react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import DiaryPage from './Pages/Dairypage';
import Features from './Pages/Features';
import LearnMore from './Pages/Learnmore';
import Contact from './Pages/Contact';
import About from './Pages/About';

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
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BookHeart className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-xl sm:text-2xl font-semibold">MyDiary</span>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-8 text-sm sm:text-base">
              <Link to="/" className="hover:opacity-80 transition-opacity">Home</Link>
              <Link to="/features" className="hover:opacity-80 transition-opacity">Features</Link>
             <Link to="/about" className="hover:opacity-80 transition-opacity">About</Link>

              <Link to="/contact" className="hover:opacity-80 transition-opacity">Contact</Link>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />}
              </button>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={
          <div className="relative min-h-screen">
            <div className="absolute top-20 right-6 sm:top-24 sm:right-32 z-10">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                {isDark ? (
                  <Moon className="w-full h-full text-[#E1E7FF]" />
                ) : (
                  <Sun className="w-full h-full text-white" />
                )}
                <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${isDark ? 'bg-[#E1E7FF]' : 'bg-white'}`} />
              </div>
            </div>

            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full bg-white
                  ${i % 4 === 0 ? 'w-1 h-1' : i % 4 === 1 ? 'w-1.5 h-1.5' : i % 4 === 2 ? 'w-2 h-2' : 'w-0.5 h-0.5'}
                  ${i % 3 === 0 ? 'animate-twinkle-1' : i % 3 === 1 ? 'animate-twinkle-2' : 'animate-twinkle-3'}`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7 + 0.3,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
              <div className="text-center max-w-3xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                  Welcome to Your Digital Diary
                </h1>
                <p className={`text-base sm:text-lg mb-8 sm:mb-12 ${currentTheme.subtext}`}>
                  Capture your thoughts, memories, and dreams in a beautiful and secure digital space.
                  Your personal journey begins here.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <button
                    onClick={() => setShowLogin(true)}
                    className={`${currentTheme.button} px-6 sm:px-8 py-3 rounded-full font-semibold transition-colors flex items-center space-x-2 shadow-lg`}
                  >
                    <User className="w-5 h-5" />
                    <span>Get Started</span>
                  </button>
                  <Link to="/learn-more" className={`${currentTheme.buttonOutline} px-6 sm:px-8 py-3 rounded-full font-semibold transition-colors shadow-lg`}>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 w-full">
              <div className="relative h-60 sm:h-96">
                <div className={`absolute bottom-0 w-full h-40 sm:h-64 ${currentTheme.mountain1} transform -skew-y-6`} />
                <div className={`absolute bottom-0 w-full h-48 sm:h-72 ${currentTheme.mountain2} transform skew-y-3`} />
                <div className={`absolute bottom-0 w-full h-56 sm:h-80 ${currentTheme.mountain3} transform -skew-y-3`} />
              </div>
            </div>
          </div>
        } />

        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/learn-more" element={<LearnMore currentTheme={currentTheme} />} />
        <Route path="/contact" element={<Contact currentTheme={currentTheme} />} />
        <Route path="/about" element={<About />} />

      </Routes>

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          switchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          switchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
