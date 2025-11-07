import { useState, useEffect, useMemo } from 'react';
import { Login } from './components/Login/Login';
import { ChatOverlayWithStreaming } from './components/ChatOverlay/ChatOverlayWithStreaming';
import { DisplayConfig } from './components/ChatOverlay/types';
import { getCurrentUser, logout } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert environment variables to displayConfig
  // This allows the app to use env vars while keeping the component portable
  const displayConfig = useMemo<DisplayConfig>(() => ({
    showText: import.meta.env.VITE_SHOW_TEXT !== 'false',
    showCharts: import.meta.env.VITE_SHOW_CHARTS !== 'false',
    showTables: import.meta.env.VITE_SHOW_TABLES !== 'false',
    showThinking: import.meta.env.VITE_SHOW_THINKING === 'true',
    showToolUse: import.meta.env.VITE_SHOW_TOOL_USE === 'true',
    showStatus: import.meta.env.VITE_SHOW_STATUS === 'true',
  }), []);

  useEffect(() => {
    // Check if user is already authenticated
    getCurrentUser()
      .then((userData) => {
        if (userData) {
          setUser(userData.username);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cortex Agent Chat</h1>
        <div className="header-right">
          <span className="username">Welcome, {user}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="welcome-section">
          <h2>Welcome to Cortex Agent</h2>
          <p>
            Use the chat overlay to interact with your Snowflake Cortex Agent.
            Click the chat bubble in the bottom right to get started.
          </p>
        </div>
      </main>

      <ChatOverlayWithStreaming displayConfig={displayConfig} />
    </div>
  );
}

export default App;

