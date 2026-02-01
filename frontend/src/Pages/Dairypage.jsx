import React, { useState, useEffect } from 'react';
import { PenSquare, Calendar, Search, Trash2, Pencil, X, ChevronDown, ChevronRight } from 'lucide-react';
import NewEntryModal from '../components/NewEntry';
import { useNavigate } from 'react-router-dom';
import CalendarView from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../customCalendar.css'; // We will create this for styling

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
  const bgOverlay = isDark ? 'bg-white/10' : 'bg-white/80';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const calendarTheme = isDark ? 'dark-calendar' : 'light-calendar';

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
      if (err.message === 'Session expired') {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/');
      }
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
  const [selectedDate, setSelectedDate] = useState(null);

  const onDateChange = (date) => {
    // If clicking already selected date, clear filter
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood ? entry.mood === selectedMood : true;

    let matchesDate = true;
    if (selectedDate) {
      // entry.date is YYYY-MM-DD string
      const entryDateInfo = new Date(entry.date);
      // Compare YYYY-MM-DD parts to avoid timezone issues with exact TS comparison
      // Actually entry.date is stored as string 'YYYY-MM-DD' from the input type='date'
      // So we can just compare that string with selectedDate formatted similarly
      // Or ensure both are treated as local dates.
      // Let's rely on simple string matching for 'YYYY-MM-DD' if possible or standard date comparison
      const selectedDateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format in CA locale usually
      matchesDate = entry.date === selectedDateStr;
    }

    return matchesSearch && matchesMood && matchesDate;
  });

  // Group entries by Month Year
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(entry);
    return acc;
  }, {});

  return (
    <div className={`pt-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen ${isDark ? 'bg-[#4E71FF]/0' : ''}`}> {/* bg handled by App wrapper mostly */}
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${currentTheme?.mode === 'dark' ? 'text-black' : 'text-white'}`}>
          My Diary
        </h1>
        <button
          onClick={() => {
            setIsNewEntryOpen(true);
            setEntryToEdit(null);
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 shadow-lg"
        >
          <PenSquare className="w-5 h-5" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar: Filters & Calendar */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`${bgOverlay} backdrop-blur-xl rounded-3xl p-6 shadow-xl border ${borderColor}`}>
            <h3 className={`text-xl font-bold mb-4 ${text} flex items-center`}>
              <Calendar className="w-5 h-5 mr-2" /> Calendar
            </h3>
            <div className={`custom-calendar-container ${calendarTheme}`}>
              <CalendarView
                onChange={onDateChange}
                value={selectedDate}
                className="w-full rounded-xl border-none text-black bg-white/80"
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const dateStr = date.toLocaleDateString('en-CA');
                    const hasEntry = entries.some(e => e.date === dateStr);
                    return hasEntry ? <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mx-auto mt-1"></div> : null;
                  }
                }}
              />
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 w-full text-center"
              >
                Clear Date Filter
              </button>
            )}
          </div>

          <div className={`${bgOverlay} backdrop-blur-xl rounded-3xl p-6 shadow-xl border ${borderColor}`}>
            <div className="relative mb-4">
              <Search className={`absolute left-4 top-3 w-5 h-5 ${subtext}`} />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${isDark ? 'bg-black/20' : 'bg-white/50'} ${text} placeholder:${subtext} focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all border border-transparent`}
              />
            </div>

            <div>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-black/20' : 'bg-white/50'} ${text} focus:outline-none focus:ring-2 focus:ring-cyan-400/50 appearance-none border border-transparent`}
              >
                <option value="" className="text-gray-800">All Moods</option>
                {[...new Set(entries.map(e => e.mood))].filter(Boolean).map(mood => (
                  <option key={mood} value={mood} className="text-gray-800">{mood}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Area: Entry List */}
        <div className="lg:col-span-2 space-y-8">
          {Object.keys(groupedEntries).length === 0 ? (
            <div className={`${bgOverlay} backdrop-blur-xl rounded-3xl p-12 text-center border ${borderColor}`}>
              <p className={`text-xl ${subtext}`}>No entries found for this filter.</p>
              <button onClick={() => { setSearchTerm(''); setSelectedMood(''); setSelectedDate(null); }} className="mt-4 text-cyan-400 font-semibold hover:underline">Clear all filters</button>
            </div>
          ) : Object.entries(groupedEntries).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([monthYear, monthEntries]) => (
            <div key={monthYear} className="animate-fade-in">
              <h3 className={`text-2xl font-bold mb-4 ${text} opacity-90 pl-2 border-l-4 border-cyan-400`}>{monthYear}</h3>
              <div className="grid gap-6">
                {monthEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className={`group rounded-2xl p-6 transition-all border ${borderColor} shadow-lg hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden`}
                    style={{ backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}
                    onClick={(e) => {
                      if (e.target.closest('button')) return;
                      setViewEntry(entry);
                    }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => setEntryToEdit(entry)} title="Edit" className="p-2 bg-white/10 rounded-full hover:bg-white/30 text-yellow-400 backdrop-blur-md">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(entry._id)} title="Delete" className="p-2 bg-white/10 rounded-full hover:bg-red-500/30 text-red-400 backdrop-blur-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <h2 className={`text-2xl font-bold ${text} tracking-tight pr-12 line-clamp-1`}>{entry.title}</h2>
                    </div>

                    <div className="flex items-center gap-3 mb-4 text-sm">
                      <span className={`flex items-center ${subtext}`}>
                        <Calendar className="w-4 h-4 mr-1 opacity-70" />
                        {entry.date}
                      </span>
                      {entry.mood && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20`}>
                          {entry.mood}
                        </span>
                      )}
                    </div>

                    <p className={`${subtext} line-clamp-3 leading-relaxed opacity-90`}>{entry.content}</p>

                    {(entry.photos?.length > 0 || entry.audio) && (
                      <div className="mt-4 flex gap-2">
                        {entry.photos?.length > 0 && <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">Has Photos</span>}
                        {entry.audio && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Has Audio</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry view modal */}
      {viewEntry && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className={`bg-[#1e293b] rounded-3xl p-8 max-w-3xl w-full relative shadow-2xl overflow-y-auto max-h-[90vh] border border-white/10 text-white`}>
            <button
              onClick={() => setViewEntry(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-4xl font-bold mb-2 tracking-tight">{viewEntry.title}</h2>
            <div className="flex items-center space-x-4 mb-8 text-sm text-gray-400 border-b border-white/5 pb-6">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {viewEntry.date}</span>
              {viewEntry.mood && <span className="bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20">{viewEntry.mood}</span>}
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-200">{viewEntry.content}</p>
            </div>

            {/* Photos */}
            {viewEntry.photos && viewEntry.photos.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {viewEntry.photos.map((photoUrl, idx) => (
                    <img
                      key={idx}
                      src={`${import.meta.env.VITE_BACKEND_URL}${photoUrl}`}
                      alt={`Diary photo ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer border border-white/5"
                      onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}${photoUrl}`, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Audio */}
            {viewEntry.audio && (
              <div className="mb-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">Voice Note</p>
                <audio controls className="w-full custom-audio">
                  <source src={`${import.meta.env.VITE_BACKEND_URL}${viewEntry.audio}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-4">
              <button onClick={() => { setEntryToEdit(viewEntry); setViewEntry(null); }} className="px-6 py-2 bg-yellow-600/20 text-yellow-500 rounded-lg hover:bg-yellow-600/30 font-medium transition-colors">Edit Entry</button>
            </div>
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