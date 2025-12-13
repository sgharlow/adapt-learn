'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { ChatMessage } from '@/types';

interface VoiceChatProps {
  lessonContext?: string;
  lessonTitle?: string;
  onClose?: () => void;
}

export default function VoiceChat({ lessonContext, lessonTitle, onClose }: VoiceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleVoiceResult = useCallback((transcript: string) => {
    setInputText(transcript);
  }, []);

  const { isListening, isSupported, transcript, startListening, stopListening } = useVoiceInput({
    onResult: handleVoiceResult,
  });

  // Update input as user speaks
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAudio = async (text: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error('Audio generation failed');
        return null;
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Audio generation error:', error);
      return null;
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlayingAudio(true);
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);

    audio.play().catch(console.error);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          lessonContext,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Generate and play audio for the response
      if (autoPlayAudio) {
        const audioUrl = await generateAudio(data.response);
        if (audioUrl) {
          playAudio(audioUrl);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium">AI Tutor</h3>
            <p className="text-slate-400 text-xs">
              {lessonTitle ? `Helping with: ${lessonTitle}` : 'Ask me anything about AI'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`p-2 rounded-lg transition-colors ${
              autoPlayAudio ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600 text-slate-400'
            }`}
            title={autoPlayAudio ? 'Auto-play enabled' : 'Auto-play disabled'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-600 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-slate-400 mb-2">Ask me anything about AI & ML!</p>
            <p className="text-slate-500 text-sm">Type your question or use the microphone</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-slate-700 text-slate-200 rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && (
                <button
                  onClick={async () => {
                    const audioUrl = await generateAudio(msg.content);
                    if (audioUrl) playAudio(audioUrl);
                  }}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Play audio
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {isPlayingAudio && (
          <div className="flex justify-center">
            <button
              onClick={stopAudio}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm"
            >
              <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              Playing audio... (tap to stop)
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-600 bg-slate-700/30">
        <div className="flex items-end gap-2">
          {/* Voice input button */}
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? 'Listening...' : 'Ask a question...'}
              rows={1}
              className="w-full px-4 py-3 bg-slate-600 text-white placeholder-slate-400 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="flex-shrink-0 p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {isListening && (
          <p className="mt-2 text-xs text-red-400 text-center animate-pulse">
            🎤 Recording... speak your question
          </p>
        )}
      </div>
    </div>
  );
}
