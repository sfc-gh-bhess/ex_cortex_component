import React, { useMemo, useState } from 'react';
import { ResponseEvent } from '../types';
import './ResponseToolHandler.css';

interface ResponseToolHandlerProps {
  events: ResponseEvent[];
}

/**
 * Handles response.tool_use, response.tool_result, response.tool_result.status,
 * and response.tool_result.analyst.delta events
 */
export const ResponseToolHandler: React.FC<ResponseToolHandlerProps> = ({ events }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toolOperations = useMemo(() => {
    const operations: Array<{
      id: string;
      type: string;
      name: string;
      input?: any;
      result?: any;
      status?: string;
      analystDelta?: string;
    }> = [];

    const toolMap = new Map<string, any>();

    for (const event of events) {
      if (event.type === 'response.tool_use') {
        const toolUse = event.data;
        toolMap.set(toolUse.tool_use_id, {
          id: toolUse.tool_use_id,
          type: toolUse.type,
          name: toolUse.name,
          input: toolUse.input,
        });
      } else if (event.type === 'response.tool_result') {
        const toolResult = event.data;
        const existing = toolMap.get(toolResult.tool_use_id) || {};
        toolMap.set(toolResult.tool_use_id, {
          ...existing,
          id: toolResult.tool_use_id,
          result: toolResult.content,
          status: toolResult.status,
        });
      } else if (event.type === 'response.tool_result.status') {
        const { tool_use_id, status } = event.data;
        const existing = toolMap.get(tool_use_id) || {};
        toolMap.set(tool_use_id, {
          ...existing,
          id: tool_use_id,
          status,
        });
      } else if (event.type === 'response.tool_result.analyst.delta') {
        const { tool_use_id, delta } = event.data;
        const existing = toolMap.get(tool_use_id) || {};
        const currentDelta = existing.analystDelta || '';
        toolMap.set(tool_use_id, {
          ...existing,
          id: tool_use_id,
          analystDelta: currentDelta + delta,
        });
      }
    }

    return Array.from(toolMap.values());
  }, [events]);

  if (toolOperations.length === 0) {
    return null;
  }

  // Get a summary for the collapsed state
  const toolSummary = toolOperations.map(t => t.name || t.type).join(', ');

  return (
    <div className="response-tool-container">
      <button
        className="tool-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="tool-toggle-label">
          🔧 Tool Use: {toolSummary} {!isExpanded && '(click to view)'}
        </span>
      </button>

      {isExpanded && (
        <div className="tool-operations">
          {toolOperations.map((tool) => (
            <div key={tool.id} className="tool-operation">
              <div className="tool-header">
                <span className="tool-icon">🔧</span>
                <span className="tool-name">{tool.name || tool.type}</span>
                {tool.status && (
                  <span className={`tool-status tool-status-${tool.status}`}>
                    {tool.status}
                  </span>
                )}
              </div>
              
              {tool.input && (
                <details className="tool-details">
                  <summary>Input Parameters</summary>
                  <pre className="tool-json">{JSON.stringify(tool.input, null, 2)}</pre>
                </details>
              )}
              
              {tool.analystDelta && (
                <div className="tool-analyst-output">
                  <div className="analyst-label">Analyst Output:</div>
                  <div className="analyst-content">{tool.analystDelta}</div>
                </div>
              )}
              
              {tool.result && (
                <div className="tool-result">
                  <div className="result-label">Result:</div>
                  {Array.isArray(tool.result) ? (
                    <div className="result-content">
                      {tool.result.map((item: any, idx: number) => (
                        <div key={idx} className="result-item">
                          {item.type === 'json' ? (
                            <pre className="tool-json">{JSON.stringify(item.json, null, 2)}</pre>
                          ) : item.type === 'text' ? (
                            <div className="result-text">{item.text}</div>
                          ) : (
                            <pre className="tool-json">{JSON.stringify(item, null, 2)}</pre>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="tool-json">{JSON.stringify(tool.result, null, 2)}</pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

