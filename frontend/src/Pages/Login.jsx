import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { X } from 'lucide-react';

const Login = ({ onClose, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Login successful!");
        localStorage.setItem("token", data.token);
        navigate("/diary"); 
        onClose(); 
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong");
    }
  };
  

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 text-white w-[350px] relative shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 text-white">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-white/20 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-white/20 text-white"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-300 text-blue-900 py-2 rounded font-bold hover:bg-blue-400"
        >
          Login
        </button>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <span
            onClick={switchToSignup}
            className="text-blue-300 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;