
import React, { useState } from 'react';
import { BookHeart, Moon, Sun, User } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';

function LandingPage({ isDark, setIsDark, currentTheme }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

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
        {/* Moon/Sun */}
        <div className="absolute top-24 right-32">
          <div className="relative">
            {isDark ? (
              <Moon className="w-32 h-32 text-[#E1E7FF]" />
            ) : (
              <Sun className="w-32 h-32 text-white" />
            )}
            <div className={`absolute inset-0 w-32 h-32 rounded-full blur-xl opacity-20 ${isDark ? 'bg-[#E1E7FF]' : 'bg-white'}`} />
          </div>
        </div>

        {/* Stars */}
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

        {/* Mountains */}
        <div className="absolute bottom-0 w-full">
          <div className="relative h-96">
            <div className={`absolute bottom-0 w-full h-64 ${currentTheme.mountain1} transform -skew-y-6`} />
            <div className={`absolute bottom-0 w-full h-72 ${currentTheme.mountain2} transform skew-y-3`} />
            <div className={`absolute bottom-0 w-full h-80 ${currentTheme.mountain3} transform -skew-y-3`} />
          </div>
        </div>

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
              className={`${currentTheme.button} px-8 py-3 rounded-full font-semibold transition-colors flex items-center space-x-2 shadow-lg`}
            >
              <User className="w-5 h-5" />
              <span>Get Started</span>
            </button>
            <button className={`border-2 px-8 py-3 rounded-full font-semibold transition-colors shadow-lg ${currentTheme.buttonOutline}`}>
              Learn More
            </button>
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

export default LandingPage;
