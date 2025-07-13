import React from "react";
import { CheckCircle, Lock, Mic, Image, Calendar } from "lucide-react";

const About = () => {
  return (
    <section className="max-w-4xl mx-auto p-6 text-gray-800 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-center">📓 Digital Diary</h1>

      <p className="mb-6 text-lg text-center">
        A full-stack <strong>MERN</strong> capstone project to create a secure and visually appealing digital diary experience.
      </p>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🌐 Live URLs</h2>
        <ul className="list-disc list-inside">
          <li>
            ✅ <strong>Backend:</strong>{" "}
            <a
              href="https://s82-balagiri-a-capstone-digitaldiary-2.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Render Deploy
            </a>
          </li>
          <li>
            🚧 <strong>Frontend:</strong> Coming soon on Vercel/Netlify
          </li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">📌 Features</h2>
        <ul className="space-y-2">
          <li><CheckCircle className="inline mr-2 text-green-500" />Secure registration & login (bcrypt + JWT)</li>
          <li><CheckCircle className="inline mr-2 text-green-500" />Protected routes with token auth</li>
          <li><CheckCircle className="inline mr-2 text-green-500" />Add diary entries with title, content, mood, and date</li>
          <li><Image className="inline mr-2 text-purple-500" />Upload & attach multiple images</li>
          <li><Mic className="inline mr-2 text-red-500" />Record & attach audio files</li>
          <li><CheckCircle className="inline mr-2 text-green-500" />Search entries by title</li>
          <li><CheckCircle className="inline mr-2 text-green-500" />View recent entries sorted by date</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🧰 Tech Stack</h2>
        <p><strong>Frontend:</strong> React, Tailwind CSS, lucide-react, MediaRecorder API</p>
        <p><strong>Backend:</strong> Node.js, Express, MongoDB, Mongoose, Multer, JWT</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🔒 Security</h2>
        <ul className="list-disc list-inside">
          <li><Lock className="inline mr-2" />JWT Auth & secure routing</li>
          <li>Form validation and environment-based configs</li>
          <li><Lock className="inline mr-2" />Planned: AES-256 encryption for entries & media</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">✨ Future Plans</h2>
        <ul className="list-disc list-inside">
          <li><Calendar className="inline mr-2" />Calendar-based filters & views</li>
          <li>Secure AES-256 encryption for sensitive data</li>
          <li>Entry deletion support</li>
          <li>Monthly/yearly entry grouping</li>
          <li>Media storage optimization with Cloudinary or S3</li>
        </ul>
      </div>

      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold">🙌 Author</h2>
        <p>
          Bala Giri (aka Novachrono) <br />
          Capstone Project | Kalvium S82 <br />
          📧 <a href="mailto:balagiri702@gmail.com" className="text-blue-400 underline">balagiri702@gmail.com</a>
        </p>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        💡 Feel free to fork, enhance, or contribute to this project!
      </div>
    </section>
  );
};

export default About;
