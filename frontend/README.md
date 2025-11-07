# Cortex Agent Chat Frontend

A React-based frontend application for interacting with Snowflake Cortex Agents. Features a beautiful chat overlay component that can be embedded in any React application.

## Features

- **Login/Authentication**: Secure cookie-based authentication
- **Chat Overlay**: Floating, minimizable, and **resizable** chat interface
- **Streaming Responses**: Real-time display of agent responses
- **Event Type Handlers**: Specialized display for each Cortex Agent response type:
  - **Text responses** - Rendered as Markdown with full formatting support (bold, italic, links, code, tables, etc.)
  - **Annotations** - Citations and references displayed as links
  - **Thinking process** - Collapsible section to view agent reasoning
  - **Tool usage and results** - Formatted display of tool invocations
  - **Tables** - Rendered with proper formatting and horizontal scroll
  - **Charts** - Interactive visualizations (bar, line, pie) using Recharts
  - **Status indicators** - Real-time progress updates
- **Customizable Styling**: Configurable colors, position, and size
- **NPM Package**: ChatOverlay component can be packaged and used in other applications

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend server running (see `../backend/README.md`)

### Installation

1. Install dependencies:

```bash
npm install
```

This will install all required dependencies including:
- React and React DOM
- TypeScript and build tools
- **Recharts** - for rendering charts from Cortex Agent responses
- **React Markdown** - for rendering markdown-formatted text responses
- ESLint and other development tools

2. (Optional) Create a `.env` file for environment-specific configuration:

```bash
# Copy the example file
cp env.example .env

# Or create a new .env file
touch .env
```

3. Configure environment variables in `.env`:

```env
# Backend API URL (used by Vite dev server proxy)
# Default is http://localhost:8000 if not specified
VITE_API_BASE_URL=http://localhost:8000

# Response Display Configuration
# Control which types of agent responses are shown (true/false)
VITE_SHOW_TEXT=true
VITE_SHOW_CHARTS=true
VITE_SHOW_TABLES=true
VITE_SHOW_THINKING=false
VITE_SHOW_TOOL_USE=false
VITE_SHOW_STATUS=false
```

**Note:** Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client code.

**Environment Variable Details:**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend API URL for development proxy and production builds |
| `VITE_SHOW_TEXT` | No | `true` | Show text responses from the agent |
| `VITE_SHOW_CHARTS` | No | `true` | Show chart visualizations |
| `VITE_SHOW_TABLES` | No | `true` | Show table data |
| `VITE_SHOW_THINKING` | No | `false` | Show agent thinking processes |
| `VITE_SHOW_TOOL_USE` | No | `false` | Show tool use operations |
| `VITE_SHOW_STATUS` | No | `false` | Show status messages |

#### Development vs Production

- **Development**: The Vite dev server uses a proxy to forward `/api/*` requests to the backend. Configure the backend URL in `.env` with `VITE_API_BASE_URL`.

- **Production**: If your frontend and backend are served from the same domain, no configuration is needed. If they're on different domains, set `VITE_API_BASE_URL` to the full backend URL (e.g., `https://api.example.com`).

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

Build the main application:

```bash
npm run build
```

Build the ChatOverlay as a standalone library:

```bash
npm run build:lib
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login/              # Login component
│   │   │   ├── Login.tsx
│   │   │   └── Login.css
│   │   └── ChatOverlay/        # Main chat component
│   │       ├── ChatOverlay.tsx
│   │       ├── ChatOverlayWithStreaming.tsx
│   │       ├── ChatMessage.tsx
│   │       ├── ChatInput.tsx
│   │       ├── ResponseRenderer.tsx
│   │       ├── types.ts
│   │       ├── index.ts        # Package export
│   │       └── handlers/       # Event-specific handlers
│   │           ├── ResponseTextHandler.tsx
│   │           ├── ResponseThinkingHandler.tsx
│   │           ├── ResponseToolHandler.tsx
│   │           ├── ResponseDataHandler.tsx
│   │           └── ResponseStatusHandler.tsx
│   ├── services/
│   │   └── api.ts              # API client
│   ├── types.ts                # Type definitions
│   ├── App.tsx                 # Main application
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts              # Main app config
├── vite.config.lib.ts          # Library build config
└── README.md
```

## Using the ChatOverlay Component

### In Your Own React Application

The ChatOverlay component is designed to be easily integrated into other React applications.

#### Installation

1. Copy the `src/components/ChatOverlay` directory to your project
2. Install peer dependencies:

```bash
npm install react react-dom
```

#### Basic Usage

```tsx
import React from 'react';
import { ChatOverlay } from './components/ChatOverlay';

function App() {
  return (
    <div>
      <h1>My Application</h1>
      <ChatOverlay />
    </div>
  );
}

export default App;
```

#### Customization

The ChatOverlay component accepts several props for customization:

```tsx
<ChatOverlay
  position={{ bottom: '20px', right: '20px' }}
  size={{ width: '400px', height: '600px' }}
  userMessageColor="#e3f2fd"
  agentMessageColor="#f5f5f5"
  submitIcon="➤"
  displayConfig={{
    showText: true,
    showCharts: true,
    showTables: true,
    showThinking: false,
    showToolUse: false,
    showStatus: false,
  }}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `{ bottom?: string; right?: string }` | `{ bottom: '20px', right: '20px' }` | Position of the chat bubble/overlay |
| `size` | `{ width?: string; height?: string }` | `{ width: '400px', height: '600px' }` | Size of the expanded chat overlay |
| `userMessageColor` | `string` | `'#e3f2fd'` | Background color for user messages |
| `agentMessageColor` | `string` | `'#f5f5f5'` | Background color for agent messages |
| `submitIcon` | `string` | `'➤'` | Icon/text for the submit button |
| `displayConfig` | `DisplayConfig` | See below | Controls which response types are displayed |

**DisplayConfig Type:**

```typescript
interface DisplayConfig {
  showText?: boolean;      // Default: true
  showCharts?: boolean;    // Default: true
  showTables?: boolean;    // Default: true
  showThinking?: boolean;  // Default: false
  showToolUse?: boolean;   // Default: false
  showStatus?: boolean;    // Default: false
}
```

### As an NPM Package

To use the ChatOverlay as a standalone package:

1. Build the library:

```bash
npm run build:lib
```

2. The built files will be in the `dist/` directory:
   - `dist/chat-overlay.es.js` - ES module
   - `dist/chat-overlay.umd.js` - UMD module
   - `dist/style.css` - Component styles
   - `dist/index.d.ts` - TypeScript definitions

3. In another project, import the component:

```tsx
import { ChatOverlay } from 'path/to/dist/chat-overlay.es.js';
import 'path/to/dist/style.css';
```

Or publish to npm and install:

```bash
npm publish
npm install @cortex-agent/chat-overlay
```

Then import:

```tsx
import { ChatOverlay } from '@cortex-agent/chat-overlay';
import '@cortex-agent/chat-overlay/dist/style.css';
```

## Response Event Types

The ChatOverlay component handles all Cortex Agent API streaming response types:

### Text Responses

- `response.text.delta` - Incremental text content
- `response.text` - Final complete text
- `response.text.annotation` - Citations and references

### Thinking Process

- `response.thinking.delta` - Incremental reasoning
- `response.thinking` - Final reasoning
- Displayed in a collapsible section

### Tool Usage

- `response.tool_use` - Tool being called with parameters
- `response.tool_result` - Tool execution results
- `response.tool_result.status` - Execution status
- `response.tool_result.analyst.delta` - Streaming analyst output

### Data Visualization

- `response.table` - Structured table data rendered with proper formatting
- `response.chart` - Chart/visualization data rendered using **Recharts library**
  - Supports bar charts, line charts, and pie charts
  - Handles multiple data formats (Vega-lite, direct arrays, etc.)
  - Interactive tooltips and legends
  - Responsive sizing

### Status

- `response.status` - Status messages during processing
- `response` - Final complete response
- `error` - Error events

## Customization Examples

### Change Chat Position

```tsx
<ChatOverlay
  position={{ bottom: '80px', right: '40px' }}
/>
```

### Adjust Colors

```tsx
<ChatOverlay
  userMessageColor="#bbdefb"
  agentMessageColor="#e8eaf6"
/>
```

### Larger Chat Window

```tsx
<ChatOverlay
  size={{ width: '500px', height: '700px' }}
/>
```

### Custom Submit Icon

```tsx
<ChatOverlay
  submitIcon="🚀"
/>
```

## Resizing the Chat Window

The chat overlay is **fully resizable** using mouse drag interactions:

- **Edge Resize**: Drag any edge (top, bottom, left, right) to resize in that direction
- **Corner Resize**: Drag any corner to resize both width and height simultaneously
- **Minimum Size**: 300px wide × 400px tall
- **Maximum Size**: 90% of viewport width and height
- **Visual Feedback**: Resize handles highlight on hover

### How to Use

1. Open the chat overlay by clicking the chat bubble
2. Hover near any edge or corner - you'll see the cursor change to a resize cursor
3. Click and drag to resize the window to your preferred size
4. The size persists during your session

The resize feature is built into the `ChatOverlayWithStreaming` component and requires no additional configuration.

## Chart Rendering

The application includes full chart rendering capabilities using [Recharts](https://recharts.org/):

### Supported Chart Types

- **Bar Charts**: Display categorical data with rectangular bars
- **Line Charts**: Show trends over time or continuous data
- **Pie Charts**: Visualize proportional data

### Data Format Support

The chart renderer automatically handles multiple data formats:

1. **Vega-lite format**:
```json
{
  "type": "bar",
  "values": [{"x": "A", "y": 10}, {"x": "B", "y": 20}],
  "encoding": {
    "x": {"field": "x"},
    "y": {"field": "y"}
  }
}
```

2. **Direct array format**:
```json
[
  {"name": "Jan", "sales": 100},
  {"name": "Feb", "sales": 150}
]
```

3. **Nested data format**:
```json
{
  "title": "Sales Chart",
  "data": [{"month": "Jan", "value": 100}]
}
```

The chart renderer intelligently detects the format and renders accordingly. If the data cannot be parsed, it displays the raw JSON with instructions.

### Text Overflow Handling

Charts are configured to prevent text overlap and ensure labels stay within bounds:

- **Generous Margins**: 
  - Left: 80px (accommodates Y-axis labels + title)
  - Bottom: 90px (accommodates rotated X-axis labels)
  - Right: 30px, Top: 20px
- **Axis Width/Height**: 
  - Y-axis: 60-80px width (depending on whether title is present)
  - X-axis: 80px height for rotated labels
- **Label Truncation**: Long axis labels are automatically truncated to 20 characters with ellipsis (...)
- **Rotated Labels**: X-axis labels are rotated -45° for better readability with long category names
- **Custom Tick Components**: Smart label rendering with consistent spacing and positioning
- **Title Positioning**: Y-axis titles positioned 'left' with 15px offset to avoid overlap with tick labels
- **Increased Height**: Charts use 400px height (vs standard 300px) for better label visibility
- **Legend Spacing**: Legends have 10px top padding to prevent overlap with the chart area
- **Pie Chart Labels**: Pie slices show truncated labels (12 chars) to fit within the chart

These optimizations ensure that charts remain readable even with long category names or many data points, with no text overlap or clipping, while fitting cleanly within the chat window.

## Markdown Text Rendering

Agent text responses are automatically rendered as **Markdown** using [react-markdown](https://github.com/remarkjs/react-markdown) with GitHub Flavored Markdown (GFM) support.

### Supported Markdown Features

- **Headers** (H1-H6)
- **Bold** (`**text**`) and *Italic* (`*text*`)
- **Links** (`[text](url)`)
- **Lists** (ordered and unordered)
- **Code blocks** with syntax highlighting
- **Inline code** (`` `code` ``)
- **Tables** (with horizontal scroll if needed)
- **Blockquotes**
- **Horizontal rules**

### Example

When the agent returns:
```markdown
**Summary**: The total is $1,234.

Here's the breakdown:
- Item A: $500
- Item B: $734

See `query.sql` for details.
```

It renders as formatted text with **bold summary**, bulleted list, and highlighted inline code.

## Responsive Design & Overflow Handling

All response components are designed to fit within the chat window:

- **Horizontal Scrolling**: Tables, charts, code blocks, and wide content have individual horizontal scrollbars
- **Max Width**: All components constrained to 100% of container width
- **Overflow Auto**: Each component manages its own overflow independently
- **Preserved Layout**: Long content scrolls within its component without breaking the chat layout

This ensures that:
- Wide tables don't break the chat layout
- Long code snippets are contained with scrollbars
- Charts remain readable at any window size
- The chat remains usable on smaller screens

## Response Display Configuration

### Component-Based Configuration (Portable)

The ChatOverlay component accepts a `displayConfig` prop to control which response types are displayed. This approach is **portable** and works in any React application:

```tsx
import { ChatOverlay } from './components/ChatOverlay';

function App() {
  return (
    <ChatOverlay
      displayConfig={{
        showText: true,
        showCharts: true,
        showTables: true,
        showThinking: true,  // Enable for debugging
        showToolUse: true,   // Enable for debugging
        showStatus: true,    // Enable for debugging
      }}
    />
  );
}
```

### Environment Variables (This Application Only)

For convenience in **this specific application**, environment variables can be used to configure display settings. The `App.tsx` file reads these variables and converts them to props:

Set these in your `.env` file:

```env
VITE_SHOW_TEXT=true        # Text responses (default: true)
VITE_SHOW_CHARTS=true      # Chart visualizations (default: true)
VITE_SHOW_TABLES=true      # Table data (default: true)
VITE_SHOW_THINKING=false   # Agent thinking processes (default: false)
VITE_SHOW_TOOL_USE=false   # Tool use operations (default: false)
VITE_SHOW_STATUS=false     # Status messages (default: false)
```

### Default Behavior

By default, the chat displays only the **final results** that users typically care about:
- ✅ **Text responses** - The agent's natural language answers
- ✅ **Charts** - Visual data representations
- ✅ **Tables** - Structured data displays

The following are **hidden by default** to reduce UI clutter:
- ❌ **Thinking** - Internal reasoning process (useful for debugging)
- ❌ **Tool Use** - Tool invocations and raw results (useful for development)
- ❌ **Status** - Progress indicators (useful for long-running operations)

### Use Cases

**End User Production Mode** (default):
```env
VITE_SHOW_TEXT=true
VITE_SHOW_CHARTS=true
VITE_SHOW_TABLES=true
VITE_SHOW_THINKING=false
VITE_SHOW_TOOL_USE=false
VITE_SHOW_STATUS=false
```

**Developer/Debug Mode** (show everything):
```env
VITE_SHOW_TEXT=true
VITE_SHOW_CHARTS=true
VITE_SHOW_TABLES=true
VITE_SHOW_THINKING=true
VITE_SHOW_TOOL_USE=true
VITE_SHOW_STATUS=true
```

**Minimal Mode** (text only):
```env
VITE_SHOW_TEXT=true
VITE_SHOW_CHARTS=false
VITE_SHOW_TABLES=false
VITE_SHOW_THINKING=false
VITE_SHOW_TOOL_USE=false
VITE_SHOW_STATUS=false
```

**Note:** After changing `.env` values, restart the development server (`npm run dev`) for changes to take effect.

#### How It Works

The environment variables are converted to component props in `App.tsx`:

```tsx
import { DisplayConfig } from './components/ChatOverlay/types';

const displayConfig: DisplayConfig = {
  showText: import.meta.env.VITE_SHOW_TEXT !== 'false',
  showCharts: import.meta.env.VITE_SHOW_CHARTS !== 'false',
  showTables: import.meta.env.VITE_SHOW_TABLES !== 'false',
  showThinking: import.meta.env.VITE_SHOW_THINKING === 'true',
  showToolUse: import.meta.env.VITE_SHOW_TOOL_USE === 'true',
  showStatus: import.meta.env.VITE_SHOW_STATUS === 'true',
};

<ChatOverlayWithStreaming displayConfig={displayConfig} />
```

This pattern keeps the **component portable** (it uses props) while allowing **this application** to use environment variables for convenience. Other applications can use the component with direct props without any environment variable dependencies.

## API Integration

The frontend communicates with the backend via the API service (`src/services/api.ts`). The main functions are:

- `login(username, password)` - Authenticate user
- `logout()` - End user session
- `getCurrentUser()` - Get current user info
- `streamAgentResponse(request)` - Stream agent responses

The backend API endpoint is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

## Development

### Adding New Event Handlers

To add support for a new event type:

1. Create a new handler in `src/components/ChatOverlay/handlers/`
2. Import and use it in `ResponseRenderer.tsx`
3. Add appropriate styling

Example:

```tsx
// NewEventHandler.tsx
import React from 'react';
import { ResponseEvent } from '../types';

export const NewEventHandler: React.FC<{ events: ResponseEvent[] }> = ({ events }) => {
  // Process and render events
  return <div>...</div>;
};
```

### Styling

Each component has its own CSS file. Global styles are in `src/index.css`.

To modify the chat overlay appearance, edit:
- `ChatOverlay.css` - Main overlay and bubble
- `ChatMessage.css` - Message bubbles
- `ChatInput.css` - Input area
- Handler-specific CSS files

## Troubleshooting

### "Not authenticated" errors

- Ensure you're logged in
- Check that cookies are being sent with requests
- Verify the backend is running and accessible

### Streaming not working

- Check browser console for errors
- Verify the `/api/agent/run` endpoint is accessible
- Ensure the backend has correct Cortex API credentials

### Styling issues

- Check that all CSS files are imported
- Verify CSS module resolution in vite.config
- Clear browser cache

## License

MIT

