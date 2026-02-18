import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Mic, Lock, CheckCircle, Loader2, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  deriveEntryKey,
  encryptFileWithKey,
  generateSalt,
} from '../utils/cryptoUtils';
import SuccessAnimation from './SuccessAnimation';
import FailureAnimation from './FailureAnimation';
import EmojiPicker from 'emoji-picker-react';

const RECORDING_BARS = [1, 2, 3, 4];

function NewEntryModal({ onClose, onSave, currentTheme, entry }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(''); // Stores Emoji String
  const [photos, setPhotos] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { encryptionKey, logout } = useAuth();
  const emojiPickerRef = useRef(null);

  const isDark = currentTheme?.text?.includes('E1E7FF');
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const subTextColor = isDark ? 'text-white/60' : 'text-slate-500';

  // Design improvements
  const modalBg = isDark
    ? 'bg-[#0f172a]/95 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)]'
    : 'bg-white/95 border border-white/40 shadow-2xl';

  const inputBg = isDark ? 'bg-black/20 focus:bg-black/40' : 'bg-slate-50 focus:bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setMood(entry.mood || '');
    }
  }, [entry]);

  // Click outside to close emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        setAudioBlob(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Mic error:', error);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMood(emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (!encryptionKey) {
        logout("Encryption key missing");
        return;
      }

      setIsSaving(true);

      const entrySalt = generateSalt();
      const entryKey = await deriveEntryKey(encryptionKey, entrySalt);

      const photosMeta = [];
      const encryptedPhotoBlobs = [];

      await Promise.all(photos.map(async (p) => {
        const { encryptedBlob, iv } = await encryptFileWithKey(p, entryKey);
        const fileId = generateSalt().replace(/[^a-zA-Z0-9]/g, '') + ".enc";

        photosMeta.push({
          id: fileId,
          iv: iv,
          mimeType: p.type,
          originalName: `photo_${photosMeta.length}`
        });
        encryptedPhotoBlobs.push({ blob: encryptedBlob, filename: fileId });
      }));

      let audioMeta = null;
      let encryptedAudioBlob = null;

      if (audioBlob instanceof Blob) {
        const { encryptedBlob, iv } = await encryptFileWithKey(audioBlob, entryKey);
        const fileId = generateSalt().replace(/[^a-zA-Z0-9]/g, '') + ".audio.enc";

        audioMeta = {
          id: fileId,
          iv: iv,
          mimeType: 'audio/mpeg',
          originalName: 'recording.mp3'
        };
        encryptedAudioBlob = { blob: encryptedBlob, filename: fileId };
      }

      const entryData = {
        title: title,
        content: content,
        mood: String(mood || ""), // Ensure mood is a string
        date: new Date().toISOString().split('T')[0],
        photos: photosMeta,
        audio: audioMeta,
      };

      const { payload: encryptedPayload, iv: payloadIV } = await import('../utils/cryptoUtils').then(m => m.encryptEntryPayload(entryData, entryKey));

      const formData = new FormData();
      formData.append('payload', encryptedPayload);
      formData.append('iv', payloadIV);
      formData.append('entrySalt', entrySalt);
      formData.append('encryptionVersion', '2');

      encryptedPhotoBlobs.forEach(({ blob, filename }) => {
        formData.append('photos', blob, filename);
      });

      if (encryptedAudioBlob) {
        formData.append('audio', encryptedAudioBlob.blob, encryptedAudioBlob.filename);
      }

      const url = entry
        ? `${import.meta.env.VITE_API_URL}/api/diary/update/${entry._id}`
        : `${import.meta.env.VITE_API_URL}/api/diary/new`;

      const method = entry ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers: {
          ...headers
        },
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: received non-JSON response");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save entry');

      setShowSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Upload error: Failed to save entry.');
      setErrorMsg(err.message || 'Failed to save entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative ${modalBg} backdrop-blur-2xl rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border ${borderColor}`}
      >
        {showSuccess && <SuccessAnimation message="Entry Saved Successfully!" onClose={() => setShowSuccess(false)} />}
        {errorMsg && <FailureAnimation message={errorMsg} onClose={() => setErrorMsg('')} />}

        {/* Header */}
        <div className="p-6 sm:p-8 pb-4 shrink-0 flex justify-between items-start border-b border-white/5">
          <div className="flex flex-col gap-1">
            <h2 className={`text-3xl font-bold ${textColor} tracking-tight`}>
              {entry ? 'Edit Entry' : 'New Entry'}
            </h2>
            <p className={`text-sm ${subTextColor}`}>Capture your thoughts securely.</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${textColor} hover:opacity-80`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Top Row: Title & Mood */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Title your memory..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full text-2xl font-semibold bg-transparent border-b ${borderColor} px-2 py-3 ${textColor} placeholder:text-gray-400 focus:outline-none focus:border-cyan-500 transition-colors`}
                  required
                />
              </div>

              {/* Mood Picker */}
              <div className="relative" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${borderColor} ${inputBg} ${textColor} hover:border-cyan-500/50 transition-colors min-w-[140px] justify-center`}
                >
                  {mood ? (
                    <span className="text-2xl">{mood}</span>
                  ) : (
                    <>
                      <Smile className="w-5 h-5 text-gray-400" />
                      <span className={`${subTextColor} font-medium`}>Add Mood</span>
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute right-0 top-full mt-2 z-[60] shadow-2xl rounded-2xl overflow-hidden"
                    >
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme={isDark ? "dark" : "light"}
                        lazyLoadEmojis={true}
                        emojiStyle="native"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Content Textarea */}
            <div className={`relative rounded-3xl p-1 ${isDark ? 'bg-gradient-to-br from-white/5 to-transparent' : 'bg-slate-50'}`}>
              <textarea
                placeholder="What's on your mind?..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full px-6 py-5 rounded-2xl ${inputBg} ${textColor} text-lg leading-relaxed placeholder:text-gray-400 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none border border-transparent`}
                required
              />
            </div>

            {/* Media Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                {/* Photos */}
                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-cyan-500/10 ${textColor} border ${borderColor} hover:border-cyan-500/30 group`}>
                  <Image className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                  <span className="font-medium group-hover:text-cyan-400">Photos {photos.length > 0 && `(${photos.length})`}</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                </label>

                {/* Audio */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${isRecording ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' : `${borderColor} hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 ${textColor}`}`}
                >
                  {isRecording ? (
                    <>
                      <div className="flex gap-1 h-3 items-center">
                        {RECORDING_BARS.map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 12, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1 bg-red-400 rounded-full"
                          />
                        ))}
                      </div>
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span>Record</span>
                    </>
                  )}
                </button>
                {audioBlob && <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">Audio Saved</span>}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-3 rounded-xl font-semibold transition-colors ${subTextColor} hover:bg-white/5`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || showSuccess}
                  className={`
                            px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0
                            ${isSaving || showSuccess ? 'bg-cyan-500/50 cursor-wait' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25'}
                        `}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : showSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{entry ? 'Update' : 'Save'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default NewEntryModal;