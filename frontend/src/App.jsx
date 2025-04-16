import React, { useState } from 'react';
import { BookHeart, Moon, Sun, User } from 'lucide-react';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const themes = {
    dark: {
      background: 'from-[#0B1026] via-[#1B2A4A] to-[#2C4870]',
      text: 'text-[#E1E7FF]',
      subtext: 'text-[#B8C4E8]',
      mountain1: 'bg-[#1B2942]',
      mountain2: 'bg-[#243656]',
      mountain3: 'bg-[#2C4870]',
    },
    light: {
      background: 'from-[#B8D9F2] via-[#7EB6E6] to-[#4B92D4]',
      text: 'text-[#1B2942]',
      subtext: 'text-[#2C4870]',
      mountain1: 'bg-[#7EB6E6]',
      mountain2: 'bg-[#4B92D4]',
      mountain3: 'bg-[#2C4870]',
    },
  };

  const currentTheme = isDark ? themes.dark : themes.light;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentTheme.background} text-white overflow-hidden`}>
      {/* Navigation */}
      <nav className="absolute top-0 w-full p-6 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookHeart className={`w-8 h-8 ${currentTheme.text}`} />
            <span className={`text-2xl font-semibold ${currentTheme.text}`}>MyDiary</span>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex space-x-8">
              <a href="#" className={`${currentTheme.text} hover:opacity-80 transition-opacity`}>Home</a>
              <a href="#" className={`${currentTheme.text} hover:opacity-80 transition-opacity`}>About</a>
              <a href="#" className={`${currentTheme.text} hover:opacity-80 transition-opacity`}>Features</a>
              <a href="#" className={`${currentTheme.text} hover:opacity-80 transition-opacity`}>Contact</a>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isDark ? (
                <Sun className="w-6 h-6 text-white" />
              ) : (
                <Moon className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Twinkle Stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${isDark ? 'bg-white' : 'bg-white'}
              ${i % 4 === 0 ? 'w-1 h-1' : i % 4 === 1 ? 'w-1.5 h-1.5' : i % 4 === 2 ? 'w-2 h-2' : 'w-0.5 h-0.5'}
              ${i % 3 === 0 ? 'animate-twinkle-1' : i % 3 === 1 ? 'animate-twinkle-2' : 'animate-twinkle-3'}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 pt-48">
          <h1 className={`text-6xl font-bold mb-6 ${currentTheme.text}`}>Welcome to Your Digital Diary</h1>
          <p className={`text-xl mb-12 max-w-2xl mx-auto ${currentTheme.subtext}`}>
            Capture your thoughts, memories, and dreams in a beautiful and secure digital space.
            Your personal journey begins here.
          </p>
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => setShowLogin(true)}
              className={`backdrop-blur-md bg-white/10 border border-white/20 ${currentTheme.text} px-8 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 shadow-lg hover:bg-white/20`}
            >
              <User className="w-5 h-5" />
              <span>Get Started</span>
            </button>
            <button
              className={`backdrop-blur-md bg-white/10 border border-white/20 ${currentTheme.text} px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:bg-white/20`}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Mountains */}
        <div className="absolute bottom-0 w-full">
          <div className="relative h-96">
            <div className={`absolute bottom-0 w-full h-64 ${currentTheme.mountain1} transform -skew-y-6`} />
            <div className={`absolute bottom-0 w-full h-72 ${currentTheme.mountain2} transform skew-y-3`} />
            <div className={`absolute bottom-0 w-full h-80 ${currentTheme.mountain3} transform -skew-y-3`} />
          </div>
        </div>
      </div>

      {/* Login & Signup Modals */}
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
