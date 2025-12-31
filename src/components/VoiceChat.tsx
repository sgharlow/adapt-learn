'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { ChatMessage } from '@/types';

interface VoiceChatProps {
  lessonContext?: string;
  lessonTitle?: string;
  onClose?: () => void;
}

// Suggested prompts for different contexts
const GENERAL_PROMPTS = [
  'What is machine learning?',
  'Explain neural networks simply',
  'How do I get started with AI?',
  'What are the types of AI?',
];

const LESSON_PROMPTS = [
  'Can you explain this concept?',
  'Give me a real-world example',
  'What are the key takeaways?',
  'How is this used in practice?',
];

// Quick action commands
const QUICK_ACTIONS = [
  { id: 'play-audio', label: 'Play Audio', icon: '🔊', command: '' },
  { id: 'simpler', label: 'Simpler', icon: '📝', command: 'Can you explain that in simpler terms?' },
  { id: 'example', label: 'Example', icon: '💡', command: 'Can you give me a concrete example?' },
  { id: 'more', label: 'Tell me more', icon: '➕', command: 'Can you elaborate on that?' },
];

// Voice command patterns
const VOICE_COMMANDS: { pattern: RegExp; action: string }[] = [
  { pattern: /^(play audio|play that|play response|repeat|say that again)/i, action: 'play-audio' },
  { pattern: /^(slower|speak slower|slow down)/i, action: 'slower' },
  { pattern: /^(explain|explain that|explain more)/i, action: 'simpler' },
  { pattern: /^(example|give me an example)/i, action: 'example' },
  { pattern: /^(stop|stop audio|stop playing)/i, action: 'stop' },
];

export default function VoiceChat({ lessonContext, lessonTitle, onClose }: VoiceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false); // Default to text-first, audio on-demand
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
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

  // Check for voice commands
  const checkVoiceCommand = useCallback((text: string): string | null => {
    for (const cmd of VOICE_COMMANDS) {
      if (cmd.pattern.test(text.trim())) {
        return cmd.action;
      }
    }
    return null;
  }, []);

  // Handle voice commands
  const handleVoiceCommand = useCallback((action: string) => {
    switch (action) {
      case 'play-audio':
        if (lastResponse) {
          generateAudioAndPlay(lastResponse);
        }
        break;
      case 'slower':
        setPlaybackSpeed(prev => Math.max(0.5, prev - 0.25));
        if (audioRef.current) {
          audioRef.current.playbackRate = Math.max(0.5, playbackSpeed - 0.25);
        }
        break;
      case 'stop':
        stopAudio();
        break;
      case 'simpler':
      case 'example':
        const quickAction = QUICK_ACTIONS.find(a => a.id === action);
        if (quickAction) {
          setInputText(quickAction.command);
          setTimeout(() => sendMessage(quickAction.command), 100);
        }
        break;
    }
  }, [lastResponse, playbackSpeed]);

  const generateAudio = async (text: string): Promise<string | null> => {
    setIsGeneratingAudio(true);
    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          isConversational: true, // Use conversational voice settings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Audio generation failed');
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (err) {
      console.error('Audio generation error:', err);
      setError({
        message: 'Could not generate audio. Text response is still available.',
        retryable: true
      });
      return null;
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.playbackRate = playbackSpeed;

    audio.onplay = () => {
      setIsPlayingAudio(true);
      setError(null);
    };
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => {
      setIsPlayingAudio(false);
      setError({ message: 'Failed to play audio', retryable: true });
    };

    audio.play().catch((err) => {
      console.error('Audio playback error:', err);
      setError({ message: 'Failed to play audio. Please try again.', retryable: true });
    });
  };

  const generateAudioAndPlay = async (text: string) => {
    const audioUrl = await generateAudio(text);
    if (audioUrl) {
      playAudio(audioUrl);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const messageText = overrideText || inputText.trim();
    if (!messageText || isLoading) return;

    // Check for voice commands first
    const voiceCommand = checkVoiceCommand(messageText);
    if (voiceCommand) {
      handleVoiceCommand(voiceCommand);
      setInputText('');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastResponse(data.response);

      // Generate and play audio for the response
      if (autoPlayAudio) {
        await generateAudioAndPlay(data.response);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError({
        message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        retryable: true
      });
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action handler
  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.id === 'play-audio' && lastResponse) {
      generateAudioAndPlay(lastResponse);
    } else if (action.command) {
      setInputText(action.command);
      sendMessage(action.command);
    }
  };

  // Suggested prompt handler
  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
    sendMessage(prompt);
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

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-300 text-sm">{error.message}</span>
          </div>
          {error.retryable && (
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-sm underline"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="py-6">
            {/* Welcome message */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="text-white font-medium mb-1">Ask me anything about AI!</h4>
              <p className="text-slate-400 text-sm">Type, speak, or try a suggestion below</p>
            </div>

            {/* Suggested prompts */}
            <div className="space-y-2">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {(lessonContext ? LESSON_PROMPTS : GENERAL_PROMPTS).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="px-3 py-1.5 text-sm text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 rounded-full transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice commands hint */}
            <div className="mt-6 p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <p className="text-slate-400 text-xs mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Voice commands:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">&quot;Play audio&quot;</span>
                <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">&quot;Slower&quot;</span>
                <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">&quot;Give me an example&quot;</span>
                <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">&quot;Stop&quot;</span>
              </div>
            </div>
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
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md shadow-lg shadow-blue-500/20'
                  : 'bg-slate-700/80 text-slate-200 rounded-bl-md border border-slate-600/50'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-slate-600/50 flex items-center gap-2">
                  <button
                    onClick={() => generateAudioAndPlay(msg.content)}
                    disabled={isGeneratingAudio}
                    className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        Play
                      </>
                    )}
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.content)}
                    className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Quick Actions (show after first response) */}
        {messages.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 justify-center py-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={action.id === 'play-audio' && !lastResponse}
                className="px-3 py-1.5 text-xs text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-blue-500/50 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/80 px-4 py-3 rounded-2xl rounded-bl-md border border-slate-600/50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Thinking</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {isGeneratingAudio && !isPlayingAudio && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Generating audio...</span>
            </div>
          </div>
        )}

        {isPlayingAudio && (
          <div className="flex justify-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
              {/* Audio wave animation */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-blue-400 rounded-full animate-pulse"
                    style={{
                      height: `${8 + Math.random() * 8}px`,
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>
              <span className="text-blue-400 text-sm">Playing</span>
              <button
                onClick={cyclePlaybackSpeed}
                className="px-2 py-0.5 text-xs bg-blue-500/30 text-blue-300 rounded hover:bg-blue-500/40 transition-colors"
              >
                {playbackSpeed}x
              </button>
              <button
                onClick={stopAudio}
                className="p-1 text-blue-400 hover:text-white transition-colors"
                title="Stop"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-600/50 bg-gradient-to-t from-slate-800 to-transparent">
        {/* Listening indicator */}
        {isListening && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-red-400 text-sm font-medium">Listening...</p>
                  <p className="text-slate-400 text-xs">Speak your question clearly</p>
                </div>
              </div>
              <button
                onClick={stopListening}
                className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Stop
              </button>
            </div>
            {transcript && (
              <p className="mt-2 text-sm text-slate-300 italic">&quot;{transcript}&quot;</p>
            )}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Voice input button */}
          {isSupported && !isListening && (
            <button
              onClick={startListening}
              disabled={isLoading}
              className="flex-shrink-0 p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all disabled:opacity-50 border border-slate-600/50 hover:border-blue-500/50"
              title="Start voice input"
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
              placeholder={isListening ? 'Listening...' : 'Ask anything about AI...'}
              rows={1}
              disabled={isListening}
              className="w-full px-4 py-3 bg-slate-700/80 text-white placeholder-slate-400 rounded-xl resize-none border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isLoading || isListening}
            className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:shadow-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="mt-2 text-center text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Enter</kbd> to send
          {isSupported && !isListening && (
            <span> or click the mic to speak</span>
          )}
        </p>
      </div>
    </div>
  );
}
