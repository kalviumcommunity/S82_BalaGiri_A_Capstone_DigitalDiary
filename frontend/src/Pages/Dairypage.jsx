import React, { useState, useEffect } from 'react';
import { PenSquare, Calendar, Search, Trash2, Pencil, X } from 'lucide-react';
import NewEntryModal from '../components/NewEntry';
import { useNavigate } from 'react-router-dom';

function DiaryPage({ currentTheme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState([]);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const navigate = useNavigate();

  const isDark = currentTheme?.text?.includes('E1E7FF');
  const text = isDark ? 'text-white' : 'text-slate-800';
  const subtext = isDark ? 'text-white/80' : 'text-slate-600';
  const bgOverlay = isDark ? 'bg-white/20' : 'bg-white/80';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first.');
      navigate('/');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/diary/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch entries');
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
      alert('Session expired. Please login again.');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to delete.');
      navigate('/');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/diary/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchEntries();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete entry.');
    }
  };

  const [selectedMood, setSelectedMood] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood ? entry.mood === selectedMood : true;
    const matchesDate = selectedDate ? entry.date === selectedDate : true;
    return matchesSearch && matchesMood && matchesDate;
  });

  return (
    <div className={`pt-24 px-6 max-w-7xl mx-auto min-h-screen ${isDark ? 'bg-[#4E71FF]' : ''}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${currentTheme?.mode === 'dark' ? 'text-black' : 'text-white'}`}>
          My Diary
        </h1>
        <button
          onClick={() => {
            setIsNewEntryOpen(true);
            setEntryToEdit(null);
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <PenSquare className="w-5 h-5" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className={`absolute left-4 top-3 w-5 h-5 ${subtext}`} />
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-lg ${bgOverlay} backdrop-blur-md ${text} placeholder:${subtext} focus:outline-none focus:ring-2 focus:ring-white/30`}
          />
        </div>

        {/* Mood Filter */}
        <div className="min-w-[200px]">
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg ${bgOverlay} backdrop-blur-md ${text} focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none`}
          >
            <option value="" className="text-slate-800">All Moods</option>
            {[...new Set(entries.map(e => e.mood))].filter(Boolean).map(mood => (
              <option key={mood} value={mood} className="text-slate-800">{mood}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="min-w-[200px]">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg ${bgOverlay} backdrop-blur-md ${text} placeholder:${subtext} focus:outline-none focus:ring-2 focus:ring-white/30`}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredEntries.map((entry) => (
          <div
            key={entry._id}
            className={`rounded-2xl p-6 transition-all border ${borderColor} shadow hover:${bgOverlay}`}
            style={{ backgroundColor: '#F2F2F2', cursor: 'pointer' }}
            onClick={(e) => {
              // Prevent opening when clicking edit/delete
              if (e.target.closest('button')) return;
              setViewEntry(entry);
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-2xl font-semibold ${text}`}>{entry.title}</h2>
              <div className={`flex items-center space-x-2 ${bgOverlay} px-3 py-1 rounded-full`}>
                <Calendar className={`w-4 h-4 ${text}`} />
                <span className={text}>{entry.date}</span>
              </div>
            </div>
            <p className={`${subtext} line-clamp-3`}>{entry.content}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`${text} ${bgOverlay} text-sm px-3 py-1 rounded-full border ${borderColor}`}>
                {entry.mood}
              </span>
              <div className="flex space-x-3">
                <button onClick={() => setEntryToEdit(entry)} title="Edit">
                  <Pencil className="w-5 h-5 text-yellow-600" />
                </button>
                <button onClick={() => handleDelete(entry._id)} title="Delete">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Entry view modal */}
      {viewEntry && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
          <div className={`bg-white/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 max-w-2xl w-full relative shadow-2xl overflow-y-auto max-h-[90vh] ${text}`}>
            <button
              onClick={() => setViewEntry(null)}
              className={`absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors ${text}`}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold mb-2">{viewEntry.title}</h2>
            <div className="flex items-center space-x-4 mb-6 text-sm opacity-70">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {viewEntry.date}</span>
              <span className="bg-black/10 px-2 py-1 rounded-md">{viewEntry.mood}</span>
            </div>

            <p className="mb-6 whitespace-pre-wrap text-lg leading-relaxed opacity-90">{viewEntry.content}</p>

            {/* Photos */}
            {viewEntry.photos && viewEntry.photos.length > 0 && (
              <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {viewEntry.photos.map((photoUrl, idx) => (
                  <img
                    key={idx}
                    src={`${import.meta.env.VITE_BACKEND_URL}${photoUrl}`}
                    alt={`Diary photo ${idx + 1}`}
                    className="w-full h-32 md:h-48 object-cover rounded-xl shadow-sm hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}${photoUrl}`, '_blank')}
                  />
                ))}
              </div>
            )}

            {/* Audio */}
            {viewEntry.audio && (
              <div className="mb-4 bg-black/5 p-4 rounded-xl">
                <p className="text-sm font-semibold mb-2 opacity-70">Voice Note</p>
                <audio controls className="w-full">
                  <source src={`${import.meta.env.VITE_BACKEND_URL}${viewEntry.audio}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New/Edit Entry Modal */}
      {isNewEntryOpen || entryToEdit ? (
        <NewEntryModal
          onClose={() => {
            setIsNewEntryOpen(false);
            setEntryToEdit(null);
          }}
          onSave={fetchEntries}
          currentTheme={currentTheme}
          entry={entryToEdit}
        />
      ) : null}
    </div>
  );
}

export default DiaryPage;