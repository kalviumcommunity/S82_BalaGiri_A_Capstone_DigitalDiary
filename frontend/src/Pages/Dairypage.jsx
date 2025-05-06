import React, { useState } from 'react';
import { PenSquare, Calendar, Search } from 'lucide-react';

// Sample mock entries
const mockEntries = [
  {
    id: 1,
    title: "First Day of Spring",
    content: "Today marks the beginning of spring. The flowers are starting to bloom...",
    date: "2024-03-20",
    mood: "Happy"
  },
  {
    id: 2,
    title: "Reflection on Goals",
    content: "Looking back at my quarterly goals, I'm proud of the progress...",
    date: "2024-03-19",
    mood: "Thoughtful"
  },
  {
    id: 3,
    title: "Weekend Adventure",
    content: "Went hiking with friends today. The view from the summit was breathtaking...",
    date: "2024-03-18",
    mood: "Excited"
  }
];

function DiaryPage({ currentTheme }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  
  const { text = 'text-black', subtext = 'text-gray-500', button = 'bg-blue-500' } = currentTheme || {};
  const bgOverlay = 'bg-white/80'; // Define your background overlay here
  const bgOverlayHover = 'hover:bg-white/90'; // Hover effect
  const borderColor = 'border-slate-200'; // Define your border color

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
      <h1 className={`text-4xl font-bold ${currentTheme?.mode === 'dark' ? 'text-black' : 'text-white'}`}>
  My Diary
</h1>

        
        <button
          className={`${button} px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2`}
        >
          <PenSquare className="w-5 h-5" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className={`absolute left-4 top-3 w-5 h-5 ${subtext}`} />
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-lg ${bgOverlay} backdrop-blur-md ${text} placeholder:${subtext} focus:outline-none focus:ring-2 focus:ring-white/30`}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {mockEntries.map((entry) => (
          <div
            key={entry.id}
            className={`${bgOverlay} backdrop-blur-md rounded-lg p-6 ${bgOverlayHover} transition-colors cursor-pointer border ${borderColor}`}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-2xl font-semibold ${text}`}>{entry.title}</h2>
              <div className={`flex items-center space-x-2 ${bgOverlay} px-3 py-1 rounded-full`}>
                <Calendar className={`w-4 h-4 ${text}`} />
                <span className={text}>{entry.date}</span>
              </div>
            </div>
            <p className={`${subtext} line-clamp-3`}>{entry.content}</p>
            <div className="mt-4">
              <span className={`${text} ${bgOverlay} text-sm px-3 py-1 rounded-full border ${borderColor}`}>
                {entry.mood}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiaryPage;
