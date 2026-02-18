import React, { useState, useEffect } from 'react';
import { BookHeart, Moon, Sun, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
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

const themes = {
  dark: {
    background: 'from-[#020617] via-[#0f172a] to-[#1e293b]',
    text: 'text-[#F8FAFC]',
    subtext: 'text-[#94A3B8]',
    mountain1: 'bg-[#0f172a]',
    mountain2: 'bg-[#1e293b]',
    mountain3: 'bg-[#334155]',
    button: 'backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] active:scale-95 transition-all duration-300',
    buttonOutline: 'backdrop-blur-xl bg-transparent border border-white/20 text-white hover:bg-white/10 active:scale-95 transition-all duration-300',
  },
  light: {
    background: 'from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
    text: 'text-[#0f172a]',
    subtext: 'text-[#334155]',
    mountain1: 'bg-[#7DD3FC]',
    mountain2: 'bg-[#38BDF8]',
    mountain3: 'bg-[#0EA5E9]',
    button: 'backdrop-blur-xl bg-white/30 border border-white/40 text-[#0f172a] hover:bg-white/50 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300',
    buttonOutline: 'backdrop-blur-xl bg-white/10 border border-white/40 text-[#0f172a] hover:bg-white/30 active:scale-95 transition-all duration-300',
  },
};

function App() {
  const [isDark, setIsDark] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { isAuthenticated, isUnlocked, unlock } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  const handleUnlock = async (password) => {
    setIsUnlocking(true);
    setUnlockError('');
    try {
      await unlock(password);
      // Explicitly navigate to diary after unlock, replacing the current history entry
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
    // Clear state so refresh doesn't re-open
    window.history.replaceState({}, document.title);
  };

  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true);
    }
  }, [location.state]);

  const currentTheme = isDark ? themes.dark : themes.light;
  const particles = React.useMemo(() => [...Array(30)].map((_, i) => ({
    id: i,
    initialX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
    initialY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 7
  })), []);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.background} ${currentTheme.text} overflow-hidden font-sans bg-noise selection:bg-cyan-500/30`}>
      {location.pathname !== '/diary' && (
        <nav className="absolute top-0 w-full p-6 z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center bg-white/5 backdrop-blur-2xl rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center space-x-2 text-white">
                <BookHeart className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-xl sm:text-2xl font-bold tracking-tight">MyDiary</span>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors text-white sm:hidden"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-8 text-sm sm:text-base text-white font-medium w-full sm:w-auto justify-center sm:justify-end">
              <Link to="/" className="hover:text-cyan-300 transition-colors">Home</Link>
              <Link to="/features" className="hover:text-cyan-300 transition-colors">Features</Link>
              <Link to="/about" className="hover:text-cyan-300 transition-colors">About</Link>
              <Link to="/contact" className="hover:text-cyan-300 transition-colors">Contact</Link>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors text-white hidden sm:block"
              >
                {isDark ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={
          <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center">
            <motion.div
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -50, 50, 0],
                scale: [1, 1.3, 0.9, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] ${isDark ? 'bg-indigo-600/40 mix-blend-screen' : 'bg-blue-300/60 mix-blend-multiply'}`}
            />
            <motion.div
              animate={{
                x: [0, -70, 30, 0],
                y: [0, 80, -40, 0],
                scale: [1, 1.2, 0.8, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[100px] ${isDark ? 'bg-cyan-700/30 mix-blend-screen' : 'bg-cyan-200/60 mix-blend-multiply'}`}
            />
            <motion.div
              animate={{
                x: [0, 50, -50, 0],
                y: [0, 50, -50, 0],
                scale: [1, 1.1, 0.9, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] ${isDark ? 'bg-purple-800/20 mix-blend-screen' : 'bg-purple-300/40 mix-blend-multiply'}`}
            />

            <div className="absolute top-24 right-8 sm:top-28 sm:right-32 z-10 pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-28 h-28 sm:w-40 sm:h-40"
              >
                {isDark ? (
                  <Moon className="w-full h-full text-[#E1E7FF] drop-shadow-[0_0_30px_rgba(225,231,255,0.4)]" />
                ) : (
                  <Sun className="w-full h-full text-amber-100 drop-shadow-[0_0_40px_rgba(251,191,36,0.6)]" />
                )}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 ${isDark ? 'bg-[#E1E7FF]' : 'bg-amber-300'}`} />
              </motion.div>
            </div>


            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{
                    x: p.initialX,
                    y: p.initialY,

                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    y: [null, Math.random() * -150 - 50],
                    opacity: [0, Math.random() * 0.6 + 0.2, 0],
                    scale: [0, Math.random() * 1.5 + 0.5, 0]
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay: p.delay

                  }}
                  className={`absolute rounded-full
                    ${i % 4 === 0 ? 'w-1 h-1' : i % 4 === 1 ? 'w-1.5 h-1.5' : i % 4 === 2 ? 'w-2 h-2' : 'w-3 h-3 blur-[1px]'}
                    ${isDark ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white shadow-[0_0_4px_white]'}`}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto mt-[-10vh]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center"
              >
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 tracking-tight leading-tight drop-shadow-2xl">
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white to-slate-400' : 'from-slate-800 to-slate-600'}`}>
                    Your Life,
                  </span>
                  <br />
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-cyan-300 to-indigo-400' : 'from-blue-600 to-cyan-500'}`}>
                    Reimagined.
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className={`text-lg sm:text-xl md:text-2xl mb-12 max-w-2xl text-center ${isDark ? 'text-slate-300' : 'text-slate-600'} font-light leading-relaxed`}
              >
                Experience the most immersive digital diary. Capture moments, thoughts, and dreams in a secure sanctuary that feels as real as ink on paper.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full sm:w-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (isAuthenticated && isUnlocked) ? navigate('/diary') : setShowLogin(true)}
                  className={`${currentTheme.button} px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all flex items-center gap-3 backdrop-blur-xl group relative overflow-hidden w-full sm:w-auto justify-center`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <User className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Get Started</span>
                </motion.button>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/learn-more" className={`${currentTheme.buttonOutline} px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all flex items-center justify-center w-full sm:w-auto`}>
                    Learn More
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            <div className="absolute bottom-0 w-full pointer-events-none z-0">
              <svg className="w-full h-32 sm:h-48 md:h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientPath" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isDark ? '#1B2942' : '#7EB6E6'} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={isDark ? '#0f172a' : '#4B92D4'} stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <motion.path
                  fill={isDark ? '#1B2942' : '#7EB6E6'}
                  fillOpacity="0.3"
                  initial={{ d: "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
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
                  fillOpacity="0.5"
                  initial={{ d: "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
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
                  fillOpacity="0.8"
                  initial={{ d: "M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
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

        <Route path="/diary" element={
          <ProtectedRoute>
            <DiaryPage currentTheme={currentTheme} isDark={isDark} setIsDark={setIsDark} />
          </ProtectedRoute>
        } />
        <Route path="/features" element={<Features currentTheme={currentTheme} isDark={isDark} />} />
        <Route path="/learn-more" element={<LearnMore currentTheme={currentTheme} isDark={isDark} />} />
        <Route path="/contact" element={<Contact currentTheme={currentTheme} isDark={isDark} />} />
        <Route path="/about" element={<About currentTheme={currentTheme} isDark={isDark} />} />
        <Route path="/verify-login" element={<VerifyLogin />} />

      </Routes>

      {
        successMessage && (
          <SuccessAnimation
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />
        )
      }

      {
        showLogin && (
          <Login
            onClose={() => setShowLogin(false)}
            switchToSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
            currentTheme={currentTheme}
            isDark={isDark}
            onLoginSuccess={() => handleLoginSuccess("Welcome Back!")}
          />
        )
      }
      {
        isAuthenticated && !isUnlocked && (
          <UnlockModal
            onUnlock={handleUnlock}
            error={unlockError}
            isUnlocking={isUnlocking}
          />
        )
      }
      {
        showSignup && (
          <Signup
            onClose={() => setShowSignup(false)}
            switchToLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
            currentTheme={currentTheme}
            isDark={isDark}
            onLoginSuccess={() => handleLoginSuccess("Account Created Successfully!")}
          />
        )
      }
      <GlobalDialog isDark={isDark} />
    </div >
  );
}

export default App;
