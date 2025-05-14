import React, { useState, useEffect } from 'react';
import { PenSquare, Calendar, Search } from 'lucide-react';
import NewEntryModal from '../components/NewEntry';

function DiaryPage({ currentTheme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState([]);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  const isDark = currentTheme?.text?.includes('E1E7FF');
  const text = isDark ? 'text-white' : 'text-slate-800';
  const subtext = isDark ? 'text-slate-200' : 'text-slate-600';
  const bgOverlay = isDark ? 'bg-[#1B2942]/60' : 'bg-white/80';
  const borderColor = isDark ? 'border-white/20' : 'border-slate-200';
  const button = isDark
    ? 'bg-[#E1E7FF] text-[#1B2942] hover:bg-[#B8C4E8]'
    : 'bg-[#1B2942] text-white hover:bg-[#2C4870]';

  useEffect(() => {
    fetchLatestEntries();
  }, []);

  const fetchLatestEntries = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/diary/latest`);
      const data = await res.json();
      setEntries(data || []);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`pt-24 px-6 max-w-7xl mx-auto min-h-screen ${
        isDark ? 'bg-[#4E71FF]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${currentTheme?.mode === 'dark' ? 'text-black' : 'text-white'}`}>
          My Diary
        </h1>
        <button
          onClick={() => setIsNewEntryOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <PenSquare className="w-5 h-5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Search */}
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

      {/* Diary Entries */}
      <div className="grid gap-6">
        {filteredEntries.map((entry) => (
          <div
            key={entry._id}
            className={`rounded-2xl p-6 transition-all cursor-pointer border ${borderColor} shadow-[0_4px_30px_rgba(0,0,0,0.1)] ${bgOverlay} hover:brightness-110`}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-2xl font-semibold ${text}`}>{entry.title}</h2>
              <div className="flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full">
                <Calendar className={`w-4 h-4 ${text}`} />
                <span className={text}>{entry.date}</span>
              </div>
            </div>
            <p className={`${subtext} line-clamp-3`}>{entry.content}</p>
            <div className="mt-4">
              <span className={`${text} bg-black/10 text-sm px-3 py-1 rounded-full border ${borderColor}`}>
                {entry.mood}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Entry Modal */}
      {isNewEntryOpen && (
        <NewEntryModal
          onClose={() => setIsNewEntryOpen(false)}
          onSave={fetchLatestEntries}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
}

export default DiaryPage;
