import React from 'react';

interface LandingPageProps {
  onSelectMode: (mode: 'voice' | 'text') => void;
}

const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm3.5-3c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11H7a5 5 0 0 0 4 4.9V19H9v2h6v-2h-2v-3.1a5 5 0 0 0 4-4.9h-1.5z" />
  </svg>
);

const KeyboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 10H9v-2h2v2zm0-3H9V9h2v3zm4 3h-2v-2h2v2zm0-3h-2V9h2v3zm4 3h-2v-2h2v2zm0-3h-2V9h2v3zm-4-4H7V7h10v2z"/>
  </svg>
);


const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col items-center justify-center p-4 relative">
      <h1 className="absolute top-4 left-4 md:top-8 md:left-8 text-4xl md:text-5xl font-bold font-cursive bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-color-1)] to-[var(--accent-color-2)]">
        Mriga
      </h1>

      <div className="flex flex-col gap-8">
        <button
          onClick={() => onSelectMode('voice')}
          className="group relative flex flex-col items-center justify-center w-64 h-64 bg-[var(--bg-component)] backdrop-blur-md rounded-2xl shadow-2xl p-8 border-2 border-transparent hover:border-[var(--accent-color-1)] transition-all duration-300 transform hover:-translate-y-2"
        >
          <MicIcon className="w-20 h-20 text-[var(--accent-color-1)] mb-4 transition-transform duration-300 group-hover:scale-110" />
          <h2 className="text-3xl font-semibold">Voice Chat</h2>
          <p className="text-[var(--text-secondary)] mt-1">Speak directly to the AI</p>
        </button>

        <button
          onClick={() => onSelectMode('text')}
          className="group relative flex flex-col items-center justify-center w-64 h-64 bg-[var(--bg-component)] backdrop-blur-md rounded-2xl shadow-2xl p-8 border-2 border-transparent hover:border-green-500 transition-all duration-300 transform hover:-translate-y-2"
        >
          <KeyboardIcon className="w-20 h-20 text-green-400 mb-4 transition-transform duration-300 group-hover:scale-110" />
          <h2 className="text-3xl font-semibold">Text Chat</h2>
          <p className="text-[var(--text-secondary)] mt-1">Type your messages</p>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;