import React, { useState, useEffect } from 'react';
import { BookHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import LandingPage from './Pages/Landingpage';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import DiaryPage from './Pages/Dairypage';
import Features from './Pages/Features';
import LearnMore from './Pages/LearnMore';
import Contact from './Pages/Contact';
import About from './Pages/About';
import VerifyLogin from './Pages/VerifyLogin';
import SuccessAnimation from './components/SuccessAnimation';
import GlobalDialog from './components/GlobalDialog';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UnlockModal from './components/UnlockModal';

import { useTheme } from './context/ThemeContext';
import GlobalBackground from './components/ui/GlobalBackground';
import PageTransition from './components/ui/PageTransition';
import ThemeToggle from './components/ui/ThemeToggle';

function App() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { isAuthenticated, isUnlocked, unlock } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  // Navbar scroll reactivity
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUnlock = async (password) => {
    setIsUnlocking(true);
    setUnlockError('');
    try {
      await unlock(password);
      navigate('/diary', { replace: true });
    } catch (err) {
      setUnlockError(err.message);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleLoginSuccess = (message) => {
    setSuccessMessage(message);
    setShowLogin(false);
    setShowSignup(false);
    window.history.replaceState({}, document.title);
  };

  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen overflow-hidden relative">
      <GlobalBackground />

      {location.pathname !== '/diary' && (
        <motion.nav
          className="fixed top-0 w-full z-50 p-6 flex justify-center"
          initial={false}
          animate={{
            paddingTop: isScrolled ? '1rem' : '1.5rem',
            paddingBottom: isScrolled ? '1rem' : '1.5rem',
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-7xl flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center rounded-2xl px-4 py-3 sm:px-6 sm:py-4 transition-all duration-300"
            animate={{
              backgroundColor: isScrolled ? (isDark ? 'rgba(19, 17, 28, 0.8)' : 'rgba(255, 248, 240, 0.8)') : 'transparent',
              backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
              borderColor: isScrolled ? 'var(--color-border)' : 'transparent',
              borderWidth: isScrolled ? '1px' : '0px',
              boxShadow: isScrolled ? '0 4px 30px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <div className="flex items-center justify-between w-full sm:w-auto">
              <Link to="/" className="flex items-center space-x-2 text-[var(--color-primary)] hover:text-[var(--color-highlight)] transition-colors">
                <BookHeart className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-xl sm:text-2xl font-bold tracking-tight">Digital Diary</span>
              </Link>
              <div className="sm:hidden ml-4">
                <ThemeToggle />
              </div>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-8 text-sm sm:text-base font-medium w-full sm:w-auto justify-center sm:justify-end">
              <Link to="/" className="text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors cursor-pointer">Home</Link>
              <Link to="/features" className="text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors cursor-pointer">Features</Link>
              <Link to="/about" className="text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors cursor-pointer">About</Link>
              <Link to="/contact" className="text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors cursor-pointer">Contact</Link>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        </motion.nav>
      )}

      {/* Main Content Area */}
      <div className={`${location.pathname !== '/diary' ? 'pt-32' : ''} relative z-10 w-full min-h-screen`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage setShowLogin={setShowLogin} /></PageTransition>} />
            <Route path="/diary" element={
              <ProtectedRoute>
                <PageTransition><DiaryPage isDark={isDark} /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/features" element={<PageTransition><Features isDark={isDark} /></PageTransition>} />
            <Route path="/learn-more" element={<PageTransition><LearnMore isDark={isDark} /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact isDark={isDark} /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About isDark={isDark} /></PageTransition>} />
            <Route path="/verify-login" element={<PageTransition><VerifyLogin /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {successMessage && (
          <SuccessAnimation
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && (
          <Login
            onClose={() => setShowLogin(false)}
            switchToSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
            isDark={isDark}
            onLoginSuccess={() => handleLoginSuccess("Welcome Back!")}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAuthenticated && !isUnlocked && (
          <UnlockModal
            onUnlock={handleUnlock}
            error={unlockError}
            isUnlocking={isUnlocking}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSignup && (
          <Signup
            onClose={() => setShowSignup(false)}
            switchToLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
            isDark={isDark}
            onLoginSuccess={() => handleLoginSuccess("Account Created Successfully!")}
          />
        )}
      </AnimatePresence>
      <GlobalDialog isDark={isDark} />
    </div>
  );
}

export default App;
