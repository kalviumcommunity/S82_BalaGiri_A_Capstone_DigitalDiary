import React, { useState, useEffect } from 'react';
import { X, Image, Mic, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  deriveEntryKey,
  encryptWithKey,
  encryptFileWithKey,
  generateSalt,
  arrayBufferToBase64
} from '../utils/cryptoUtils';

const RECORDING_BARS = [1, 2, 3, 4];

function NewEntryModal({ onClose, onSave, currentTheme, entry }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [photos, setPhotos] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { user, encryptionKey, logout } = useAuth();

  const isDark = currentTheme?.text?.includes('E1E7FF');
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const subTextColor = isDark ? 'text-white/60' : 'text-slate-500';
  const modalBg = isDark
    ? 'bg-[#0f172a]/80 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]'
    : 'bg-white/80 border border-white/40 shadow-2xl';

  const inputBg = isDark ? 'bg-black/30 focus:bg-black/50 shadow-inner' : 'bg-slate-50/50 focus:bg-white shadow-sm';
  const borderColor = isDark ? 'border-white/10' : 'border-white/20';

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setMood(entry.mood || '');
    }
  }, [entry]);

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
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!encryptionKey) {
        // Critical security fix: Redirect if key is missing
        logout("Encryption key missing");
        return;
      }

      setIsEncrypting(true);

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
        mood: mood,
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

      onSave();
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to save entry. ' + err.message);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className={`relative ${modalBg} backdrop-blur-xl rounded-3xl max-w-2xl w-full mx-4 shadow-2xl transition-all transform flex flex-col max-h-[90vh] overflow-hidden`}>
        <div className="p-6 sm:p-8 pb-0 shrink-0 relative">
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 ${textColor} hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-white/10`}
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className={`text-3xl font-bold mb-6 ${textColor} tracking-tight`}>
            {entry ? 'Edit Entry' : 'New Entry'}
          </h2>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 pt-2 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl ${inputBg} ${textColor} text-xl font-medium placeholder:${subTextColor} focus:outline-none focus:ring-2 focus:ring-white/20 transition-all border ${borderColor}`}
                required
              />

              <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl ${inputBg} ${textColor} text-lg placeholder:${subTextColor} min-h-[200px] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none border ${borderColor}`}
                required
              />

              <input
                type="text"
                placeholder="Mood (e.g., Happy, Reflective)"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl ${inputBg} ${textColor} placeholder:${subTextColor} focus:outline-none focus:ring-2 focus:ring-white/20 transition-all border ${borderColor}`}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 sm:gap-0">
              <div className="flex space-x-3">
                <label
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/10 ${textColor} border ${borderColor}`}
                >
                  <Image className="w-5 h-5" />
                  <span className="font-medium">Photos</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isRecording ? 'bg-red-500/10 text-red-500 border-red-500/20' : `hover:bg-white/10 ${textColor} border ${borderColor}`}`}
                >
                  {isRecording ? (
                    <>
                      <div className="flex space-x-1 items-center h-4">
                        {RECORDING_BARS.map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 16, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1 bg-red-500 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="font-semibold">Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span className="font-medium">Record</span>
                    </>
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={isEncrypting}
                className="w-full sm:w-auto bg-cyan-500/90 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
              >
                {isEncrypting ? (
                  <>
                    <Lock className="w-4 h-4 animate-pulse" />
                    <span>Encrypting...</span>
                  </>
                ) : (
                  entry ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewEntryModal;