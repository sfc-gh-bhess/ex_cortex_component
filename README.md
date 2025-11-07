# Snowflake Cortex Agent Application

An educational example application demonstrating how to interact with Snowflake Cortex Agents. This 3-tier web application features a React frontend with a beautiful chat interface and a Python FastAPI backend that proxies requests to the Cortex Agent API.

## Overview

This application is designed to help developers learn how to build applications that integrate with Snowflake Cortex Agents. It provides a complete, working example that can be customized and extended for specific use cases.

This example works with any Cortex Agent that you have created. 

### Key Features

- **User Authentication**: Login/logout with Snowflake database authentication
- **Chat Overlay Component**: Minimizable, floating, and **resizable** chat interface
- **Streaming Responses**: Real-time display of agent responses as they arrive
- **Comprehensive Event Handling**: Display components for all Cortex Agent response types:
  - **Markdown-rendered text** with full formatting support
  - Annotations and citations with links
  - Thinking process visualization (collapsible)
  - Tool usage and results
  - Tables with horizontal scroll
  - **Interactive charts** (bar, line, pie) using Recharts
  - Real-time status indicators
- **Responsive Design**: All components fit within chat window with individual horizontal scrollbars
- **Customizable Backend**: Easy-to-override request preparation function
- **Optional SQL Filtering**: Hide SQL queries from end users
- **Packageable Component**: Chat overlay can be exported as an npm package

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  (React + TypeScript + Vite)                                │
│  - Login UI                                                  │
│  - Chat Overlay Component                                    │
│  - Event-specific Response Handlers                          │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP + SSE
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                         Backend                              │
│  (Python + FastAPI)                                          │
│  - Authentication Endpoints                                  │
│  - Agent Proxy with Streaming                                │
│  - Customizable Request Preparation                          │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS + PAT Token
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                  Snowflake Cortex Agent API                  │
│  - Agent Orchestration                                       │
│  - Tool Execution                                            │
│  - Response Streaming                                        │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

For a streamlined setup experience, see [SETUP.md](SETUP.md) for step-by-step instructions.

### Prerequisites

- **Python 3.9+** for backend
- **Node.js 18+** for frontend
- **Snowflake account** with:
  - Cortex Agent configured
  - PAT token for API access
  - Users table for authentication

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create and configure .env file
cp env.example .env
# Edit .env with your Snowflake credentials and API endpoints

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend uses `.env` file for configuration. See [backend/README.md](backend/README.md) for detailed setup instructions and all available environment variables.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# (Optional) Create .env file for custom backend URL
cp env.example .env
# Edit .env if your backend is not at http://localhost:8000

# Run the development server
npm run dev
```

Access the application at `http://localhost:5173`.

The frontend can optionally use a `.env` file to configure the backend API URL. See [frontend/README.md](frontend/README.md) for detailed setup instructions.

### 3. Database Setup

Create a users table in Snowflake:

```sql
CREATE TABLE users (
    username VARCHAR,
    password VARCHAR
);

-- Insert a test user
INSERT INTO users (username, password) VALUES ('testuser', 'testpass');
```

**Note**: This example uses plaintext passwords for simplicity. In production, use proper password hashing (bcrypt, argon2, etc.).

## Project Structure

```
cortex-agent-app/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── config.py       # Configuration
│   │   ├── auth.py         # Authentication
│   │   ├── agent.py        # Agent proxy
│   │   └── snowflake_client.py
│   ├── requirements.txt
│   └── README.md
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/
│   │   │   └── ChatOverlay/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── README.md
├── Instructions.md          # Original requirements
└── README.md               # This file
```

## Configuration

Both the frontend and backend use `.env` files for configuration. This makes it easy to manage environment-specific settings without modifying code.

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp env.example .env
```

Configure the following variables in `backend/.env`:

```env
# Cortex API
SNOWFLAKE_PAT_TOKEN=your_pat_token
SNOWFLAKE_AGENT_API_ENDPOINT=https://your-account.snowflakecomputing.com/api/v2/databases/DB/schemas/SCHEMA/agents/AGENT:run
SNOWFLAKE_SQL_API_ENDPOINT=https://your-account.snowflakecomputing.com/api/v2/statements

# Filtering
REMOVE_SQL_FROM_RESPONSE=false

# Session
SESSION_SECRET_KEY=your-secret-key-change-in-production

# Database Connection
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
SNOWFLAKE_WAREHOUSE=your_warehouse

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

The backend uses [python-dotenv](https://pypi.org/project/python-dotenv/) to automatically load these variables.

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory (optional):

```bash
cd frontend
cp env.example .env
```

Configure in `frontend/.env`:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# Response Display Configuration (optional)
# Control which types of agent responses are shown (defaults shown)
VITE_SHOW_TEXT=true
VITE_SHOW_CHARTS=true
VITE_SHOW_TABLES=true
VITE_SHOW_THINKING=false
VITE_SHOW_TOOL_USE=false
VITE_SHOW_STATUS=false
```

**Note:** 
- Vite requires environment variables to be prefixed with `VITE_` to be available in the application
- The default backend URL is `http://localhost:8000` if not specified
- In development, Vite's proxy forwards `/api` requests to the backend
- For production, set this to your backend's public URL if on a different domain

**Response Display Configuration:**
- By default, only **text, charts, and tables** are shown to end users
- **Thinking, tool use, and status** are hidden by default to reduce UI clutter
- Set these to `true` in development/debug mode to see the agent's internal processes
- See [frontend/README.md](frontend/README.md) for detailed configuration options and use cases

## Customization

This application is designed to be easily customizable:

### Backend Customization

#### Custom Request Preparation

Override the `prepare_agent_request()` function in `backend/app/agent.py`:

```python
def prepare_agent_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    # Add custom instructions
    request_data['instructions'] = {
        'response': 'Be concise and clear.'
    }
    return request_data
```

#### SQL Filtering

Set `REMOVE_SQL_FROM_RESPONSE=true` to hide SQL from responses.

### Frontend Customization

#### Chat Overlay Styling

Configure the ChatOverlay component:

```tsx
<ChatOverlay
  position={{ bottom: '20px', right: '20px' }}
  size={{ width: '400px', height: '600px' }}
  userMessageColor="#e3f2fd"
  agentMessageColor="#f5f5f5"
  submitIcon="➤"
/>
```

#### Adding New Event Handlers

Create custom handlers in `frontend/src/components/ChatOverlay/handlers/` for specialized event types.

## Cortex Agent Response Types

The application handles all streaming response event types from the Cortex Agent API:

| Event Type | Description | Handler |
|------------|-------------|---------|
| `response.text.delta` | Streaming text content | ResponseTextHandler |
| `response.text` | Final text | ResponseTextHandler |
| `response.text.annotation` | Citations/references | ResponseTextHandler |
| `response.thinking.delta` | Streaming reasoning | ResponseThinkingHandler |
| `response.thinking` | Final reasoning | ResponseThinkingHandler |
| `response.tool_use` | Tool invocation | ResponseToolHandler |
| `response.tool_result` | Tool results | ResponseToolHandler |
| `response.tool_result.status` | Tool execution status | ResponseToolHandler |
| `response.tool_result.analyst.delta` | Streaming analyst output | ResponseToolHandler |
| `response.table` | Table data | ResponseDataHandler |
| `response.chart` | Chart data | ResponseDataHandler |
| `response.status` | Status messages | ResponseStatusHandler |
| `response` | Final complete response | ResponseFinalHandler |
| `error` | Error events | ErrorHandler |

See the [Snowflake Cortex Agents documentation](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-run#streaming-responses) for details.

## Using the Chat Component in Other Applications

The ChatOverlay component can be packaged and used in other React applications:

### Build as Library

```bash
cd frontend
npm run build:lib
```

### Import in Another Project

```tsx
import { ChatOverlay } from '@cortex-agent/chat-overlay';
import '@cortex-agent/chat-overlay/dist/style.css';

function MyApp() {
  return (
    <div>
      <h1>My Application</h1>
      <ChatOverlay />
    </div>
  );
}
```

See [frontend/README.md](frontend/README.md) for detailed packaging instructions.

## Development Workflow

1. **Start the backend** in one terminal:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start the frontend** in another terminal:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Make changes** and see them hot-reload automatically

4. **Test the application**:
   - Login with your test user
   - Send messages to the Cortex Agent
   - Verify streaming responses display correctly

## Production Deployment

### Backend

1. Set strong `SESSION_SECRET_KEY`
2. Use HTTPS
3. Implement proper password hashing
4. Configure appropriate CORS origins
5. Set up logging and monitoring
6. Use production WSGI server (gunicorn + uvicorn workers)

### Frontend

1. Build for production: `npm run build`
2. Serve static files with nginx or CDN
3. Configure proper API endpoints
4. Enable compression and caching
5. Set up error tracking

## Educational Purpose

This application is designed for learning and customization:

- **Clear Code Structure**: Easy to understand and modify
- **Comprehensive Comments**: Explains key concepts
- **Customization Points**: Designed for extension
- **Best Practices**: Demonstrates proper patterns
- **Type Safety**: TypeScript for frontend reliability

Feel free to fork this project and adapt it for your specific use case!

## Documentation Links

- [Snowflake Cortex Agents](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents)
- [Cortex Agent API](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-run)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Troubleshooting

### Backend Issues

- **Authentication errors**: Check Snowflake credentials and user table
- **Cortex API errors**: Verify PAT token and API endpoint
- **CORS errors**: Add frontend URL to CORS_ORIGINS

### Frontend Issues

- **Login not working**: Ensure backend is running
- **Streaming not working**: Check browser console for errors
- **Styling issues**: Clear cache and rebuild

See individual README files for component-specific troubleshooting.

## Contributing

This is an educational example. Feel free to:

- Fork and customize for your needs
- Submit issues for bugs or questions
- Share your customizations with the community

## License

MIT License - feel free to use this code for learning and building your own applications.

## Support

For questions about:
- **This example**: Open an issue in this repository
- **Snowflake Cortex Agents**: See Snowflake documentation
- **FastAPI**: See FastAPI documentation
- **React**: See React documentation

