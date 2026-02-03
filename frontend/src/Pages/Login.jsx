import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import FailureAnimation from '../components/FailureAnimation';
import { useDialog } from '../context/DialogContext';

const Login = ({ onClose, switchToSignup, currentTheme, isDark, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const controls = useAnimation();
  const { alert } = useDialog();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (!data.token) {
          setError("Login succeeded but no token received!");
          return;
        }
        localStorage.setItem("token", data.token);
        navigate("/diary");
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          onClose();
        }
      } else {
        // Trigger shake animation on failure
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.5 }
        });
        setError(data.message || "Login failed");
      }
    } catch (err) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      });
      setError("Something went wrong during login.");
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      });
      setError("Please enter your email address.");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        await alert("Magic link sent! Check your email.");
      } else {
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.5 }
        });
        const data = await res.json();
        setError(data.message || "Failed to send magic link");
      }
    } catch (err) {
      console.error(err);
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      });
      setError("Something went wrong sending the magic link.");
    }
  };


  const overlayBg = isDark ? 'bg-[#1B2A4A]/60 border border-white/10' : 'bg-white/60 border border-white/40';
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const inputBg = isDark ? 'bg-black/20 focus:bg-black/30' : 'bg-white/40 focus:bg-white/60';
  const placeholderColor = isDark ? 'placeholder-white/60' : 'placeholder-slate-500';

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50">
      {error && <FailureAnimation message={error} onClose={() => setError(null)} />}
      <motion.div
        animate={controls}
        className={`${overlayBg} backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-full max-w-[400px] mx-4 relative shadow-2xl transition-all ${textColor}`}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors ${textColor}`}>
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">Welcome Back</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-5 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all border border-transparent focus:border-cyan-400/30`}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-5 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all border border-transparent focus:border-cyan-400/30`}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors ${textColor} opacity-70 hover:opacity-100`}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Login
          </button>

          <button
            onClick={handleMagicLink}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all border ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-slate-300 hover:bg-black/5'} ${textColor}`}
          >
            Continue with Magic Link
          </button>
        </div>

        <p className="mt-6 text-center text-sm opacity-80">
          Don't have an account?{" "}
          <span
            onClick={switchToSignup}
            className="font-bold underline cursor-pointer hover:text-cyan-400 transition-colors"
          >
            Register
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;