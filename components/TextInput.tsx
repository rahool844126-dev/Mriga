import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isThinking: boolean;
}

const UpArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
  </svg>
);


const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isThinking }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isThinking) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="relative flex items-center bg-[var(--bg-component)] backdrop-blur-sm rounded-full border-2 border-[var(--border-component)] focus-within:border-[var(--accent-color-1)] transition-colors duration-300">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message here..."
          disabled={isThinking}
          className="w-full pl-6 pr-14 py-3 text-lg text-[var(--text-primary)] bg-transparent focus:outline-none disabled:opacity-60"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isThinking || !inputText.trim()}
          className="absolute inset-y-0 right-2 my-auto w-11 h-11 flex-shrink-0 rounded-full bg-gradient-to-br from-[var(--accent-color-1)] to-[var(--accent-color-2)] flex items-center justify-center text-[var(--accent-text)] shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--accent-color-1)] focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          <UpArrowIcon className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;