import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { PRESET_PERSONALITIES } from './constants';
import { createChatSession } from './services/geminiService';
import { BotStatus, ChatMessage, MessageRole, Personality } from './types';

import LandingPage from './components/LandingPage';
import PersonalitySelector from './components/PersonalitySelector';
import ChatBubble from './components/ChatBubble';
import VoiceVisualizer from './components/VoiceVisualizer';
import ChatInput from './components/TextInput';
import ThemeToggleButton from './components/ThemeToggleButton';

// Extend the Window interface for cross-browser speech recognition support
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
declare const window: IWindow;

const themes = [
    { name: 'Deep Space', key: 'deep-space' },
    { name: 'Light', key: 'light' },
    { name: 'Dark', key: 'dark' },
    { name: 'Ocean', key: 'ocean' },
    { name: 'Sunset', key: 'sunset' },
];

const App: React.FC = () => {
  const [mode, setMode] = useState<'landing' | 'voice' | 'text'>('landing');
  const [personalities, setPersonalities] = useState<Personality[]>(PRESET_PERSONALITIES);
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>(personalities[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<BotStatus>(BotStatus.IDLE);
  const [themeIndex, setThemeIndex] = useState(0);
  const [maleHindiVoice, setMaleHindiVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [femaleHindiVoice, setFemaleHindiVoice] = useState<SpeechSynthesisVoice | null>(null);


  const chatRef = useRef<Chat | null>(null);
  const recognitionRef = useRef<any | null>(null); // SpeechRecognition instance
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(status);
  statusRef.current = status;
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Initialize or reset chat session when personality changes
  useEffect(() => {
    if (selectedPersonality) {
      chatRef.current = createChatSession(selectedPersonality.systemInstruction);
      setMessages([]);
      setStatus(BotStatus.IDLE);
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
  }, [selectedPersonality]);
  
  // Apply theme to body
  useEffect(() => {
    document.body.dataset.theme = themes[themeIndex].key;
  }, [themeIndex]);

  // Load and select a high-quality Hindi voice
  useEffect(() => {
    const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length === 0) {
            return; // Voices not loaded yet.
        }

        const hiVoices = availableVoices.filter(v => v.lang === 'hi-IN');

        // --- Male Voice Selection ---
        // 1. Prioritize Google's high-quality male voice
        let bestMaleVoice = hiVoices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('male'));
        
        // 2. If no Google voice, fallback to any available male voice
        if (!bestMaleVoice) {
            bestMaleVoice = hiVoices.find(v => v.name.toLowerCase().includes('male'));
        }
        setMaleHindiVoice(bestMaleVoice || null);

        // --- Female Voice Selection ---
        // 1. Prioritize Google's high-quality female voice
        let bestFemaleVoice = hiVoices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('female'));

        // 2. If no Google voice, fallback to any available female voice
        if (!bestFemaleVoice) {
            bestFemaleVoice = hiVoices.find(v => v.name.toLowerCase().includes('female'));
        }
        setFemaleHindiVoice(bestFemaleVoice || null);
    };

    // The 'voiceschanged' event is fired when the list of voices has been loaded.
    window.speechSynthesis.onvoiceschanged = loadVoices;
    // Call it once manually in case the voices are already loaded on component mount.
    loadVoices();

    return () => {
        window.speechSynthesis.onvoiceschanged = null;
    };
}, []);


  // Scroll to bottom of messages on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBackToLanding = useCallback(() => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setMode('landing');
    setMessages([]);
    setStatus(BotStatus.IDLE);
  }, []);

  const speak = useCallback((text: string) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Cancel any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    const targetGender = selectedPersonality.gender;
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (targetGender === 'female' && femaleHindiVoice) {
      selectedVoice = femaleHindiVoice;
    } else if (maleHindiVoice) { // Default to male if gender is 'male' or undefined
      selectedVoice = maleHindiVoice;
    } else {
      // Fallback if preferred voice is not available
      selectedVoice = femaleHindiVoice || maleHindiVoice;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = 'hi-IN';
    }

    utterance.onstart = () => {
      setStatus(BotStatus.SPEAKING);
    };
    utterance.onend = () => {
      setStatus(BotStatus.IDLE);
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setStatus(BotStatus.IDLE);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [selectedPersonality, maleHindiVoice, femaleHindiVoice]);

  const processUserMessage = useCallback(async (text: string) => {
    if (!text || !chatRef.current) return;

    window.speechSynthesis.cancel();
    if (recognitionRef.current && statusRef.current === BotStatus.LISTENING) {
        recognitionRef.current.stop();
    }

    setStatus(BotStatus.THINKING);
    setMessages(prev => [
        ...prev,
        { role: MessageRole.USER, text },
        { role: MessageRole.BOT, text: '' } // Add a placeholder for the bot's response
    ]);

    try {
        const stream = await chatRef.current.sendMessageStream({ message: text });
        
        let finalResponse = '';
        for await (const chunk of stream) {
            const chunkText = chunk.text;
            finalResponse += chunkText;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = finalResponse;
                return newMessages;
            });
        }

        // Once streaming is complete
        if (mode === 'voice') {
            speak(finalResponse);
        } else {
            setStatus(BotStatus.IDLE);
        }

    } catch (error) {
        console.error('Gemini API error:', error);
        const errorMessage = "I'm having trouble connecting right now. Please try again later.";
        // Replace the placeholder with the error message
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = errorMessage;
            return newMessages;
        });
        if (mode === 'voice') {
            speak(errorMessage);
        } else {
            setStatus(BotStatus.IDLE);
        }
    }
  }, [mode, speak]);

  // Set up speech recognition
  useEffect(() => {
    if (mode !== 'voice') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus(BotStatus.LISTENING);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript) {
        processUserMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setStatus(BotStatus.IDLE);
    };

    recognition.onend = () => {
      // Only set to IDLE if we were LISTENING. Don't interrupt THINKING.
      if (statusRef.current === BotStatus.LISTENING) {
        setStatus(BotStatus.IDLE);
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [mode, processUserMessage]);

  const handleToggleListen = () => {
    if (status === BotStatus.LISTENING) {
      recognitionRef.current?.stop();
    } else if (status === BotStatus.IDLE) {
      window.speechSynthesis.cancel(); // Stop any current speech before listening
      recognitionRef.current?.start();
    }
  };

  const handleSendMessage = (text: string) => {
    processUserMessage(text);
  };

  const handleAddPersonality = (personality: Personality) => {
    setPersonalities(prev => [personality, ...prev]);
    setSelectedPersonality(personality);
  };
  
  const handleThemeChange = () => {
    setThemeIndex(prev => (prev + 1) % themes.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = 0; // Reset end
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === 0 || touchEndX.current === 0) return; // No move
    const swipeDistance = touchEndX.current - touchStartX.current;
    const swipeThreshold = 50; // Minimum distance for a swipe

    if (swipeDistance > swipeThreshold) {
      // Swiped right
      handleBackToLanding();
    }

    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (mode === 'landing') {
    return <LandingPage onSelectMode={setMode} />;
  }

  return (
    <div 
      className={`h-screen w-screen flex flex-col font-sans overflow-hidden relative transition-colors duration-500`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-2 md:gap-4 p-4">
        {/* Left: Back Button */}
        <button onClick={handleBackToLanding} className="flex-shrink-0 px-4 py-2 text-[var(--text-primary)] bg-[var(--bg-component)] rounded-md hover:bg-opacity-50 transition-colors flex items-center justify-center">
            &larr; Back
        </button>
        
        {/* Center: Personality Selector */}
        <div className="flex-grow flex justify-center min-w-0">
             <div className="w-full max-w-xs sm:max-w-sm">
                <PersonalitySelector
                    personalities={personalities}
                    selectedPersonality={selectedPersonality}
                    onSelectPersonality={setSelectedPersonality}
                    onAddPersonality={handleAddPersonality}
                />
             </div>
        </div>

        {/* Right: Theme Button */}
        <div className="flex-shrink-0">
          <ThemeToggleButton onThemeChange={handleThemeChange} />
        </div>
      </header>


      {/* Main content area */}
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto pt-24">
        
        {/* Scrollable message list */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          {messages.map((msg, index) => (
            <ChatBubble 
                key={index} 
                message={msg} 
                showCursor={msg.role === MessageRole.BOT && index === messages.length - 1 && status === BotStatus.THINKING}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed controls area at the bottom */}
        <div className="w-full flex flex-col items-center px-4 py-6">
            {mode === 'voice' ? (
            <VoiceVisualizer status={status} onToggleListen={handleToggleListen} />
            ) : (
            <ChatInput onSendMessage={handleSendMessage} isThinking={status === BotStatus.THINKING} />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;