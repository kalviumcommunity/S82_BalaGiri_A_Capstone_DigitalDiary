// src/components/Signup.jsx
import React from 'react';
import { X } from 'lucide-react';

const Signup = ({ onClose, switchToLogin }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 text-white w-[350px] relative shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 text-white">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
        <input type="text" placeholder="Name" className="w-full p-2 mb-4 rounded bg-white/20 text-white" />
        <input type="email" placeholder="Email" className="w-full p-2 mb-4 rounded bg-white/20 text-white" />
        <input type="password" placeholder="Password" className="w-full p-2 mb-4 rounded bg-white/20 text-white" />
        <button className="w-full bg-blue-300 text-blue-900 py-2 rounded font-bold hover:bg-blue-400">Register</button>
        <p className="mt-4 text-center text-sm">Already have an account? <span onClick={switchToLogin} className="text-blue-300 cursor-pointer hover:underline">Login</span></p>
      </div>
    </div>
  );
};

export default Signup;
