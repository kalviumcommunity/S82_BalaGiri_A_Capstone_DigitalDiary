import React, { useState } from 'react';
import { BookHeart, Moon, Sun, User } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';
import { Link } from 'react-router-dom';

function LandingPage({ isDark, setIsDark, currentTheme }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentTheme.background} text-white overflow-hidden`}>


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

          <Link to="/learn-more">
            <button className={`border-2 px-8 py-3 rounded-full font-semibold transition-colors shadow-lg ${currentTheme.buttonOutline}`}>
              Learn More
            </button>
          </Link>
        </div>
      </div>

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
