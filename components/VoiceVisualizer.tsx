import React from 'react';
import { BotStatus } from '../types';

interface VoiceVisualizerProps {
  status: BotStatus;
  onToggleListen: () => void;
}

// Updated status map for new visual requirements
const statusMap: { [key in BotStatus]: { text: string; pulseClass: string; ringClass: string; buttonClass: string; iconColorClass: string; } } = {
  [BotStatus.IDLE]: {
    text: 'Tap to Speak',
    pulseClass: '', // No animation
    ringClass: 'border-[var(--border-component)]',
    buttonClass: 'bg-[var(--bg-component)] border-2 border-[var(--border-component)]', // "Lack" color
    iconColorClass: 'text-[var(--text-secondary)]',
  },
  [BotStatus.LISTENING]: {
    text: 'Listening...',
    pulseClass: '', // No animation
    ringClass: 'border-green-400',
    buttonClass: 'bg-gradient-to-br from-[var(--accent-color-1)] to-[var(--accent-color-2)]', // Bright color
    iconColorClass: 'text-[var(--accent-text)]',
  },
  [BotStatus.THINKING]: {
    text: 'Thinking...',
    pulseClass: 'animate-spin', // Keep animation for feedback
    ringClass: 'border-yellow-400',
    buttonClass: 'bg-gradient-to-br from-[var(--accent-color-1)] to-[var(--accent-color-2)]',
    iconColorClass: 'text-[var(--accent-text)]',
  },
  [BotStatus.SPEAKING]: {
    text: 'Speaking...',
    pulseClass: 'animate-pulse', // Keep animation for feedback
    ringClass: 'border-blue-400',
    buttonClass: 'bg-gradient-to-br from-[var(--accent-color-1)] to-[var(--accent-color-2)]',
    iconColorClass: 'text-[var(--accent-text)]',
  },
};

const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm3.5-3c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11H7a5 5 0 0 0 4 4.9V19H9v2h6v-2h-2v-3.1a5 5 0 0 0 4-4.9h-1.5z" />
  </svg>
);

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ status, onToggleListen }) => {
  const { text, pulseClass, ringClass, buttonClass, iconColorClass } = statusMap[status];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center w-56 h-56">
        <div className={`absolute w-full h-full rounded-full bg-[var(--accent-color-1)]/20 ${pulseClass}`} />
        <div className={`absolute w-full h-full rounded-full border-2 ${ringClass}`} style={{ transform: 'scale(0.8)' }} />
        <button
          onClick={onToggleListen}
          disabled={status === BotStatus.THINKING || status === BotStatus.SPEAKING}
          className={`water-ripple-button relative overflow-hidden z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent-color-1)] focus:ring-opacity-50 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${buttonClass} ${iconColorClass}`}
        >
          <MicIcon className="w-12 h-12" />
        </button>
      </div>
      <p className="text-lg text-[var(--text-secondary)] h-6 transition-opacity duration-300">{text}</p>
    </div>
  );
};

export default VoiceVisualizer;