import React, { useState, useEffect } from 'react';
import { X, Image, Mic, MicOff } from 'lucide-react';
import { format } from 'date-fns';

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
  const bgOverlay = isDark ? 'bg-black/50' : 'bg-white/90';
  const modalBg = isDark ? 'bg-[#1B2A4A]' : 'bg-white';
  const buttonOutline = currentTheme?.buttonOutline || 'border border-gray-300 text-black';
  const buttonStyle = currentTheme?.button || 'bg-cyan-500 text-white hover:bg-cyan-600';

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

    // Get token from localStorage
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
      <div className={`fixed inset-0 ${bgOverlay}`} onClick={onClose}></div>
      <div className={`relative ${modalBg} rounded-lg p-8 max-w-2xl w-full mx-4 shadow-xl`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${textColor} hover:opacity-70`}>
          <X className="w-6 h-6" />
        </button>

        <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>
          {entry ? 'Edit Entry' : 'New Diary Entry'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-gray-100'} ${textColor}`}
            required
          />

          <textarea
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-gray-100'} ${textColor} min-h-[200px]`}
            required
          />

          <input
            type="text"
            placeholder="How are you feeling?"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-gray-100'} ${textColor}`}
          />

          <div className="flex space-x-4">
            <label className={`flex items-center space-x-2 ${buttonOutline} border-2 px-4 py-2 rounded-lg cursor-pointer`}>
              <Image className="w-5 h-5" />
              <span>Add Photos</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
            </label>

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center space-x-2 ${buttonOutline} border-2 px-4 py-2 rounded-lg`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Record</span>
                </>
              )}
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className={`${buttonStyle} px-6 py-2 rounded-lg`}>
              {entry ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewEntryModal;