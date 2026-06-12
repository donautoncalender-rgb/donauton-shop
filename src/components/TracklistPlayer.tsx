'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Music, ChevronDown, ChevronUp } from 'lucide-react';

interface Track {
  id: string;
  nr: number;
  title: string;
  duration: string;
  audioPath?: string;
  fileName?: string;
}

interface TracklistPlayerProps {
  tracksJson: string | null | undefined;
}

export default function TracklistPlayer({ tracksJson }: TracklistPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parse tracks on mount
  useEffect(() => {
    if (tracksJson) {
      try {
        const parsed = JSON.parse(tracksJson);
        if (Array.isArray(parsed)) {
          setTracks(parsed.sort((a, b) => a.nr - b.nr));
        }
      } catch (e) {
        console.error('Failed to parse tracklist json:', e);
      }
    }
  }, [tracksJson]);

  // Audio lifecycle hooks
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      // Auto-play next track if available
      if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
        const nextIndex = currentTrackIndex + 1;
        const nextTrack = tracks[nextIndex];
        if (nextTrack && nextTrack.audioPath) {
          setCurrentTrackIndex(nextIndex);
          audio.src = nextTrack.audioPath;
          audio.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error('Play error:', err));
          return;
        }
      }
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, tracks]);

  if (tracks.length === 0) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayPause = (index: number) => {
    const track = tracks[index];
    if (!track || !track.audioPath) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrackIndex === index) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error('Play error:', err));
      }
    } else {
      audio.pause();
      audio.src = track.audioPath;
      setCurrentTrackIndex(index);
      audio.load();
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * audio.duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress((newTime / audio.duration) * 100);
  };

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      marginTop: '2rem',
      marginBottom: '2rem'
    }}>
      {/* CSS Styles for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes eq-animation {
          0% { transform: scaleY(0.15); }
          50% { transform: scaleY(1.0); }
          100% { transform: scaleY(0.15); }
        }
        .eq-container {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 14px;
          width: 14px;
          margin-left: 8px;
        }
        .eq-col {
          background-color: var(--accent, #cd1719);
          width: 2.5px;
          height: 100%;
          transform-origin: bottom;
          animation: eq-animation 0.8s ease-in-out infinite;
        }
        .eq-col-1 { animation-delay: 0.1s; }
        .eq-col-2 { animation-delay: 0.35s; }
        .eq-col-3 { animation-delay: 0.2s; }

        .tracklist-item {
          padding: 1rem 1.5rem;
        }
        @media (max-width: 600px) {
          .tracklist-item {
            padding: 1rem 0.8rem;
          }
        }
      `}} />

      {/* Hidden HTML5 Audio Element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: '#fafafa',
          borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none',
          padding: '1.2rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <Music style={{ width: '20px', height: '20px', color: 'var(--accent, #cd1719)' }} />
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: 0,
          color: '#111',
          flex: 1
        }}>
          Titelliste & Hörproben
        </h3>
        {isExpanded ? (
          <ChevronUp style={{ width: '20px', height: '20px', color: '#555' }} />
        ) : (
          <ChevronDown style={{ width: '20px', height: '20px', color: '#555' }} />
        )}
      </div>

      {/* List */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tracks.map((track, index) => {
          const isCurrent = currentTrackIndex === index;
          const hasAudio = !!track.audioPath;

          return (
            <div
              key={track.id}
              className="tracklist-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: index < tracks.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: isCurrent ? 'rgba(205, 23, 25, 0.03)' : 'transparent',
                transition: 'background 0.2s ease',
                cursor: hasAudio ? 'pointer' : 'default',
                userSelect: 'none'
              }}
              onClick={() => hasAudio && handlePlayPause(index)}
              onMouseEnter={(e) => {
                if (hasAudio && !isCurrent) {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.015)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Play Button or Number */}
              <div style={{ width: '2.5rem', display: 'flex', alignItems: 'center' }} onClick={(e) => {
                if (hasAudio) {
                  e.stopPropagation();
                  handlePlayPause(index);
                }
              }}>
                {hasAudio ? (
                  <button
                    style={{
                      border: 'none',
                      background: isCurrent && isPlaying ? 'var(--accent, #cd1719)' : '#f3f4f6',
                      color: isCurrent && isPlaying ? 'white' : '#555',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause style={{ width: '12px', height: '12px', fill: 'currentColor' }} />
                    ) : (
                      <Play style={{ width: '12px', height: '12px', fill: 'currentColor', marginLeft: '2px' }} />
                    )}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#999', fontWeight: 600, paddingLeft: '8px' }}>
                    {track.nr}
                  </span>
                )}
              </div>

              {/* Title & Status */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '0.5rem', gap: '0.4rem' }}>
                <span 
                  style={{
                    display: 'block',
                    flex: '0 1 auto',
                    minWidth: 0,
                    fontSize: '0.95rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--accent, #cd1719)' : '#333',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => { if (hasAudio) e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  {track.title}
                </span>

                {hasAudio && !isCurrent && (
                  <Volume2 style={{ width: '15px', height: '15px', color: '#9ca3af', flexShrink: 0 }} />
                )}

                {/* Animated Waveform */}
                {isCurrent && isPlaying && (
                  <div className="eq-container">
                    <div className="eq-col eq-col-1"></div>
                    <div className="eq-col eq-col-2"></div>
                    <div className="eq-col eq-col-3"></div>
                  </div>
                )}
              </div>

              {/* Duration / Audio Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  color: isCurrent ? 'var(--accent, #cd1719)' : '#777',
                  fontWeight: isCurrent ? 600 : 400
                }}>
                  {track.duration || '--:--'}
                </span>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Global Mini Player Control (renders if a track is active) */}
      {currentTrack && (
        <div style={{
          background: '#fcfcfc',
          borderTop: '1px solid #f3f4f6',
          padding: '1.2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          {/* Track Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <Volume2 style={{ width: '16px', height: '16px', color: 'var(--accent, #cd1719)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#555', fontWeight: 600 }}>
                Hörprobe:
              </span>
              <span style={{
                fontSize: '0.8rem',
                color: '#111',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentTrack.nr}. {currentTrack.title}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#777', fontFamily: 'monospace', flexShrink: 0 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Progress Bar */}
          <div 
            onClick={handleProgressBarClick}
            style={{
              height: '6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent, #cd1719)',
              borderRadius: '3px',
              transition: 'width 0.1s linear'
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
