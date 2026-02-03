import React, { useState, useEffect } from 'react';
import { PenSquare, Calendar, Search, Trash2, Pencil, X, ChevronDown, ChevronRight, Filter, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NewEntryModal from '../components/NewEntry';
import { useNavigate } from 'react-router-dom';
import CalendarView from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../customCalendar.css'; // We will create this for styling

function DiaryPage({ currentTheme, isDark, setIsDark }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState([]);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  // If isDark is not passed (e.g. standalone test), try to derive it or default to true
  const isDarkMode = isDark !== undefined ? isDark : currentTheme?.text?.includes('E1E7FF');
  const text = isDarkMode ? 'text-white' : 'text-slate-800';
  const subtext = isDarkMode ? 'text-white/80' : 'text-slate-600';
  const bgOverlay = isDarkMode ? 'bg-white/10' : 'bg-white/80';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const calendarTheme = isDarkMode ? 'dark-calendar' : 'light-calendar';

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
      const entryDateInfo = new Date(entry.date);
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
    <div className={`pt-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen ${isDarkMode ? 'bg-[#4E71FF]/0' : ''}`}> {/* bg handled by App wrapper mostly */}
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${text} tracking-tight drop-shadow-sm`}>
          My Diary
        </h1>
        <div className="flex items-center space-x-4 relative">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-xl transition-colors shadow-lg flex items-center justify-center ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-yellow-300' : 'bg-white shadow-md border border-slate-100 text-orange-500 hover:bg-orange-50'} backdrop-blur-md`}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`p-3 rounded-xl transition-colors shadow-lg flex items-center justify-center ${showCalendar || selectedDate ? 'bg-cyan-500 text-white' : isDarkMode ? 'bg-white/10 hover:bg-white/20 text-cyan-400' : 'bg-white shadow-md border border-slate-100 text-cyan-600 hover:bg-cyan-50'} backdrop-blur-md`}
            title="Toggle Calendar"
          >
            <Calendar className="w-5 h-5" />
            {selectedDate && <span className="ml-2 text-sm font-semibold hidden sm:inline">{selectedDate.toLocaleDateString()}</span>}
          </button>

          {/* Calendar Popover */}
          {showCalendar && (
            <div className="absolute top-16 right-0 p-4 z-50 animate-in fade-in zoom-in duration-200">
              <div className={`${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'} rounded-2xl shadow-2xl p-4 border ${borderColor} w-[350px]`}>
                <div className={`custom-calendar-container ${calendarTheme}`}>
                  <CalendarView
                    onChange={(date) => {
                      onDateChange(date);
                      setShowCalendar(false);
                    }}
                    value={selectedDate}
                    className="w-full rounded-xl border-none text-black"
                    tileContent={({ date, view }) => {
                      if (view === 'month') {
                        const dateStr = date.toLocaleDateString('en-CA');
                        const hasEntry = entries.some(e => e.date === dateStr);
                        return hasEntry ? <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mx-auto mt-1"></div> : null;
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="mt-2 w-full text-center text-sm text-gray-500 hover:text-gray-400"
                >
                  Close
                </button>
                {selectedDate && (
                  <button
                    onClick={() => { setSelectedDate(null); setShowCalendar(false); }}
                    className="mt-2 w-full text-center text-sm text-red-400 hover:text-red-300"
                  >
                    Clear Date
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setIsNewEntryOpen(true);
              setEntryToEdit(null);
            }}
            className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            <PenSquare className="w-5 h-5 text-white relative z-10" />
            <span className="text-white relative z-10">New Entry</span>
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Floating Filter Trigger - Bottom Right Custom Style */}
        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ transformOrigin: 'bottom right' }}
          className={`fixed bottom-0 right-0 z-50 p-6 rounded-tl-3xl shadow-2xl backdrop-blur-xl border-t border-l ${isDarkMode ? 'bg-[#0f172a] border-cyan-500/30 shadow-cyan-500/20 text-cyan-400' : 'bg-[#0f172a] border-cyan-500/30 shadow-cyan-500/20 text-cyan-400'} transition-all group`}
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="w-6 h-6" />
        </motion.button>

        {/* Filter Drawer Overlay */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed top-0 right-0 h-full w-80 z-50 p-6 ${isDarkMode ? 'bg-[#1B2A4A]/90 border-l border-white/10' : 'bg-white/90 border-l border-slate-200'} backdrop-blur-xl shadow-2xl overflow-y-auto`}
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className={`text-2xl font-bold ${text}`}>Filters</h3>
                  <button onClick={() => setIsFilterOpen(false)} className={`p-2 rounded-full hover:bg-white/10 ${text}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <Search className={`absolute left-4 top-3.5 w-5 h-5 ${subtext}`} />
                    <input
                      type="text"
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl ${isDarkMode ? 'bg-black/20 focus:bg-black/30' : 'bg-black/5 focus:bg-white'} ${text} placeholder:${subtext} focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all border border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${subtext}`}>Mood</label>
                    <select
                      value={selectedMood}
                      onChange={(e) => setSelectedMood(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl ${isDarkMode ? 'bg-black/20 focus:bg-black/30' : 'bg-black/5 focus:bg-white'} ${text} focus:outline-none focus:ring-2 focus:ring-cyan-400/50 appearance-none border border-transparent`}
                    >
                      <option value="" className="text-gray-800">All Moods</option>
                      {[...new Set(entries.map(e => e.mood))].filter(Boolean).map(mood => (
                        <option key={mood} value={mood} className="text-gray-800">{mood}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {(searchTerm || selectedMood || selectedDate) && (
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedMood(''); setSelectedDate(null); }}
                      className="w-full py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto space-y-8">


          {/* Right Area: Entry List */}
          {Object.keys(groupedEntries).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${bgOverlay} backdrop-blur-2xl rounded-3xl p-16 text-center border ${borderColor} shadow-2xl flex flex-col items-center justify-center min-h-[400px]`}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-8 relative"
              >
                <div className={`p-8 rounded-full ${isDarkMode ? 'bg-indigo-500/10' : 'bg-blue-100'}`}>
                  <Search className={`w-16 h-16 ${isDarkMode ? 'text-indigo-400' : 'text-blue-500'} opacity-80`} />
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-4 h-4 bg-cyan-400 rounded-full animate-ping" />
              </motion.div>

              <h3 className={`text-3xl font-bold mb-3 ${text}`}>No entries found</h3>
              <p className={`text-lg ${subtext} max-w-md mx-auto mb-8 leading-relaxed`}>
                We couldn't find any stories matching your current filters. Try adjusting your search or create a new memory.
              </p>

              <button
                onClick={() => { setSearchTerm(''); setSelectedMood(''); setSelectedDate(null); }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : Object.entries(groupedEntries).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([monthYear, monthEntries]) => (
            <div key={monthYear} className="animate-fade-in">
              <h3 className={`text-2xl font-bold mb-4 ${text} opacity-90 pl-2 border-l-4 border-cyan-400`}>{monthYear}</h3>
              <div className="grid gap-6">
                {monthEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className={`group rounded-3xl p-8 transition-all duration-300 border ${borderColor} shadow-lg hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden backdrop-blur-md hover-glow`}
                    style={{ backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)', cursor: 'pointer' }}
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
      {
        viewEntry && (
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
        )
      }

      {/* New/Edit Entry Modal */}
      {
        isNewEntryOpen || entryToEdit ? (
          <NewEntryModal
            onClose={() => {
              setIsNewEntryOpen(false);
              setEntryToEdit(null);
            }}
            onSave={fetchEntries}
            currentTheme={currentTheme}
            entry={entryToEdit}
          />
        ) : null
      }
    </div >
  );
}

export default DiaryPage;