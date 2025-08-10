import React, { useState, useEffect } from 'react';
import { PenSquare, Calendar, Search, Trash2, Pencil } from 'lucide-react';
import NewEntryModal from '../components/NewEntry';
import { useNavigate } from 'react-router-dom';

function DiaryPage({ currentTheme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState([]);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const navigate = useNavigate();

  const isDark = currentTheme?.text?.includes('E1E7FF');
  const text = isDark ? 'text-white' : 'text-slate-800';
  const subtext = isDark ? 'text-white/80' : 'text-slate-600';
  const bgOverlay = isDark ? 'bg-white/20' : 'bg-white/80';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';

  useEffect(() => {
    fetchLatestEntries();
  }, []);

  const fetchLatestEntries = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first.');
      navigate('/');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/diary/latest`, {
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
      fetchLatestEntries();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete entry.');
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredEntries.map((entry) => (
          <div
            key={entry._id}
            className={`rounded-2xl p-6 transition-all border ${borderColor} shadow hover:${bgOverlay}`}
            style={{ backgroundColor: '#F2F2F2' }}
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

      {isNewEntryOpen || entryToEdit ? (
        <NewEntryModal
          onClose={() => {
            setIsNewEntryOpen(false);
            setEntryToEdit(null);
          }}
          onSave={fetchLatestEntries}
          currentTheme={currentTheme}
          entry={entryToEdit}
        />
      ) : null}
    </div>
  );
}

export default DiaryPage;
