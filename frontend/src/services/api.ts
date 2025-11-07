/**
 * API service for communicating with the backend.
 */

// Get API base URL from environment variable or use relative path
// In development, Vite proxy will forward /api to the backend
// In production, set VITE_API_BASE_URL if backend is on a different domain
const API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  username?: string;
  message?: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>;
}

export interface AgentRequest {
  thread_id?: number;
  parent_message_id?: number;
  messages: AgentMessage[];
  tool_choice?: {
    type: string;
    name?: string[];
  };
}

/**
 * Login with username and password
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<{ username: string } | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/**
 * Stream agent responses from the backend
 */
export async function* streamAgentResponse(
  request: AgentRequest
): AsyncGenerator<{ event: string; data: any }> {
  const response = await fetch(`${API_BASE}/agent/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Agent request failed: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim();
          try {
            const data = JSON.parse(dataStr);
            yield { event: currentEvent || 'message', data };
          } catch (e) {
            // If not valid JSON, yield as-is
            yield { event: currentEvent || 'message', data: dataStr };
          }
          currentEvent = '';
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

