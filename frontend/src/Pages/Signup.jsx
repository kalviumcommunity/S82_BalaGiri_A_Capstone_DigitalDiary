import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Loader } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FailureAnimation from '../components/FailureAnimation';
import { useAuth } from '../context/AuthContext';
import { generateMasterKeyHKDF, derivePasswordKey, encryptMasterKey, deriveEncryptionKey, createValidator, generateSalt } from '../utils/cryptoUtils';

const Signup = ({ onClose, switchToLogin, currentTheme, isDark, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const navigate = useNavigate();

  const controls = useAnimation();
  const { login } = useAuth();

  const handleRegister = async () => {
    try {
      if (!username || !email || !password) {
        setError("All fields are required");
        return;
      }

      setIsGeneratingKeys(true);

      setIsGeneratingKeys(true);

      const kdfSalt = generateSalt();
      const passwordKey = await derivePasswordKey(password, kdfSalt);
      const { masterKey, keyMaterial } = await generateMasterKeyHKDF();
      const { encryptedMasterKey, iv: masterKeyIV } = await encryptMasterKey(keyMaterial, passwordKey);
      const validatorHash = await createValidator(masterKey);
      const authToken = await deriveEncryptionKey(password);



      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password: authToken,
          kdfSalt,
          validatorHash,
          encryptedMasterKey,
          masterKeyIV
        })
      });

      const data = await res.json();
      setIsGeneratingKeys(false);

      if (res.ok) {
        await login(email, password);

        navigate("/diary");
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          onClose();
        }
      } else {
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.5 }
        });
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setIsGeneratingKeys(false);
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      });
      setError("Something went wrong during signup.");
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
        <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">Create Account</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-5 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all border border-transparent focus:border-cyan-400/30`}
          />
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

        <div className="mt-8">
          <button
            onClick={handleRegister}
            disabled={isGeneratingKeys}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isGeneratingKeys ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Generating Encryption Keys...</span>
              </>
            ) : (
              "Register"
            )}
          </button>
        </div>


        <p className="mt-6 text-center text-sm opacity-80">
          Already have an account?{" "}
          <span
            onClick={switchToLogin}
            className="font-bold underline cursor-pointer hover:text-cyan-400 transition-colors"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
