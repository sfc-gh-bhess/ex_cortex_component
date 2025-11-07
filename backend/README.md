# Cortex Agent Backend

This is the backend service for the Cortex Agent application. It provides a proxy to the Snowflake Cortex Agent API with authentication and streaming support.

## Features

- **User Authentication**: Login/logout with Snowflake database authentication
- **Agent Proxy**: Streams responses from Cortex Agent API to frontend
- **Customizable Requests**: Override `prepare_agent_request()` to customize API requests
- **SQL Filtering**: Optional removal of SQL from responses via environment variable
- **Session Management**: Secure signed cookies for user sessions

## Setup

### Prerequisites

- Python 3.9 or higher
- Access to a Snowflake account
- Snowflake PAT token for Cortex API access

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
cp env.example .env

# Or create a new .env file
touch .env
```

3. Configure environment variables in `.env`:

The backend uses [python-dotenv](https://pypi.org/project/python-dotenv/) to load environment variables from a `.env` file. This file should be placed in the `backend` directory (same level as the `app` folder).

```env
# Snowflake Cortex API Configuration
SNOWFLAKE_PAT_TOKEN=your_pat_token_here
SNOWFLAKE_AGENT_API_ENDPOINT=https://your-account.snowflakecomputing.com/api/v2/databases/DB/schemas/SCHEMA/agents/AGENT:run
SNOWFLAKE_SQL_API_ENDPOINT=https://your-account.snowflakecomputing.com/api/v2/statements

# SQL Response Filtering
REMOVE_SQL_FROM_RESPONSE=false

# Session Cookie Configuration
SESSION_SECRET_KEY=your-secret-key-here-change-in-production

# Snowflake Authentication Database Connection
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
SNOWFLAKE_WAREHOUSE=your_warehouse

# CORS Origins (comma-separated list of allowed origins)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Environment Variable Details:**

| Variable | Required | Description |
|----------|----------|-------------|
| `SNOWFLAKE_PAT_TOKEN` | Yes | Personal Access Token for Cortex API authentication |
| `SNOWFLAKE_AGENT_API_ENDPOINT` | Yes | Full URL to your Cortex Agent API endpoint |
| `SNOWFLAKE_SQL_API_ENDPOINT` | Yes | Snowflake SQL API endpoint |
| `REMOVE_SQL_FROM_RESPONSE` | No | Set to `true` to filter SQL from responses (default: `false`) |
| `SESSION_SECRET_KEY` | Yes | Secret key for signing session cookies (change in production!) |
| `SNOWFLAKE_ACCOUNT` | Yes | Snowflake account identifier |
| `SNOWFLAKE_USER` | Yes | Snowflake user for database authentication |
| `SNOWFLAKE_PASSWORD` | Yes | Snowflake password |
| `SNOWFLAKE_DATABASE` | Yes | Database containing the users table |
| `SNOWFLAKE_SCHEMA` | Yes | Schema containing the users table |
| `SNOWFLAKE_WAREHOUSE` | Yes | Warehouse to use for queries |
| `CORS_ORIGINS` | No | Comma-separated list of allowed CORS origins (default: `http://localhost:3000,http://localhost:5173`) |

### Database Setup

Create a users table in your Snowflake database:

```sql
CREATE TABLE users (
    userid VARCHAR,
    password VARCHAR
);

-- Insert test user (in production, use hashed passwords)
INSERT INTO users (userid, password) VALUES ('testuser', 'testpass');
```

## Running the Backend

Start the development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### Authentication

#### POST `/api/auth/login`

Authenticate a user and create a session.

**Request:**
```json
{
  "username": "testuser",
  "password": "testpass"
}
```

**Response:**
```json
{
  "success": true,
  "username": "testuser",
  "message": "Login successful"
}
```

#### POST `/api/auth/logout`

Log out the user by clearing the session cookie.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me`

Get information about the currently authenticated user.

**Response:**
```json
{
  "username": "testuser"
}
```

### Agent Proxy

#### POST `/api/agent/run`

Proxy requests to the Cortex Agent API and stream responses.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is the total revenue for 2023?"
        }
      ]
    }
  ],
  "tool_choice": {
    "type": "auto",
    "name": ["analyst_tool"]
  }
}
```

**Response:** Server-Sent Events stream with various event types (see Cortex Agent API documentation).

## Customization

### Customizing Agent Requests

You can override the `prepare_agent_request()` function in `app/agent.py` to customize how requests are formatted before sending to the Cortex API:

```python
def prepare_agent_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Customize the request to send to the Cortex Agent API.
    
    Example: Add custom instructions or modify tool choices
    """
    # Add custom instructions
    request_data['instructions'] = {
        'response': 'Please provide detailed explanations.'
    }
    
    # Modify tool choices
    if 'tool_choice' not in request_data:
        request_data['tool_choice'] = {
            'type': 'auto',
            'name': ['analyst_tool', 'search_tool']
        }
    
    return request_data
```

### SQL Filtering

Set `REMOVE_SQL_FROM_RESPONSE=true` in your `.env` file to automatically remove SQL content from agent responses. This is useful when you don't want to expose query details to end users.

## Development

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration and environment variables
│   ├── auth.py              # Authentication endpoints
│   ├── agent.py             # Agent proxy endpoints
│   └── snowflake_client.py  # Snowflake connections
├── requirements.txt
├── .env.example
└── README.md
```

### Testing

You can test the API endpoints using curl or any HTTP client:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  -c cookies.txt

# Get current user
curl -X GET http://localhost:8000/api/auth/me \
  -b cookies.txt

# Test agent endpoint
curl -X POST http://localhost:8000/api/agent/run \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": [{"type": "text", "text": "Hello"}]
      }
    ]
  }'
```

## Production Deployment

1. **Change the session secret key** to a strong random value
2. **Use HTTPS** for all communications
3. **Use environment-specific configuration** (separate .env files)
4. **Implement proper password hashing** (bcrypt, argon2, etc.)
5. **Set up logging and monitoring**
6. **Configure CORS origins** appropriately for your frontend domains

## Troubleshooting

### "Authentication error" when logging in

- Verify your Snowflake credentials in `.env`
- Ensure the users table exists with the correct schema
- Check that the user exists in the database

### "Cortex API error" when making agent requests

- Verify your PAT token is valid
- Check that the Agent API endpoint URL is correct
- Ensure you have permissions to access the Cortex Agent

### CORS errors

- Add your frontend URL to `CORS_ORIGINS` in `app/config.py`
- Ensure credentials are being sent with requests

## License

MIT

