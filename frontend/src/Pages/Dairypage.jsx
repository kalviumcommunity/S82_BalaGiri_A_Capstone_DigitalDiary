import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PenSquare, Calendar, Search, Trash2, Pencil, X, ChevronDown, ChevronRight, Filter, Sun, Moon, Home, LogOut } from 'lucide-react';
import { useDialog } from '../context/DialogContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NewEntryModal from '../components/NewEntry';
import CustomAudioPlayer from '../components/CustomAudioPlayer';
import { useNavigate } from 'react-router-dom';
import CalendarView from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../customCalendar.css';
import {
  deriveEntryKey,
  decryptWithKey,
  decryptFileWithKey
} from '../utils/cryptoUtils';

function DiaryPage({ currentTheme, isDark, setIsDark }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState([]);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const { alert, confirm } = useDialog();
  const { logout, user, encryptionKey, unlock, token, isAuthenticated, loading } = useAuth();

  // Protect the route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  const [decryptedEntries, setDecryptedEntries] = useState([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [mediaUrls, setMediaUrls] = useState({ photos: [], audio: null });
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (!viewEntry) {
      setMediaUrls({ photos: [], audio: null });
      return;
    }

    let isMounted = true;
    const urlsToRevoke = [];

    const decryptMedia = async () => {
      if (!encryptionKey) return;

      const storedToken = localStorage.getItem('token');
      // Ensure we have a valid token before trying to fetch media
      if (!storedToken) return;

      setLoadingMedia(true);
      const newMediaUrls = { photos: [], audio: null };

      try {
        if (viewEntry.photos && viewEntry.photos.length > 0) {
          newMediaUrls.photos = await Promise.all(viewEntry.photos.map(async (photo, idx) => {
            try {
              const filename = photo.id || photo.path?.split('/').pop();
              if (!filename) return null;

              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diary/file/photos/${filename}`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
              });
              if (!res.ok) throw new Error('Fetch failed');

              const encryptedBlob = await res.blob();
              const entryKey = await deriveEntryKey(encryptionKey, viewEntry.entrySalt);

              const decryptedBlob = await decryptFileWithKey(
                encryptedBlob,
                photo.iv,
                entryKey,
                photo.mimeType
              );

              const url = URL.createObjectURL(decryptedBlob);
              urlsToRevoke.push(url);
              return url;
            } catch (e) {
              console.error("Failed to load photo", idx, e);
              return null;
            }
          }));
        }

        if (viewEntry.audio && typeof viewEntry.audio === 'object') {
          try {
            const filename = viewEntry.audio.id || viewEntry.audio.path?.split('/').pop();
            if (filename) {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diary/file/audio/${filename}`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
              });
              if (!res.ok) throw new Error('Fetch failed');

              const encryptedBlob = await res.blob();
              const entryKey = await deriveEntryKey(encryptionKey, viewEntry.entrySalt);

              const decryptedBlob = await decryptFileWithKey(
                encryptedBlob,
                viewEntry.audio.iv,
                entryKey,
                viewEntry.audio.mimeType
              );

              const url = URL.createObjectURL(decryptedBlob);
              urlsToRevoke.push(url);
              newMediaUrls.audio = url;
            }
          } catch (e) {
            console.error("Failed to load audio", e);
          }
        }

        if (isMounted) {
          setMediaUrls(newMediaUrls);
        } else {
          urlsToRevoke.forEach(u => URL.revokeObjectURL(u));
        }

      } catch (err) {
        console.error("Media decryption error", err);
      } finally {
        if (isMounted) setLoadingMedia(false);
      }
    };

    decryptMedia();

    return () => {
      isMounted = false;
      urlsToRevoke.forEach(u => URL.revokeObjectURL(u));
    };
  }, [viewEntry, encryptionKey, token]); // Updated dep

  const isDarkMode = isDark !== undefined ? isDark : currentTheme?.text?.includes('E1E7FF');
  const text = isDarkMode ? 'text-white' : 'text-slate-800';
  const subtext = isDarkMode ? 'text-white/80' : 'text-slate-600';
  const bgOverlay = isDarkMode ? 'bg-white/10' : 'bg-white/80';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const calendarTheme = isDarkMode ? 'dark-calendar' : 'light-calendar';

  const fetchEntries = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        // Silent return if no token (user might be logging out or not logged in yet)
        return;
      }

      const headers = { 'Authorization': `Bearer ${authToken}` };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diary/all`, {
        headers,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // If 401, mostly session expired.
        if (res.status === 401) {
          console.warn("Session expired or invalid token.");
          logout();
          return;
        }
        throw new Error(`Server returned non-JSON response: ${res.statusText}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch entries');
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
      // Only logout if we had a token but it failed validation
      if (localStorage.getItem('token')) {
        if (err.message === 'Session expired' || err.message === 'No token provided' || err.message === 'Invalid token') {
          await alert('Session expired. Please login again.');
          logout();
        }
      }
    }
  }, [logout, alert]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = useCallback(async (id) => {
    if (!await confirm('Are you sure you want to delete this entry?')) return;

    try {
      const authToken = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${authToken}` };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diary/delete/${id}`, {
        method: 'DELETE',
        headers,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (res.status === 401) throw new Error('Session expired');
        throw new Error(`Server returned non-JSON response`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchEntries();
    } catch (error) {
      console.error('Delete failed:', error);
      if (error.message === 'Session expired') {
        logout();
      } else {
        await alert('Failed to delete entry.');
      }
    }
  }, [confirm, alert, logout, fetchEntries]);

  const [selectedMood, setSelectedMood] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const onDateChange = useCallback((date) => {
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  }, [selectedDate]);

  const filteredEntries = useMemo(() => decryptedEntries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood ? entry.mood === selectedMood : true;

    let matchesDate = true;
    if (selectedDate) {
      const entryDateInfo = new Date(entry.date);
      const selectedDateStr = selectedDate.toLocaleDateString('en-CA');
      matchesDate = entry.date === selectedDateStr;
    }

    return matchesSearch && matchesMood && matchesDate;
  }), [entries, searchTerm, selectedMood, selectedDate, decryptedEntries]);

  const groupedEntries = useMemo(() => filteredEntries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(entry);
    return acc;
  }, {}), [filteredEntries]);

  const entryDates = useMemo(() => new Set(decryptedEntries.map(e => e.date)), [decryptedEntries]);

  const tileContent = useCallback(({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toLocaleDateString('en-CA');
      const hasEntry = entryDates.has(dateStr);
      return hasEntry ? <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mx-auto mt-1"></div> : null;
    }
  }, [entryDates]);

  const handleLogout = async () => {
    if (await confirm("Are you sure you want to log out?")) {
      logout();
    }
  };



  const processEntry = useCallback(async (entry) => {
    if (!entry.entrySalt || (!entry.iv && !entry.content)) return entry;

    try {
      const entryKey = await deriveEntryKey(encryptionKey, entry.entrySalt); // Updated
      const crypto = await import('../utils/cryptoUtils');

      if (entry.payload) {
        const decryptedData = await crypto.decryptEntryPayload(entry.payload, entry.iv, entryKey);
        return { ...entry, ...decryptedData };
      }

      const decryptedContent = await decryptWithKey(entry.content, entry.iv, entryKey);

      let decryptedTitle = entry.title;
      if (entry.title && entry.title.includes(':')) {
        const [tIV, tCipher] = entry.title.split(':');
        try {
          decryptedTitle = await decryptWithKey(tCipher, tIV, entryKey);
        } catch (e) { }
      }

      let decryptedMood = entry.mood;
      if (entry.mood && entry.mood.includes(':')) {
        const [mIV, mCipher] = entry.mood.split(':');
        try {
          decryptedMood = await decryptWithKey(mCipher, mIV, entryKey);
        } catch (e) { }
      }

      return { ...entry, content: decryptedContent, title: decryptedTitle, mood: decryptedMood };
    } catch (err) {
      console.error("Failed to decrypt entry:", entry._id, err);
      return { ...entry, content: "⚠️ Decryption Failed", title: "Error" };
    }
  }, [encryptionKey]); // Updated dep

  useEffect(() => {
    if (encryptionKey && entries.length > 0) { // Updated check
      setIsDecrypting(true);
      Promise.all(entries.map(processEntry)).then(decrypted => {
        const sorted = decrypted.sort((a, b) => new Date(b.date) - new Date(a.date));
        setDecryptedEntries(sorted);
        setIsDecrypting(false);
      });
    } else {
      setDecryptedEntries(entries);
    }
  }, [entries, encryptionKey, processEntry]); // Updated dep

  return (
    <div className={`pt-20 sm:pt-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen ${isDarkMode ? 'bg-[#4E71FF]/0' : ''}`}>


      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4 md:gap-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className={`p-2.5 rounded-xl transition-colors shadow-lg flex items-center justify-center ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-cyan-400' : 'bg-white shadow-md border border-slate-100 text-cyan-600 hover:bg-cyan-50'} backdrop-blur-md group`}
            title="Go Home"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <h1 className={`text-4xl font-bold ${text} tracking-tight drop-shadow-sm`}>
            My Diary
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:space-x-4 relative w-full md:w-auto">

          <button
            onClick={() => setIsFilterOpen(true)}
            className={`p-3 rounded-xl transition-colors shadow-lg flex items-center justify-center ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-cyan-400' : 'bg-white shadow-md border border-slate-100 text-cyan-600 hover:bg-cyan-50'} backdrop-blur-md`}
            title="Filter Entries"
          >
            <Filter className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`p-3 rounded-xl transition-colors shadow-lg flex items-center justify-center ${showCalendar || selectedDate ? 'bg-cyan-500 text-white' : isDarkMode ? 'bg-white/10 hover:bg-white/20 text-cyan-400' : 'bg-white shadow-md border border-slate-100 text-cyan-600 hover:bg-cyan-50'} backdrop-blur-md`}
            title="Toggle Calendar"
          >
            <Calendar className="w-5 h-5" />
            {selectedDate && <span className="ml-2 text-sm font-semibold hidden sm:inline">{selectedDate.toLocaleDateString()}</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`p-3 rounded-xl transition-colors shadow-lg flex items-center justify-center ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-cyan-400' : 'bg-white shadow-md border border-slate-100 text-cyan-600 hover:bg-cyan-50'} backdrop-blur-md`}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>

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
                    tileContent={tileContent}
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
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl backdrop-blur-xl border ${isDarkMode ? 'bg-[#0f172a]/90 border-cyan-500/30 shadow-cyan-500/20 text-yellow-300' : 'bg-white/90 border-slate-200 shadow-xl text-orange-500'} transition-all duration-300`}
          onClick={() => setIsDark(!isDark)}
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </motion.button>

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
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`pointer-events-auto w-full max-w-md p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'bg-[#1B2A4A]/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'bg-white/90 border border-slate-200 shadow-2xl'} backdrop-blur-2xl relative overflow-hidden mx-4`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-2xl font-bold ${text}`}>Filters</h3>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className={`p-2 rounded-full hover:bg-white/10 transition-colors ${text}`}
                    >
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
                        className={`w-full pl-12 pr-4 py-4 rounded-xl ${isDarkMode ? 'bg-black/30 focus:bg-black/40' : 'bg-slate-100 focus:bg-white'} ${text} placeholder:${subtext} focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all border border-transparent`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${subtext}`}>Mood</label>
                      <select
                        value={selectedMood}
                        onChange={(e) => setSelectedMood(e.target.value)}
                        className={`w-full px-4 py-4 rounded-xl ${isDarkMode ? 'bg-black/30 focus:bg-black/40' : 'bg-slate-100 focus:bg-white'} ${text} focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none border border-transparent`}
                      >
                        <option value="" className="text-gray-500">All Moods</option>
                        {[...new Set(entries.map(e => e.mood))].filter(Boolean).map(mood => (
                          <option key={mood} value={mood} className="text-gray-800">{mood}</option>
                        ))}
                      </select>
                    </div>

                    {(searchTerm || selectedMood || selectedDate) && (
                      <button
                        onClick={() => { setSearchTerm(''); setSelectedMood(''); setSelectedDate(null); }}
                        className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors font-semibold"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto space-y-8">
          {Object.keys(groupedEntries).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${bgOverlay} backdrop-blur-2xl rounded-3xl p-8 sm:p-16 text-center border ${borderColor} shadow-2xl flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]`}
            >
              <div className="mb-8 relative">
                <div className={`p-8 rounded-full ${isDarkMode ? 'bg-indigo-500/10' : 'bg-blue-100'}`}>
                  <Search className={`w-16 h-16 ${isDarkMode ? 'text-indigo-400' : 'text-blue-500'} opacity-80`} />
                </div>
              </div>
              <h3 className={`text-3xl font-bold mb-3 ${text}`}>No entries found</h3>
              <p className={`text-lg ${subtext} max-w-md mx-auto mb-8 leading-relaxed`}>
                We couldn't find any stories matching your current filters. Try adjusting your search or create a new memory.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedMood(''); setSelectedDate(null); }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-300"
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
                    className={`group rounded-3xl p-6 sm:p-8 transition-all duration-300 border ${borderColor} shadow-lg hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden backdrop-blur-md hover-glow`}
                    style={{ backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)', cursor: 'pointer' }}
                    onClick={(e) => {
                      if (e.target.closest('button')) return;
                      setViewEntry(entry);
                    }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => setEntryToEdit(entry)} title="Edit" className="p-2 bg-white/10 rounded-full hover:bg-white/30 text-yellow-400 backdrop-blur-md">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(entry._id)} title="Delete" className="p-2 bg-white/10 rounded-full hover:bg-red-500/30 text-red-400 backdrop-blur-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <h2 className={`text-2xl font-bold ${text} tracking-tight pr-12 line-clamp-1`}>{entry.title || "Untitled"}</h2>
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

      {viewEntry && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className={`bg-[#1e293b] rounded-3xl max-w-3xl w-full relative shadow-2xl max-h-[90vh] border border-white/10 text-white flex flex-col overflow-hidden mx-4`}>
            <div className="p-6 sm:p-8 pb-0 shrink-0 relative">
              <button
                onClick={() => setViewEntry(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl sm:text-4xl font-bold mb-2 tracking-tight pr-10">{viewEntry.title}</h2>
              <div className="flex flex-wrap items-center gap-2 sm:space-x-4 text-sm text-gray-400 border-b border-white/5 pb-6">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {viewEntry.date}</span>
                {viewEntry.mood && <span className="bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20">{viewEntry.mood}</span>}
              </div>
            </div>

            <div className="overflow-y-auto p-6 sm:p-8 pt-6 custom-scrollbar">
              <div className="prose prose-invert max-w-none mb-8">
                <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-200">{viewEntry.content}</p>
              </div>

              {loadingMedia && (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  <span className="ml-2 text-gray-400">Decrypting media...</span>
                </div>
              )}

              {!loadingMedia && mediaUrls.photos && mediaUrls.photos.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Photos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaUrls.photos.map((photoUrl, idx) => (
                      photoUrl ? (
                        <img
                          key={idx}
                          src={photoUrl}
                          alt={`Diary photo ${idx + 1}`}
                          className="w-full h-40 object-cover rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer border border-white/5"
                          onClick={() => window.open(photoUrl, '_blank')}
                        />
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {!loadingMedia && mediaUrls.audio && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider pl-1">Voice Note</p>
                  <CustomAudioPlayer
                    src={mediaUrls.audio}
                    isDarkMode={true}
                  />
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={async () => {
                    if (await confirm('Are you sure you want to delete this entry?')) {
                      handleDelete(viewEntry._id);
                      setViewEntry(null);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                <button onClick={() => { setEntryToEdit(viewEntry); setViewEntry(null); }} className="w-full sm:w-auto px-6 py-2 bg-yellow-600/20 text-yellow-500 rounded-xl hover:bg-yellow-600/30 font-medium transition-colors flex items-center justify-center space-x-2">
                  <Pencil className="w-4 h-4" />
                  <span>Edit Entry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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