import React, { useState } from 'react';
import { Shield, Loader, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import FailureAnimation from '../components/FailureAnimation';
import { deriveRecoveryKey, decryptMasterKeyRaw, deriveEncryptionKey, derivePasswordKey, encryptMasterKey, createValidator, generateSalt } from '../utils/cryptoUtils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RecoverAccount = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [recoveryKey, setRecoveryKey] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [decryptedKeyMaterial, setDecryptedKeyMaterial] = useState(null);

    const navigate = useNavigate();
    const controls = useAnimation();
    const { login } = useAuth();

    const { theme } = useTheme();
    const isDark = theme === 'dark' || true;

    const handleRecover = async () => {
        try {
            if (!email || !recoveryKey) {
                setError("Email and Recovery Key are required.");
                return;
            }

            setLoading(true);
            setError(null);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

            const metaRes = await fetch(`${apiUrl}/api/auth/recovery-metadata`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (!metaRes.ok) {
                const data = await metaRes.json();
                throw new Error(data.message || "Failed to fetch recovery metadata");
            }

            const { recoveryEncryptedMasterKey, recoveryMasterKeyIV, recoverySalt } = await metaRes.json();

            const recoveryDerivedKey = await deriveRecoveryKey(recoveryKey, recoverySalt);
            const rawMK = await decryptMasterKeyRaw(recoveryDerivedKey, recoveryEncryptedMasterKey, recoveryMasterKeyIV);

            setDecryptedKeyMaterial(rawMK);
            setStep(2);
            setLoading(false);
        } catch (err) {
            console.error("Recovery error:", err);
            setLoading(false);
            controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.5 }
            });
            setError(err.message || "Failed to recover account. Invalid details.");
        }
    };

    const handleResetPassword = async () => {
        try {
            if (!newPassword || newPassword !== confirmPassword) {
                setError("Passwords do not match or are empty.");
                return;
            }

            setLoading(true);
            setError(null);

            const kdfSalt = generateSalt();
            const passwordKey = await derivePasswordKey(newPassword, kdfSalt);

            const { encryptedMasterKey, iv: masterKeyIV } = await encryptMasterKey(decryptedKeyMaterial, passwordKey);

            const hkdfKey = await window.crypto.subtle.importKey(
                "raw",
                decryptedKeyMaterial,
                { name: "HKDF" },
                false,
                ["deriveKey"]
            );
            const validatorHash = await createValidator(hkdfKey);
            const authToken = await deriveEncryptionKey(newPassword);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/auth/reset-password-recovery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password: authToken,
                    kdfSalt,
                    validatorHash,
                    encryptedMasterKey,
                    masterKeyIV
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to reset password");
            }

            await login(email, newPassword);
            setLoading(false);
            navigate('/diary');

        } catch (err) {
            console.error("Reset error:", err);
            setLoading(false);
            controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.5 }
            });
            setError("Failed to set new password");
        }
    };

    const overlayBg = isDark ? 'bg-[#1C1828] border border-[#2E2940]' : 'bg-white border border-[#E8D9C5]';
    const textColor = isDark ? 'text-[#F0E6D3]' : 'text-[#1E0F00]';
    const inputBg = isDark ? 'bg-[#13111C] focus:bg-[#2E2940]/50' : 'bg-[#FAF3E8] focus:bg-white';
    const placeholderColor = isDark ? 'placeholder:text-[#6B6070]' : 'placeholder:text-[#B8A898]';

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-md z-50">
            {error && <FailureAnimation message={error} onClose={() => setError(null)} />}
            <motion.div
                animate={controls}
                className={`${overlayBg} rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 w-full max-w-md mx-4 relative overflow-hidden transition-all text-center ${textColor}`}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#C9956A]" />

                {step === 1 && (
                    <button onClick={() => navigate('/')} className={`absolute top-6 left-6 p-1 rounded-full hover:bg-white/10 transition-colors ${textColor}`}>
                        <ArrowLeft size={24} />
                    </button>
                )}

                <div className="w-16 h-16 bg-[#C9956A]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-[#C9956A]/20">
                    <Shield className="w-8 h-8 text-[#C9956A]" />
                </div>

                {step === 1 ? (
                    <>
                        <h2 className="text-2xl font-bold mb-2 tracking-tight">Recover Account</h2>
                        <p className="text-[#9B8EA0] mb-8 text-sm leading-relaxed">
                            Enter your email and the Recovery Key you saved during signup.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-5 py-3.5 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-1 focus:ring-[#C9956A] focus:border-[#C9956A] transition-all border border-[#2E2940]`}
                            />
                            <textarea
                                placeholder="Enter Recovery Key"
                                value={recoveryKey}
                                onChange={(e) => setRecoveryKey(e.target.value)}
                                rows={3}
                                className={`w-full px-5 py-3.5 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-1 focus:ring-[#C9956A] focus:border-[#C9956A] transition-all border border-[#2E2940] font-mono text-sm`}
                            />
                        </div>

                        <button
                            onClick={handleRecover}
                            disabled={loading}
                            className="w-full mt-8 bg-[#C9956A] text-[#0D0D1A] shadow-[0_4px_20px_rgba(201,149,106,0.35)] hover:bg-[#E8B86D] py-3.5 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader className="animate-spin" size={20} />
                            ) : (
                                "Verify Key"
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2 tracking-tight">Set New Password</h2>
                        <p className="text-[#9B8EA0] mb-8 text-sm leading-relaxed">
                            Your key is correct. Please enter a new password to secure your diary.
                        </p>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`w-full px-5 py-3.5 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-1 focus:ring-[#C9956A] focus:border-[#C9956A] transition-all border border-[#2E2940]`}
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-5 py-3.5 rounded-xl ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-1 focus:ring-[#C9956A] focus:border-[#C9956A] transition-all border border-[#2E2940]`}
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors ${textColor} opacity-70 hover:opacity-100`}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full mt-8 bg-[#C9956A] text-[#0D0D1A] shadow-[0_4px_20px_rgba(201,149,106,0.35)] hover:bg-[#E8B86D] py-3.5 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader className="animate-spin" size={20} />
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default RecoverAccount;
