import React from 'react';
import { ResponseEvent } from '../types';
import './ResponseStatusHandler.css';

interface ResponseStatusHandlerProps {
  events: ResponseEvent[];
}

/**
 * Handles response.status events
 * Shows status messages inline
 */
export const ResponseStatusHandler: React.FC<ResponseStatusHandlerProps> = ({
  events,
}) => {
  if (events.length === 0) {
    return null;
  }

  // Display status inline (typically only one event passed at a time)
  return (
    <div className="response-status-container">
      {events.map((event, idx) => {
        const statusText = event.data.status || event.data.message || event.data.text || 'Processing...';
        
        return (
          <div key={idx} className="status-indicator status-inline">
            <span className="status-icon">⚙️</span>
            <span className="status-text">{statusText}</span>
          </div>
        );
      })}
    </div>
  );
};

