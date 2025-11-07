/**
 * Type definitions for ChatOverlay component
 */

/**
 * Configuration for which response types to display
 */
export interface DisplayConfig {
  showText?: boolean;
  showCharts?: boolean;
  showTables?: boolean;
  showThinking?: boolean;
  showToolUse?: boolean;
  showStatus?: boolean;
}

/**
 * Default display configuration
 * Shows only final results (text, charts, tables) by default
 * Hides internal processes (thinking, tool use, status) for cleaner UX
 */
export const defaultDisplayConfig: Required<DisplayConfig> = {
  showText: true,
  showCharts: true,
  showTables: true,
  showThinking: false,
  showToolUse: false,
  showStatus: false,
};

export interface ChatOverlayProps {
  position?: {
    bottom?: string;
    right?: string;
  };
  size?: {
    width?: string;
    height?: string;
  };
  userMessageColor?: string;
  agentMessageColor?: string;
  submitIcon?: string;
  displayConfig?: DisplayConfig;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  events?: ResponseEvent[];
  isComplete?: boolean;
}

export interface ResponseEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface StreamingState {
  text: string;
  thinking: string;
  toolUses: ToolUseEvent[];
  toolResults: ToolResultEvent[];
  tables: TableEvent[];
  charts: ChartEvent[];
  annotations: AnnotationEvent[];
  status: string;
}

export interface ToolUseEvent {
  tool_use_id: string;
  type: string;
  name: string;
  input: Record<string, any>;
}

export interface ToolResultEvent {
  tool_use_id: string;
  type: string;
  name: string;
  content: any[];
  status: string;
}

export interface TableEvent {
  data: any;
}

export interface ChartEvent {
  data: any;
}

export interface AnnotationEvent {
  text: string;
  citations?: Array<{
    source: string;
    url?: string;
  }>;
}

