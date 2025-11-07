import React, { useState, KeyboardEvent } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  submitIcon?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  submitIcon = '➤',
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        className="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
        rows={1}
      />
      <button
        className="chat-submit"
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        aria-label="Send message"
      >
        {submitIcon}
      </button>
    </div>
  );
};

