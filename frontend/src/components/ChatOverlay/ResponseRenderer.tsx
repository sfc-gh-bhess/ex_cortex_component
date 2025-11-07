import React, { useMemo } from 'react';
import { ChatMessage, ResponseEvent, DisplayConfig, defaultDisplayConfig } from './types';
import { ResponseTextHandler } from './handlers/ResponseTextHandler';
import { ResponseThinkingHandler } from './handlers/ResponseThinkingHandler';
import { ResponseToolHandler } from './handlers/ResponseToolHandler';
import { ResponseDataHandler } from './handlers/ResponseDataHandler';
import { ResponseStatusHandler } from './handlers/ResponseStatusHandler';
import './ResponseRenderer.css';

interface ResponseRendererProps {
  message: ChatMessage;
  displayConfig?: DisplayConfig;
}

type RenderItem = {
  type: 'text' | 'thinking' | 'tool' | 'data' | 'status';
  events: ResponseEvent[];
  key: string;
};

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  message, 
  displayConfig = defaultDisplayConfig 
}) => {
  // Merge provided config with defaults
  const config = { ...defaultDisplayConfig, ...displayConfig };
  // If message has events, render based on events
  // Otherwise, render simple text content
  if (!message.events || message.events.length === 0) {
    return <div className="message-text">{message.content || 'Processing...'}</div>;
  }

  const renderItems = useMemo(() => {
    const items: RenderItem[] = [];
    let textEvents: ResponseEvent[] = [];
    let currentThinkingEvents: ResponseEvent[] = [];
    let currentToolId: string | null = null;
    let currentToolEvents: ResponseEvent[] = [];
    let itemCounter = 0;

    const flushTextEvents = () => {
      if (textEvents.length > 0) {
        items.push({
          type: 'text',
          events: [...textEvents],
          key: `text-${itemCounter++}`,
        });
        textEvents = [];
      }
    };

    const flushThinkingEvents = () => {
      if (currentThinkingEvents.length > 0) {
        items.push({
          type: 'thinking',
          events: [...currentThinkingEvents],
          key: `thinking-${itemCounter++}`,
        });
        currentThinkingEvents = [];
      }
    };

    const flushToolEvents = () => {
      if (currentToolEvents.length > 0) {
        items.push({
          type: 'tool',
          events: [...currentToolEvents],
          key: `tool-${currentToolId || itemCounter++}`,
        });
        currentToolEvents = [];
        currentToolId = null;
      }
    };

    for (const event of message.events) {
      // Handle text events - accumulate them
      if (event.type.startsWith('response.text')) {
        textEvents.push(event);
      }
      // Handle thinking events
      else if (event.type.startsWith('response.thinking')) {
        // Flush any pending text before showing thinking
        flushTextEvents();
        currentThinkingEvents.push(event);
        // Check if this is the end of a thinking sequence (non-delta event)
        if (event.type === 'response.thinking') {
          flushThinkingEvents();
        }
      }
      // Handle tool events
      else if (event.type.startsWith('response.tool')) {
        flushTextEvents();
        
        // Get the tool_use_id from the event data
        const toolUseId = event.data.tool_use_id;
        
        // If this is a different tool, flush the previous one
        if (toolUseId && currentToolId && toolUseId !== currentToolId) {
          flushToolEvents();
        }
        
        if (toolUseId) {
          currentToolId = toolUseId;
        }
        currentToolEvents.push(event);
        
        // If this is a tool_result (final event), flush
        if (event.type === 'response.tool_result') {
          flushToolEvents();
        }
      }
      // Handle data events (table, chart) - show inline
      else if (event.type === 'response.table' || event.type === 'response.chart') {
        flushTextEvents();
        flushThinkingEvents();
        flushToolEvents();
        items.push({
          type: 'data',
          events: [event],
          key: `data-${itemCounter++}`,
        });
      }
      // Handle status events - show inline
      else if (event.type === 'response.status') {
        flushTextEvents();
        items.push({
          type: 'status',
          events: [event],
          key: `status-${itemCounter++}`,
        });
      }
      // For any other events, continue accumulating text if applicable
      else if (event.type === 'response' || event.type === 'done' || event.type === 'message_stop') {
        // These are completion events, flush everything
        flushTextEvents();
        flushThinkingEvents();
        flushToolEvents();
      }
    }

    // Flush any remaining events
    flushTextEvents();
    flushThinkingEvents();
    flushToolEvents();

    return items;
  }, [message.events]);

  // Filter items based on display configuration
  const filteredItems = renderItems.filter((item) => {
    switch (item.type) {
      case 'text':
        return config.showText;
      case 'thinking':
        return config.showThinking;
      case 'tool':
        return config.showToolUse;
      case 'status':
        return config.showStatus;
      case 'data':
        // For data items, check if it's a chart or table
        const dataEvent = item.events[0];
        if (dataEvent.type === 'response.chart') {
          return config.showCharts;
        } else if (dataEvent.type === 'response.table') {
          return config.showTables;
        }
        return true;
      default:
        return true;
    }
  });

  return (
    <div className="response-container">
      {filteredItems.map((item) => {
        switch (item.type) {
          case 'text':
            return <ResponseTextHandler key={item.key} events={item.events} />;
          case 'thinking':
            return <ResponseThinkingHandler key={item.key} events={item.events} />;
          case 'tool':
            return <ResponseToolHandler key={item.key} events={item.events} />;
          case 'data':
            return <ResponseDataHandler key={item.key} events={item.events} />;
          case 'status':
            return <ResponseStatusHandler key={item.key} events={item.events} />;
          default:
            return null;
        }
      })}
      
      {!message.isComplete && (
        <div className="streaming-indicator">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}
    </div>
  );
};

