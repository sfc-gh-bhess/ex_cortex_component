import React, { useMemo, useState } from 'react';
import { ResponseEvent } from '../types';
import './ResponseThinkingHandler.css';

interface ResponseThinkingHandlerProps {
  events: ResponseEvent[];
}

/**
 * Handles response.thinking and response.thinking.delta events
 * Displays thinking in a collapsible section
 */
export const ResponseThinkingHandler: React.FC<ResponseThinkingHandlerProps> = ({
  events,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const thinkingText = useMemo(() => {
    let accumulated = '';

    for (const event of events) {
      if (event.type === 'response.thinking.delta') {
        // Accumulate delta thinking
        const delta = event.data.delta || event.data.text || event.data.thinking || '';
        accumulated += delta;
      } else if (event.type === 'response.thinking') {
        // Final thinking replaces accumulated deltas
        const finalThinking = event.data.thinking || event.data.text || '';
        if (finalThinking) {
          accumulated = finalThinking;
        }
      }
    }

    return accumulated;
  }, [events]);

  if (!thinkingText) {
    return null;
  }

  return (
    <div className="response-thinking-container">
      <button
        className="thinking-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="thinking-label">
          🤔 Agent Thinking {!isExpanded && '(click to view)'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="thinking-content">
          {thinkingText}
        </div>
      )}
    </div>
  );
};

