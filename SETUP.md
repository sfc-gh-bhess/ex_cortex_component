# Quick Setup Guide

This guide will help you get the Cortex Agent application up and running quickly.

## Prerequisites

- Python 3.9+
- Node.js 18+
- Snowflake account with Cortex Agent access
- Snowflake PAT token

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd /path/to/cortex-agent-app
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from example
cp env.example .env

# Edit .env with your Snowflake credentials
# Required variables:
#   - SNOWFLAKE_PAT_TOKEN
#   - SNOWFLAKE_AGENT_API_ENDPOINT
#   - SNOWFLAKE_DATABASE
#   - SNOWFLAKE_SCHEMA
#   - SNOWFLAKE_WAREHOUSE
#   - SESSION_SECRET_KEY (generate a random string)
nano .env  # or use your preferred editor
```

### 3. Database Setup

Connect to Snowflake and create the users table:

```sql
-- Create users table
CREATE TABLE users (
    username VARCHAR,
    password VARCHAR
);

-- Insert test user
INSERT INTO users (username, password) VALUES ('testuser', 'testpass');
```

### 4. Start Backend

```bash
# From backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Leave this running and open a new terminal.

### 5. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install Node dependencies (includes recharts for chart rendering)
npm install

# (Optional) Create .env file for custom configuration
cp env.example .env
# Edit if needed:
#   VITE_API_BASE_URL=http://localhost:8000
#   
#   Response Display Configuration (defaults shown):
#   VITE_SHOW_TEXT=true         # Text responses
#   VITE_SHOW_CHARTS=true       # Chart visualizations
#   VITE_SHOW_TABLES=true       # Table data
#   VITE_SHOW_THINKING=false    # Agent thinking (hidden by default)
#   VITE_SHOW_TOOL_USE=false    # Tool operations (hidden by default)
#   VITE_SHOW_STATUS=false      # Status messages (hidden by default)
```

**Note:** The frontend includes the Recharts library for rendering charts returned by the Cortex Agent. This is automatically installed with `npm install`.

**Response Display:** By default, the chat shows only text, charts, and tables. Set thinking, tool use, and status to `true` in your `.env` file to see the agent's internal processes (useful for development/debugging).

### 6. Start Frontend

```bash
# From frontend directory
npm run dev
```

### 7. Access Application

Open your browser to: `http://localhost:5173`

Login with:
- Username: `testuser`
- Password: `testpass`

## Troubleshooting

### Backend won't start

- Check that all required environment variables are set in `backend/.env`
- Verify Snowflake credentials are correct
- Ensure Python dependencies are installed: `pip install -r requirements.txt`

### Frontend won't start

- Ensure Node.js 18+ is installed: `node --version`
- Install dependencies: `npm install`
- Check that port 5173 is not in use

### Can't login

- Verify the users table exists in Snowflake
- Check database credentials in `backend/.env`
- Look at backend logs for error messages

### Authentication errors with Cortex API

- Verify your PAT token is valid and not expired
- Check that the `SNOWFLAKE_AGENT_API_ENDPOINT` URL is correct
- Ensure you have permissions to access the Cortex Agent

## Environment Files Summary

### Backend `.env` (Required)

Location: `backend/.env`

```env
SNOWFLAKE_PAT_TOKEN=your_token
SNOWFLAKE_AGENT_API_ENDPOINT=https://...
SNOWFLAKE_SQL_API_ENDPOINT=https://...
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
SNOWFLAKE_WAREHOUSE=your_warehouse
SESSION_SECRET_KEY=generate-random-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
REMOVE_SQL_FROM_RESPONSE=false
```

### Frontend `.env` (Optional)

Location: `frontend/.env`

```env
# Backend API URL (defaults to http://localhost:8000)
VITE_API_BASE_URL=http://localhost:8000

# Response Display Configuration (defaults shown)
VITE_SHOW_TEXT=true
VITE_SHOW_CHARTS=true
VITE_SHOW_TABLES=true
VITE_SHOW_THINKING=false
VITE_SHOW_TOOL_USE=false
VITE_SHOW_STATUS=false
```

Only needed if:
- Your backend is not at `http://localhost:8000`, or
- You want to customize which response types are displayed (e.g., show thinking/tool use for debugging)

## Next Steps

- Read [README.md](README.md) for full documentation
- See [backend/README.md](backend/README.md) for backend customization
- See [frontend/README.md](frontend/README.md) for frontend customization
- Customize the agent request preparation in `backend/app/agent.py`
- Adjust chat overlay styling and configuration

## Production Deployment

Before deploying to production:

1. Generate a strong `SESSION_SECRET_KEY`
2. Use HTTPS for all communications
3. Implement proper password hashing
4. Configure appropriate CORS origins
5. Set up logging and monitoring
6. Use production WSGI server (gunicorn)
7. Build frontend for production: `npm run build`

See individual README files for detailed deployment instructions.

