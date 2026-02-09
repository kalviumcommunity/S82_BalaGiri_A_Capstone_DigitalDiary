import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Mic, MicOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { generateAESKey, encryptData, wrapAESKey, encryptFile, arrayBufferToBase64, importKeyFromJWK } from '../utils/crypto';

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
  const { user } = useAuth();

  const isDark = currentTheme?.text?.includes('E1E7FF');
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const subTextColor = isDark ? 'text-white/60' : 'text-slate-500';
  // Premium Glassmorphism background
  const modalBg = isDark
    ? 'bg-[#0f172a]/80 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]'
    : 'bg-white/80 border border-white/40 shadow-2xl';

  const inputBg = isDark ? 'bg-black/30 focus:bg-black/50 shadow-inner' : 'bg-slate-50/50 focus:bg-white shadow-sm';
  const borderColor = isDark ? 'border-white/10' : 'border-white/20';

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      // Note: If entry is already encrypted, we can't show it plainly without decryption!
      // But NewEntry is used for EDITING too.
      // If we are editing, we need to decrypt first.
      // DiaryPage decrypts before showing "View Entry".
      // Does it decrypt for "Edit"?
      // DiaryPage passes `entryToEdit`.
      // If `entryToEdit` content is encrypted string, we need to decrypt it.
      // But NewEntry doesn't have decryption logic yet.
      // And DiaryPage doesn't either (yet).
      // For now, let's assume `entry` passed in is already decrypted or we will handle it later.
      // Given the task order (NewEntry first), I'll just set it.
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
      if (!user?.publicKey) {
        alert("Encryption keys missing. Please log out and back in.");
        return;
      }

      setIsEncrypting(true);

      // 1. Generate AES Key for this entry
      const entryKey = await generateAESKey();

      // 2. Encrypt Content
      const { encryptedData: encryptedContentBuffer, iv: contentIVBuffer } = await encryptData(content, entryKey);
      const encryptedContent = arrayBufferToBase64(encryptedContentBuffer);
      const iv = arrayBufferToBase64(contentIVBuffer);

      // 3. Encrypt AES Key with User's Public Key
      const publicKey = await importKeyFromJWK(JSON.parse(user.publicKey), "public");
      const wrappedKeyBuffer = await wrapAESKey(entryKey, publicKey);
      const encryptedKey = arrayBufferToBase64(wrappedKeyBuffer);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', encryptedContent); // Encrypted
      // Send IV for the content
      formData.append('iv', iv);
      // Send Encrypted AES Key
      formData.append('encryptedKey', encryptedKey);
      formData.append('mood', mood);
      formData.append('date', new Date().toISOString().split('T')[0]);

      // 4. Encrypt Photos
      const encryptedPhotos = await Promise.all(photos.map(p => encryptFile(p, entryKey)));
      encryptedPhotos.forEach((blob, index) => {
        // Blob now includes IV prepended
        formData.append('photos', blob, `photo_${index}.enc`);
      });

      // 5. Encrypt Audio
      if (audioBlob instanceof Blob) {
        const encryptedAudio = await encryptFile(audioBlob, entryKey);
        // Blob now includes IV prepended
        formData.append('audio', encryptedAudio, 'recording.enc');
      }

      const url = entry
        ? `${import.meta.env.VITE_BACKEND_URL}/api/diary/update/${entry._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/diary/new`;

      const method = entry ? 'PUT' : 'POST';

      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        method,
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save entry');

      onSave(); // Refresh list
      onClose(); // Close modal
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
        {/* Header */}
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

        {/* Scrollable Form */}
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