import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus("No token provided.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-link`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    setStatus("Login successful! Redirecting...");
                    setTimeout(() => navigate('/diary'), 1500);
                } else {
                    setStatus(data.message || "Verification failed");
                }
            } catch (err) {
                console.error(err);
                setStatus("Something went wrong verifying the link");
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-white/20">
                <h2 className="text-3xl font-bold mb-4 animate-pulse">{status}</h2>
                <div className="flex justify-center mt-6">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-cyan-400 rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    );
};

export default VerifyLogin;
