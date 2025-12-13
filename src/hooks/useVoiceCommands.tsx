'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

interface VoiceCommand {
  phrases: string[];
  action: () => void;
  description: string;
}

interface UseVoiceCommandsOptions {
  enabled?: boolean;
  onCommandRecognized?: (command: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceCommands(options: UseVoiceCommandsOptions = {}) {
  const { enabled = true, onCommandRecognized, onError } = options;
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Define available commands
  const commands: VoiceCommand[] = [
    {
      phrases: ['show my progress', 'show progress', 'go to dashboard', 'open dashboard', 'my dashboard'],
      action: () => router.push('/dashboard'),
      description: 'Navigate to dashboard',
    },
    {
      phrases: ['go home', 'go to home', 'home page', 'main page'],
      action: () => router.push('/'),
      description: 'Navigate to home',
    },
    {
      phrases: ['start learning', 'start path', 'begin learning', 'take assessment'],
      action: () => router.push('/assessment'),
      description: 'Start assessment',
    },
    {
      phrases: ['next lesson', 'continue learning', 'next'],
      action: () => {
        // This will be handled contextually based on current page
        const event = new CustomEvent('voiceCommand:nextLesson');
        window.dispatchEvent(event);
      },
      description: 'Go to next lesson',
    },
    {
      phrases: ['play', 'play audio', 'start audio', 'play lesson'],
      action: () => {
        const event = new CustomEvent('voiceCommand:playAudio');
        window.dispatchEvent(event);
      },
      description: 'Play audio',
    },
    {
      phrases: ['pause', 'stop', 'pause audio', 'stop audio'],
      action: () => {
        const event = new CustomEvent('voiceCommand:pauseAudio');
        window.dispatchEvent(event);
      },
      description: 'Pause audio',
    },
    {
      phrases: ['take quiz', 'start quiz', 'begin quiz'],
      action: () => {
        const event = new CustomEvent('voiceCommand:startQuiz');
        window.dispatchEvent(event);
      },
      description: 'Start quiz',
    },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Process recognized speech
  const processCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    setLastCommand(lowerTranscript);

    for (const command of commands) {
      for (const phrase of command.phrases) {
        if (lowerTranscript.includes(phrase)) {
          onCommandRecognized?.(phrase);
          command.action();
          return true;
        }
      }
    }

    return false;
  }, [commands, onCommandRecognized, router]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !enabled) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        processCommand(transcript);
        setIsListening(false);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  }, [enabled, processCommand, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    lastCommand,
    supported,
    startListening,
    stopListening,
    toggleListening,
    commands: commands.map(c => ({ phrases: c.phrases, description: c.description })),
  };
}

// Voice command button component
export function VoiceCommandButton({
  className = '',
  showTooltip = true,
}: {
  className?: string;
  showTooltip?: boolean;
}) {
  const { isListening, supported, toggleListening, lastCommand } = useVoiceCommands({
    onCommandRecognized: (cmd) => {
      console.log('Voice command recognized:', cmd);
    },
  });
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (lastCommand) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastCommand]);

  if (!supported) return null;

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`p-3 rounded-full transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
        } ${className}`}
        title={isListening ? 'Listening... (click to stop)' : 'Voice commands (click to start)'}
      >
        {isListening ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93V7h2v1c0 2.76 2.24 5 5 5s5-2.24 5-5V7h2v1c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Feedback tooltip */}
      {showFeedback && lastCommand && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-lg whitespace-nowrap shadow-lg">
          Heard: &quot;{lastCommand}&quot;
        </div>
      )}

      {/* Help tooltip */}
      {showTooltip && !isListening && !showFeedback && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none min-w-[200px]">
          <p className="font-medium text-white mb-1">Voice Commands:</p>
          <ul className="space-y-0.5">
            <li>&quot;Show my progress&quot;</li>
            <li>&quot;Go home&quot;</li>
            <li>&quot;Next lesson&quot;</li>
            <li>&quot;Play / Pause&quot;</li>
          </ul>
        </div>
      )}
    </div>
  );
}
