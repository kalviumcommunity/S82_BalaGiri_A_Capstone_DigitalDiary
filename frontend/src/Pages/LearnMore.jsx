import React from 'react';
import { BookHeart } from 'lucide-react';

function LearnMore({ currentTheme }) {
  // Fallback colors if currentTheme not provided
  const text = currentTheme?.text || 'text-white';
  const subtext = currentTheme?.subtext || 'text-gray-300';
  const background = currentTheme?.background || 'from-gray-900 to-gray-800';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${background} px-6 py-24 flex justify-center`}>
      {/* White-ish container with rounded corners and shadow */}
      <div className="max-w-4xl bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-lg p-10 space-y-10 text-left">
        <div className={`flex items-center space-x-3 text-4xl font-bold ${text}`}>
          <BookHeart className="w-8 h-8" />
          <h1>Digital Diary Features</h1>
        </div>

        <div className="space-y-6 text-lg">
          <div>
            <h2 className={`text-2xl font-semibold ${text}`}>📝 Diary Entry Management</h2>
            <ul className={`${subtext} list-disc list-inside`}>
              <li>🧾 Title, Content, Mood, Date</li>
              <li>🖼️ Upload multiple photos</li>
              <li>🎙️ Record & attach audio</li>
            </ul>
          </div>

          <div>
            <h2 className={`text-2xl font-semibold ${text}`}>🔍 Search & View Entries</h2>
            <ul className={`${subtext} list-disc list-inside`}>
              <li>🔎 Real-time search by title</li>
              <li>📅 View recent entries sorted by date</li>
            </ul>
          </div>

          <div>
            <h2 className={`text-2xl font-semibold ${text}`}>🧰 CRUD Operations</h2>
            <ul className={`${subtext} list-disc list-inside`}>
              <li>✅ Create - done</li>
              <li>🔁 Update - done via modal</li>
              <li>❌ Delete - planned</li>
              <li>🔎 Read - search and view supported</li>
            </ul>
          </div>

          <div>
            <h2 className={`text-2xl font-semibold ${text}`}>💻 Tech Stack</h2>
            <p className={`${subtext} font-semibold`}>Frontend:</p>
            <ul className={`${subtext} list-disc list-inside`}>
              <li>React + Tailwind CSS</li>
              <li>lucide-react icons</li>
              <li>NewEntryModal component</li>
              <li>Audio recording via Web APIs</li>
              <li>FormData API for file handling</li>
            </ul>
            <p className={`${subtext} font-semibold mt-2`}>Backend:</p>
            <ul className={`${subtext} list-disc list-inside`}>
              <li>Node.js + Express</li>
              <li>MongoDB + Mongoose</li>
              <li>Multer for file upload</li>
              <li>JWT for authentication</li>
              <li>Static file serving via /uploads</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearnMore;
