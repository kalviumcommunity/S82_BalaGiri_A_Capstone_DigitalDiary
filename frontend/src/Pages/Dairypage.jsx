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
import ProfileMenu from '../components/ui/ProfileMenu';
import {
  deriveEntryKey,
  decryptFileWithKey
} from '../utils/cryptoUtils';
import { useCardTilt } from '../hooks/useCardTilt';
import { useTheme } from '../context/ThemeContext';

const DiaryCard = ({ entry, setViewEntry, setEntryToEdit, handleDelete, text, subtext, bgCard }) => {
  const { onMouseMove, onMouseLeave, style } = useCardTilt({ maxTilt: 8, scale: 1.02 });

  return (
    <div
      className={`group rounded-3xl p-6 sm:p-8 transition-shadow duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden backdrop-blur-md hover-glow ${bgCard}`}
      style={{ cursor: 'pointer', ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        if (e.target.closest('button')) return;
        setViewEntry(entry);
      }}
    >
      <div className="absolute top-0 right-0 p-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button onClick={() => setEntryToEdit(entry)} title="Edit" className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/30 text-[#7A6050] dark:text-[#E8B86D] backdrop-blur-md">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => handleDelete(entry._id)} title="Delete" className="p-2 bg-[#A63228]/10 text-[#A63228] dark:bg-[#C0504A]/20 dark:text-[#C0504A] hover:bg-[#A63228]/20 dark:hover:bg-[#C0504A]/30 rounded-full backdrop-blur-md">
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
          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-[#F5ECE0] dark:bg-[#2E2940] text-[#7A6050] dark:text-[#9B8EA0] border border-[#E8D9C5] dark:border-[#2E2940]`}>
            {entry.mood}
          </span>
        )}
      </div>

      <p className={`${subtext} line-clamp-3 leading-relaxed opacity-90`}>{entry.content}</p>

      {(entry.photos?.length > 0 || entry.audio) && (
        <div className="mt-4 flex gap-2">
          {entry.photos?.length > 0 && <span className="text-xs bg-[#5C3A8C]/10 text-[#5C3A8C] dark:bg-[#7B5EA7]/20 dark:text-[#7B5EA7] px-2 py-1 rounded border border-[#5C3A8C]/20 dark:border-[#7B5EA7]/20">Has Photos</span>}
          {entry.audio && <span className="text-xs bg-[#C4862A]/10 text-[#C4862A] dark:bg-[#E8B86D]/20 dark:text-[#E8B86D] px-2 py-1 rounded border border-[#C4862A]/20 dark:border-[#E8B86D]/20">Has Audio</span>}
        </div>
      )}
    </div>
  );
};



function DiaryPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
              console.error("Failed to load photo");
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
            console.error("Failed to load audio");
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

  const text = isDark ? 'text-[#F0E6D3]' : 'text-[#1E0F00]';
  const subtext = isDark ? 'text-[#9B8EA0]' : 'text-[#7A6050]';
  const borderColor = isDark ? 'border-[#2E2940]' : 'border-[#E8D9C5]';
  const actionBtn = isDark ? 'bg-[#1C1828] text-[#9B8EA0] border-[#2E2940]' : 'bg-white text-[#7A6050] border-[#E8D9C5] text-sm';
  const bgCard = isDark ? 'bg-[#1C1828] border-[#2E2940] text-[#F0E6D3]' : 'bg-white border-[#E8D9C5] text-[#1E0F00]';
  const bgOverlay = isDark ? 'bg-[#13111C]/40' : 'bg-white/40';

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
  }), [searchTerm, selectedMood, selectedDate, decryptedEntries]);

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

  // Safe decryption wrapper
  const processEntry = useCallback(async (entry) => {
    if (!entry.entrySalt || (!entry.iv && !entry.content)) return entry;

    try {
      const entryKey = await deriveEntryKey(encryptionKey, entry.entrySalt);
      const crypto = await import('../utils/cryptoUtils');

      if (entry.payload) {
        // Updated to pass entry._id for corrupted detection
        const decryptedData = await crypto.decryptEntryPayload(entry.payload, entry.iv, entryKey, entry._id);

        if (decryptedData && decryptedData.corrupted) {
          return decryptedData;
        }

        if (!decryptedData) {
          return { corrupted: true, id: entry._id };
        }

        return { ...entry, ...decryptedData };
      }

      // Legacy support
      const decryptedContent = await decryptWithKey(entry.content, entry.iv, entryKey);

      let decryptedTitle = entry.title;
      if (entry.title && entry.title.includes(':')) {
        const [tIV, tCipher] = entry.title.split(':');
        try {
          decryptedTitle = await decryptWithKey(tCipher, tIV, entryKey);
        } catch (e) {
          // Silent fail for legacy title
        }
      }

      let decryptedMood = entry.mood;
      if (entry.mood && entry.mood.includes(':')) {
        const [mIV, mCipher] = entry.mood.split(':');
        try {
          decryptedMood = await decryptWithKey(mCipher, mIV, entryKey);
        } catch (e) {
          // Silent fail for legacy mood
        }
      }

      return { ...entry, content: decryptedContent, title: decryptedTitle, mood: decryptedMood };
    } catch (err) {
      // Return corrupted flag for legacy failures too
      return { corrupted: true, id: entry._id };
    }
  }, [encryptionKey]);

  useEffect(() => {
    if (encryptionKey && entries.length > 0) {
      setIsDecrypting(true);
      Promise.all(entries.map(processEntry)).then(async (results) => {
        const validEntries = results.filter(e => e && !e.corrupted);
        const corruptedEntries = results.filter(e => e && e.corrupted);

        if (corruptedEntries.length > 0) {
          const authToken = localStorage.getItem('token');
          const headers = { 'Authorization': `Bearer ${authToken}` };

          await Promise.all(corruptedEntries.map(async (entry) => {
            try {
              if (entry.id) {
                await fetch(`${import.meta.env.VITE_API_URL}/api/diary/delete/${entry.id}`, {
                  method: 'DELETE',
                  headers
                });
              }
            } catch (e) { }
          }));

          console.log("Corrupted entries cleaned successfully");
        }

        const sorted = validEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        setDecryptedEntries(sorted);
        setIsDecrypting(false);
      });
    } else {
      setDecryptedEntries([]);
    }
  }, [entries, encryptionKey, processEntry]);

  return (
    <div className={`pt-0 min-h-screen ${isDark ? 'bg-[#0D0D1A]' : 'bg-[#FAF3E8]'} pb-12`}>
      <nav className={`sticky top-0 z-40 ${isDark ? 'bg-[#13111C]/80' : 'bg-white/80'} backdrop-blur border-b ${borderColor} px-4 md:px-8 py-4 mb-8`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className={`p-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center ${actionBtn} ${isDark ? 'hover:bg-[#2E2940]' : 'hover:bg-[#F5ECE0]'} group hover:-translate-y-[1px]`}
              title="Go Home"
            >
              <Home className="w-5 h-5 transition-transform" />
            </button>
            <h1 className={`text-4xl font-bold ${text} tracking-tight drop-shadow-sm`}>
              My Diary
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:space-x-4 relative w-full md:w-auto">
            <ProfileMenu />
          </div>
        </div>
      </nav>

      <div className="px-4 md:px-8 max-w-7xl mx-auto relative pb-24">
        {/* Actions Bar for Filter & Calendar */}
        <div className={`flex justify-between items-center mb-8 ${isDark ? 'bg-[#13111C]/50' : 'bg-white/50'} backdrop-blur-md p-4 rounded-2xl border ${borderColor}`}>
          <h2 className="text-xl font-medium" style={{ color: 'var(--text-muted)' }}>
            {decryptedEntries.length} {decryptedEntries.length === 1 ? 'Entry' : 'Entries'}
          </h2>
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`p-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center ${actionBtn} ${isDark ? 'hover:bg-[#2E2940]' : 'hover:bg-[#F5ECE0]'} hover:-translate-y-[1px] ${(searchTerm || selectedMood) ? (isDark ? 'ring-2 ring-[#C9956A]' : 'ring-2 ring-[#7B3F20]') : ''}`}
              title="Filter Entries"
            >
              <Filter className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`p-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center ${(showCalendar || selectedDate) ? (isDark ? 'bg-[#C9956A] text-[#0D0D1A] border-transparent' : 'bg-[#7B3F20] text-white border-transparent') : actionBtn} hover:-translate-y-[1px]`}
                title="Toggle Calendar"
              >
                <Calendar className="w-5 h-5" />
                {selectedDate && <span className="ml-2 text-sm font-semibold hidden sm:inline">{selectedDate.toLocaleDateString()}</span>}
              </button>
              {showCalendar && (
                <div className="absolute top-14 right-0 p-4 z-50 animate-in fade-in zoom-in duration-200">
                  <div className={`${isDark ? 'bg-[#1C1828]' : 'bg-white'} rounded-2xl shadow-2xl p-4 border ${borderColor} w-[350px]`}>
                    <div className={`custom-calendar-container ${isDark ? 'text-[#F0E6D3]' : ''}`}>
                      <CalendarView
                        onChange={(date) => {
                          onDateChange(date);
                          setShowCalendar(false);
                        }}
                        value={selectedDate}
                        className="w-full rounded-xl border-none"
                        tileContent={tileContent}
                      />
                    </div>
                    <button
                      onClick={() => setShowCalendar(false)}
                      className={`mt-2 w-full text-center text-sm ${isDark ? 'text-[#C9956A]' : 'text-[#7B3F20]'} hover:opacity-80`}
                    >
                      Close
                    </button>
                    {selectedDate && (
                      <button
                        onClick={() => { setSelectedDate(null); setShowCalendar(false); }}
                        className={`mt-2 w-full text-center text-sm ${isDark ? 'text-[#C0504A]' : 'text-[#A63228]'} hover:opacity-80`}
                      >
                        Clear Date
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button for New Entry */}
        <button
          onClick={() => {
            setIsNewEntryOpen(true);
            setEntryToEdit(null);
          }}
          className={`fixed bottom-8 right-8 z-40 group ${isDark ? 'bg-[#C9956A] text-[#0D0D1A] shadow-[0_4px_20px_rgba(201,149,106,0.35)] hover:bg-[#E8B86D]' : 'bg-[#7B3F20] text-white shadow-[0_4px_20px_rgba(123,63,32,0.35)] hover:bg-[#5C2E14]'} p-5 rounded-full font-bold transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce-slow`}
        >
          <PenSquare className="w-6 h-6" />
        </button>

        <div className="relative">
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
                    className={`pointer-events-auto w-full max-w-md p-6 sm:p-8 rounded-3xl ${isDark ? 'bg-[#13111C]' : 'bg-white'} border ${borderColor} shadow-2xl backdrop-blur-2xl relative overflow-hidden mx-4`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-2xl font-bold ${text}`}>Filters</h3>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors ${text}`}
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
                          className={`w-full pl-12 pr-4 py-4 rounded-xl ${isDark ? 'bg-[#1C1828] focus:border-[#C9956A] focus:ring-[#C9956A] placeholder:text-[#6B6070]' : 'bg-[#FAF3E8] focus:border-[#C4862A] focus:ring-[#C4862A] placeholder:text-[#B8A898]'} border ${borderColor} ${text} focus:outline-none focus:ring-1 transition-all`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${subtext}`}>Mood</label>
                        <select
                          value={selectedMood}
                          onChange={(e) => setSelectedMood(e.target.value)}
                          className={`w-full px-4 py-4 rounded-xl ${isDark ? 'bg-[#1C1828] focus:border-[#C9956A] focus:ring-[#C9956A]' : 'bg-[#FAF3E8] focus:border-[#C4862A] focus:ring-[#C4862A]'} border ${borderColor} ${text} focus:outline-none focus:ring-1 appearance-none transition-all`}
                        >
                          <option value="" className={`${isDark ? 'text-[#6B6070]' : 'text-[#B8A898]'}`}>All Moods</option>
                          {[...new Set(decryptedEntries.map(e => e.mood))].filter(Boolean).map(mood => (
                            <option key={mood} value={mood} className={`${isDark ? 'text-[#F0E6D3]' : 'text-[#1E0F00]'}`}>{mood}</option>
                          ))}
                        </select>
                      </div>

                      {(searchTerm || selectedMood || selectedDate) && (
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedMood(''); setSelectedDate(null); }}
                          className={`w-full py-3 ${isDark ? 'bg-[#C0504A]/10 text-[#C0504A] hover:bg-[#C0504A]/20' : 'bg-[#A63228]/10 text-[#A63228] hover:bg-[#A63228]/20'} rounded-xl transition-colors font-semibold`}
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
                  <div className={`p-8 rounded-full ${isDark ? 'bg-[#2E2940]' : 'bg-[#F5ECE0]'}`}>
                    <Search className={`w-16 h-16 ${isDark ? 'text-[#C9956A]' : 'text-[#C4862A]'} opacity-80`} />
                  </div>
                </div>
                <h3 className={`text-3xl font-bold mb-3 ${text}`}>No entries found</h3>
                <p className={`text-lg ${subtext} max-w-md mx-auto mb-8 leading-relaxed`}>
                  We couldn't find any stories matching your current filters. Try adjusting your search or create a new memory.
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedMood(''); setSelectedDate(null); }}
                  className={`${isDark ? 'bg-[#C9956A] text-[#0D0D1A] shadow-[0_4px_20px_rgba(201,149,106,0.35)] hover:bg-[#E8B86D] hover:shadow-[0_8px_28px_rgba(201,149,106,0.5)]' : 'bg-[#7B3F20] text-[#FFFFFF] shadow-[0_4px_20px_rgba(123,63,32,0.35)] hover:bg-[#5C2E14] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(123,63,32,0.45)]'} px-8 py-3 rounded-xl font-bold transition-all duration-300`}
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : Object.entries(groupedEntries).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([monthYear, monthEntries]) => (
              <div key={monthYear} className="animate-fade-in">
                <h3 className={`text-2xl font-bold mb-4 ${text} opacity-90 pl-2 border-l-4 ${isDark ? 'border-[#C9956A]' : 'border-[#7B3F20]'}`}>{monthYear}</h3>
                <div className="grid gap-6">
                  {monthEntries.map((entry) => (
                    <DiaryCard
                      key={entry._id}
                      entry={entry}
                      setViewEntry={setViewEntry}
                      setEntryToEdit={setEntryToEdit}
                      handleDelete={handleDelete}
                      text={text}
                      subtext={subtext}
                      bgCard={bgCard}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {viewEntry && (
          <div className={`fixed inset-0 flex justify-center items-center ${isDark ? 'bg-black/80' : 'bg-black/60'} backdrop-blur-sm z-50 p-4`}>
            <div className={`${isDark ? 'bg-[#13111C]' : 'bg-white'} rounded-3xl max-w-3xl w-full relative shadow-2xl max-h-[90vh] border ${borderColor} ${text} flex flex-col overflow-hidden mx-4`}>
              <div className="p-6 sm:p-8 pb-0 shrink-0 relative">
                <button
                  onClick={() => setViewEntry(null)}
                  className={`absolute top-6 right-6 p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors ${subtext} z-10`}
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl sm:text-4xl font-bold mb-2 tracking-tight pr-10">{viewEntry.title}</h2>
                <div className={`flex flex-wrap items-center gap-2 sm:space-x-4 text-sm ${subtext} border-b ${borderColor} pb-6`}>
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {viewEntry.date}</span>
                  {viewEntry.mood && <span className={`${isDark ? 'bg-[#2E2940]' : 'bg-[#F5ECE0]'} ${subtext} px-3 py-1 rounded-full border ${borderColor}`}>{viewEntry.mood}</span>}
                </div>
              </div>

              <div className="overflow-y-auto p-6 sm:p-8 pt-6 custom-scrollbar">
                <div className="prose max-w-none mb-8">
                  <p className={`whitespace-pre-wrap text-lg leading-relaxed ${text}`}>{viewEntry.content}</p>
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

                <div className={`mt-8 pt-6 border-t ${borderColor} flex flex-col sm:flex-row justify-between items-center gap-4`}>
                  <button
                    onClick={async () => {
                      if (await confirm('Are you sure you want to delete this entry?')) {
                        handleDelete(viewEntry._id);
                        setViewEntry(null);
                      }
                    }}
                    className={`w-full sm:w-auto px-6 py-2 border ${isDark ? 'border-[#C0504A]/30 text-[#C0504A] hover:bg-[#C0504A]/10' : 'border-[#A63228]/30 text-[#A63228] hover:bg-[#A63228]/10'} rounded-xl font-medium transition-colors flex items-center justify-center space-x-2`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                  <button onClick={() => { setEntryToEdit(viewEntry); setViewEntry(null); }} className={`w-full sm:w-auto px-6 py-2 bg-transparent ${isDark ? 'text-[#C9956A] border-2 border-[#C9956A] hover:bg-[#C9956A]/10' : 'text-[#7B3F20] border-2 border-[#7B3F20] hover:bg-[#7B3F20]/10'} rounded-xl font-medium transition-colors flex items-center justify-center space-x-2`}>
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
            currentTheme={theme}
            entry={entryToEdit}
          />
        ) : null}
      </div>
    </div>
  );
}

export default DiaryPage;