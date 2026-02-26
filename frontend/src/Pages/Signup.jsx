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

  const overlayBg = isDark ? 'bg-[#1C1828] border border-[#2E2940]' : 'bg-white border border-[#E8D9C5]';
  const textColor = isDark ? 'text-[#F0E6D3]' : 'text-[#1E0F00]';
  const inputBg = isDark ? 'bg-[#13111C] focus:bg-[#2E2940]/50' : 'bg-[#FAF3E8] focus:bg-white';
  const placeholderColor = isDark ? 'placeholder:text-[#6B6070]' : 'placeholder:text-[#B8A898]';

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50">
      {error && <FailureAnimation message={error} onClose={() => setError(null)} />}
      <motion.div
        animate={controls}
        className={`${overlayBg} backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-full max-w-[400px] mx-4 relative shadow-2xl transition-all ${textColor}`}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${textColor}`}>
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">Create Account</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-5 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-1 focus:ring-[#C4862A] dark:focus:ring-[#C9956A] transition-all border border-transparent focus:border-[#C4862A] dark:focus:border-[#C9956A]`}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-5 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-1 focus:ring-[#C4862A] dark:focus:ring-[#C9956A] transition-all border border-transparent focus:border-[#C4862A] dark:focus:border-[#C9956A]`}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-5 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-1 focus:ring-[#C4862A] dark:focus:ring-[#C9956A] transition-all border border-transparent focus:border-[#C4862A] dark:focus:border-[#C9956A]`}
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
            className="w-full bg-[#7B3F20] dark:bg-[#C9956A] text-white dark:text-[#0D0D1A] shadow-[0_4px_20px_rgba(123,63,32,0.35)] dark:shadow-[0_4px_20px_rgba(201,149,106,0.35)] hover:bg-[#5C2E14] dark:hover:bg-[#E8B86D] py-3.5 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
            className="font-bold underline cursor-pointer hover:text-[#7B3F20] dark:hover:text-[#C9956A] transition-colors"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
