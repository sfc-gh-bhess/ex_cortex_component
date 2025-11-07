import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, ChatOverlayProps, defaultDisplayConfig } from './types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import './ChatOverlay.css';

const defaultProps: Required<Omit<ChatOverlayProps, 'displayConfig'>> = {
  position: { bottom: '20px', right: '20px' },
  size: { width: '400px', height: '600px' },
  userMessageColor: '#e3f2fd',
  agentMessageColor: '#f5f5f5',
  submitIcon: '➤',
};

export const ChatOverlay: React.FC<ChatOverlayProps> = (props) => {
  const config = { ...defaultProps, ...props };
  const displayConfig = { ...defaultDisplayConfig, ...props.displayConfig };
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Resizing state
  const [size, setSize] = useState({
    width: parseInt(config.size.width || '400'),
    height: parseInt(config.size.height || '600'),
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ direction: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      isComplete: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Create placeholder for assistant response
    const assistantMessage: ChatMessageType = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      events: [],
      isComplete: false,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Start streaming (this will be handled by the parent component or service)
    // For now, this is a placeholder
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: 'This is a placeholder response', isComplete: true }
            : msg
        )
      );
      setIsStreaming(false);
    }, 1000);
  };

  const handleUpdateMessage = (messageId: string, update: Partial<ChatMessageType>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...update } : msg))
    );
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;

      const { direction, startX, startY, startWidth, startHeight } = resizeRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('left')) {
        newWidth = Math.max(300, startWidth - deltaX);
      }
      if (direction.includes('right')) {
        newWidth = Math.max(300, startWidth + deltaX);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(400, startHeight - deltaY);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(400, startHeight + deltaY);
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  if (isMinimized) {
    return (
      <button
        className="chat-bubble"
        onClick={toggleMinimized}
        style={{
          bottom: config.position.bottom,
          right: config.position.right,
        }}
        aria-label="Open chat"
      >
        💬
      </button>
    );
  }

  return (
    <div
      className={`chat-overlay ${isResizing ? 'resizing' : ''}`}
      style={{
        bottom: config.position.bottom,
        right: config.position.right,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* Resize handles */}
      <div className="resize-handle resize-handle-top" onMouseDown={(e) => handleResizeStart(e, 'top')} />
      <div className="resize-handle resize-handle-right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
      <div className="resize-handle resize-handle-bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
      <div className="resize-handle resize-handle-top-left" onMouseDown={(e) => handleResizeStart(e, 'top-left')} />
      <div className="resize-handle resize-handle-top-right" onMouseDown={(e) => handleResizeStart(e, 'top-right')} />
      <div className="resize-handle resize-handle-bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom-left')} />
      <div className="resize-handle resize-handle-bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom-right')} />

      <div className="chat-header">
        <h3>Chat with Cortex Agent</h3>
        <button
          className="chat-close"
          onClick={toggleMinimized}
          aria-label="Minimize chat"
        >
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            userMessageColor={config.userMessageColor}
            agentMessageColor={config.agentMessageColor}
            displayConfig={displayConfig}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        disabled={isStreaming}
        submitIcon={config.submitIcon}
      />
    </div>
  );
};

