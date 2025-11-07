/**
 * Type definitions for the application
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  events?: StreamEvent[];
  isStreaming?: boolean;
}

export interface StreamEvent {
  type: string;
  data: any;
  timestamp: Date;
}

// Event types from Cortex Agent API
export type ResponseEventType =
  | 'response'
  | 'response.text'
  | 'response.text.delta'
  | 'response.text.annotation'
  | 'response.thinking'
  | 'response.thinking.delta'
  | 'response.tool_use'
  | 'response.tool_result'
  | 'response.tool_result.status'
  | 'response.tool_result.analyst.delta'
  | 'response.table'
  | 'response.chart'
  | 'response.status'
  | 'error';

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ThinkingContent {
  type: 'thinking';
  thinking: string;
}

export interface ToolUse {
  tool_use_id: string;
  type: string;
  name: string;
  input: Record<string, any>;
  client_side_execute?: boolean;
}

export interface ToolResult {
  tool_use_id: string;
  type: string;
  name: string;
  content: Array<{ type: string; [key: string]: any }>;
  status: string;
}

export interface TableContent {
  type: 'table';
  data: {
    headers: string[];
    rows: any[][];
  };
}

export interface ChartContent {
  type: 'chart';
  data: any;
}

export interface Annotation {
  type: 'annotation';
  text: string;
  citations?: Array<{
    source: string;
    url?: string;
  }>;
}

