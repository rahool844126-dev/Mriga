import React from 'react';
import { ChatMessage, MessageRole } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
  showCursor?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, showCursor }) => {
  const isUser = message.role === MessageRole.USER;

  // Don't render the bot's placeholder bubble if it's empty and there's no cursor.
  if (message.role === MessageRole.BOT && !message.text && !showCursor) {
    return null;
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className="max-w-xl" // Bubble styles removed, this div just constrains width
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap font-bold text-[var(--text-primary)] flex items-center">
            <span>{message.text}</span>
            {showCursor && (
                <span className="ml-1 block w-0.5 h-5 bg-[var(--text-primary)] animate-pulse"></span>
            )}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;