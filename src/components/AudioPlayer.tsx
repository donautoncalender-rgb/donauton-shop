'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio(src);
    
    const audio = audioRef.current;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    // Events
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const audio = audioRef.current;
    if (!track || !audio) return;

    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    
    const newTime = percentage * audio.duration;
    audio.currentTime = newTime;
    setProgress(percentage * 100);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player-wrapper">
      <button 
        className="audio-btn" 
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
      >
        {isPlaying ? (
          // Pause Icon
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          // Play Icon
          <svg width="24" height="24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginLeft: '3px' }}>
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>
      
      <div className="audio-track" ref={trackRef} onClick={handleTrackClick}>
        <div className="audio-progress" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="audio-time">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}
