import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const CustomAudioPlayer = ({ src, isDarkMode }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const containerClass = isDarkMode
        ? "bg-slate-800/50 border border-white/10"
        : "bg-white/50 border border-slate-200";

    const textClass = isDarkMode ? "text-slate-200" : "text-slate-700";
    const subTextClass = isDarkMode ? "text-slate-400" : "text-slate-500";
    const iconClass = isDarkMode ? "text-cyan-400" : "text-cyan-600";
    const progressBgClass = isDarkMode ? "bg-slate-700" : "bg-slate-300";
    const progressFillClass = isDarkMode ? "bg-cyan-400" : "bg-cyan-600";

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        }

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', onEnded);
        }
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleSeek = (e) => {
        const manualChange = Number(e.target.value);
        audioRef.current.currentTime = manualChange;
        setCurrentTime(manualChange);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`w-full rounded-2xl p-4 flex items-center gap-4 ${containerClass} backdrop-blur-md shadow-sm transition-all`}>
            <audio ref={audioRef} src={src} preload="metadata" />

            <button
                onClick={togglePlay}
                className={`p-3 rounded-full shadow-lg transition-all active:scale-95 flex-shrink-0 ${isDarkMode ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400' : 'bg-white hover:bg-slate-50 text-cyan-600 border border-slate-100'}`}
            >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="relative w-full h-2 rounded-full cursor-pointer group">
                    <div className={`absolute inset-0 rounded-full ${progressBgClass}`}></div>

                    <div
                        className={`absolute top-0 left-0 h-full rounded-full ${progressFillClass} transition-all duration-100`}
                        style={{ width: `${progressPercent}%` }}
                    ></div>

                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>

                <div className={`flex justify-between text-xs font-medium ${subTextClass} px-0.5`}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <button onClick={toggleMute} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${subTextClass}`}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
        </div>
    );
};

export default CustomAudioPlayer;
