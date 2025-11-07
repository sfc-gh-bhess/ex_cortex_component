import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResponseEvent } from '../types';
import './ResponseTextHandler.css';

interface ResponseTextHandlerProps {
  events: ResponseEvent[];
}

/**
 * Handles response.text, response.text.delta, and response.text.annotation events
 */
export const ResponseTextHandler: React.FC<ResponseTextHandlerProps> = ({ events }) => {
  const { text, annotations } = useMemo(() => {
    let accumulatedText = '';
    const annotationsList: Array<{ text: string; citations?: any[] }> = [];

    for (const event of events) {
      if (event.type === 'response.text.delta') {
        // Accumulate delta text
        if (event.data.delta) {
          accumulatedText += event.data.delta;
        }
      } else if (event.type === 'response.text') {
        // Final text replaces accumulated deltas
        if (event.data.text) {
          accumulatedText = event.data.text;
        }
      } else if (event.type === 'response.text.annotation') {
        // Store annotations
        annotationsList.push(event.data);
      }
    }

    return { text: accumulatedText, annotations: annotationsList };
  }, [events]);

  return (
    <div className="response-text-container">
      {text && (
        <div className="response-text">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for code blocks
              code: ({node, inline, className, children, ...props}) => {
                return inline ? (
                  <code className="inline-code" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="code-block" {...props}>
                    {children}
                  </code>
                );
              },
              // Ensure tables are responsive
              table: ({node, ...props}) => (
                <div className="markdown-table-wrapper">
                  <table {...props} />
                </div>
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      )}
      
      {annotations.length > 0 && (
        <div className="response-annotations">
          {annotations.map((annotation, idx) => (
            <div key={idx} className="annotation">
              <div className="annotation-text">{annotation.text}</div>
              {annotation.citations && annotation.citations.length > 0 && (
                <div className="annotation-citations">
                  {annotation.citations.map((citation: any, cidx: number) => (
                    <a
                      key={cidx}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="citation-link"
                    >
                      [{cidx + 1}] {citation.source}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

