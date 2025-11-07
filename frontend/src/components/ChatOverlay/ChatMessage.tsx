import React from 'react';
import { ChatMessage as ChatMessageType, DisplayConfig } from './types';
import { ResponseRenderer } from './ResponseRenderer';
import './ChatMessage.css';

interface ChatMessageProps {
  message: ChatMessageType;
  userMessageColor: string;
  agentMessageColor: string;
  displayConfig?: DisplayConfig;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  userMessageColor,
  agentMessageColor,
  displayConfig,
}) => {
  const isUser = message.role === 'user';
  const backgroundColor = isUser ? userMessageColor : agentMessageColor;

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-agent'}`}>
      <div
        className="message-bubble"
        style={{ backgroundColor }}
      >
        {isUser ? (
          <div className="message-text">{message.content}</div>
        ) : (
          <ResponseRenderer message={message} displayConfig={displayConfig} />
        )}
      </div>
      <div className="message-timestamp">
        {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
};

