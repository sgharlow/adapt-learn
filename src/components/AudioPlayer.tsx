'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  audioUrl?: string | null;
  title?: string;
  onGenerateAudio?: () => Promise<string>;
  isGenerating?: boolean;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer({
  audioUrl,
  title = 'Listen to this lesson',
  onGenerateAudio,
  isGenerating = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(audioUrl || null);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    setLocalAudioUrl(audioUrl || null);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setError('Failed to load audio');

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [localAudioUrl]);

  const togglePlay = useCallback(async () => {
    if (!localAudioUrl && onGenerateAudio) {
      setIsLoading(true);
      setError(null);
      try {
        const url = await onGenerateAudio();
        setLocalAudioUrl(url);
        setIsLoading(false);
        setTimeout(() => {
          audioRef.current?.play();
          setIsPlaying(true);
        }, 100);
      } catch {
        setError('Failed to generate audio');
        setIsLoading(false);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setError('Failed to play audio');
      }
    }
  }, [localAudioUrl, onGenerateAudio, isPlaying]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  }, [duration]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !localAudioUrl) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = percent * duration;
    audio.currentTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(time);
  }, [duration, localAudioUrl]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  }, []);

  const cycleSpeed = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    audio.playbackRate = newSpeed;
    setPlaybackSpeed(newSpeed);
  }, [playbackSpeed]);

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showGenerateButton = !localAudioUrl && onGenerateAudio;
  const isLoadingState = isLoading || isGenerating;

  return (
    <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-xl">
      {localAudioUrl && (
        <audio ref={audioRef} src={localAudioUrl} preload="metadata" />
      )}

      {/* Title Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div>
            <span className="text-white font-medium block">{title}</span>
            {showGenerateButton && !isLoadingState && (
              <span className="text-xs text-blue-400">Click play to generate audio</span>
            )}
            {isLoadingState && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                Generating audio...
              </span>
            )}
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
          </div>
        </div>

        {/* Duration */}
        {localAudioUrl && duration > 0 && (
          <div className="hidden sm:block text-sm text-slate-400">
            {formatTime(duration)} total
          </div>
        )}
      </div>

      {/* Waveform/Progress Bar */}
      <div className="mb-4">
        <div
          className="relative h-12 bg-slate-900/50 rounded-xl overflow-hidden cursor-pointer group"
          onClick={handleSeek}
        >
          {/* Waveform visualization (simulated with bars) */}
          <div className="absolute inset-0 flex items-center justify-between px-1 gap-[2px]">
            {Array.from({ length: 60 }).map((_, i) => {
              const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
              const isPlayed = (i / 60) * 100 < progressPercent;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isPlayed
                      ? 'bg-gradient-to-t from-blue-500 to-purple-500'
                      : 'bg-slate-700 group-hover:bg-slate-600'
                  }`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>

          {/* Progress overlay */}
          <div
            className="absolute inset-y-0 left-0 bg-blue-500/10 pointer-events-none transition-all"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Playhead */}
          {localAudioUrl && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/50 transition-all"
              style={{ left: `${progressPercent}%` }}
            />
          )}
        </div>

        {/* Time display */}
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          {/* Skip Back */}
          <button
            onClick={() => skip(-10)}
            disabled={!localAudioUrl}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Back 10 seconds"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoadingState}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
          >
            {isLoadingState ? (
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => skip(10)}
            disabled={!localAudioUrl}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Forward 10 seconds"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Volume */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              disabled={!localAudioUrl}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Volume"
            >
              {volume === 0 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {showVolumeSlider && localAudioUrl && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Speed Control */}
          <button
            onClick={cycleSpeed}
            disabled={!localAudioUrl}
            className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-slate-600/50"
            title="Change playback speed"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
}
