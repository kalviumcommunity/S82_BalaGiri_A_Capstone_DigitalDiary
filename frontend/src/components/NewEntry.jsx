import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

function NewEntryModal({ onClose, onSave, currentTheme, entry }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [photos, setPhotos] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

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

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('mood', mood);
    formData.append('date', new Date().toISOString().split('T')[0]);

    photos.forEach(photo => {
      formData.append('photos', photo);
    });

    if (audioBlob instanceof Blob) {
      formData.append('audio', audioBlob, 'recording.mp3');
    }

    const url = entry
      ? `${import.meta.env.VITE_BACKEND_URL}/api/diary/update/${entry._id}`
      : `${import.meta.env.VITE_BACKEND_URL}/api/diary/new`;

    const method = entry ? 'PUT' : 'POST';

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(url, {
        method,
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save entry');

      onSave();
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
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
                        {[1, 2, 3, 4].map((i) => (
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
                className="w-full sm:w-auto bg-cyan-500/90 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {entry ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewEntryModal;