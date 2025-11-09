# CollabCanvas

A real-time collaborative drawing application that allows multiple users to draw together on a shared canvas. Built with React, TypeScript, Socket.IO, and Express.

## Features

- 🎨 **Real-time Collaborative Drawing** - Draw together with friends in real-time
- 👥 **Multi-user Support** - Up to 5 users per room
- 🖌️ **Drawing Tools** - Brush, eraser, and fill tools with customizable colors and brush sizes
- 💬 **Chat** - Built-in chat for communication while drawing
- 👤 **User Management** - See who's online and their activity
- 🔗 **Easy Sharing** - Share room links to invite friends
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎯 **Auto-resize** - Canvas automatically adjusts when the browser window is resized
- 💾 **Persistent Drawings** - All drawings are saved and synchronized across all users
- 🔄 **Canvas Sync** - Manual and automatic canvas synchronization without losing local drawings
- 🔄 **Auto-sync on Focus** - Canvas automatically syncs when you return to the tab/window
- ⌨️ **Keyboard Shortcuts** - Quick access to tools and actions

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, Socket.IO
- **Styling**: Tailwind CSS, Radix UI
- **Real-time**: Socket.IO for WebSocket communication
- **State Management**: React Hooks, React Query

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CollabCanvas
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Prerequisites

Before running, ensure you have:
- Node.js (v18 or higher) installed
- Port 5000 available (or kill any process using it)

### Step 1: Install Dependencies

If you haven't already, install all dependencies:
```bash
npm install
```

### Step 2: Start the Development Server

Start both the frontend and backend servers:
```bash
npm run dev
```

This command will:
- Start the Express server on port 5000
- Start the Vite development server for the React frontend
- Enable hot module replacement (HMR) for fast development

The application will be available at `http://localhost:5000`

### Step 3: Open in Browser

Open your browser and navigate to:
```
http://localhost:5000
```

A room ID will be automatically generated and added to the URL (e.g., `http://localhost:5000?room=abc123`)

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Troubleshooting Port 5000

If port 5000 is already in use:

**Windows:**
```bash
# Find the process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with the actual process ID)
taskkill /F /PID <PID>
```

**Mac/Linux:**
```bash
# Find and kill the process using port 5000
lsof -ti:5000 | xargs kill
```

Alternatively, you can change the port in `server/index.ts`

## Usage

1. **Create a Room**: Open the application in your browser. A room ID is automatically generated and added to the URL.

2. **Invite Friends**: Click the invite button (link icon) to copy the room link and share it with friends.

3. **Start Drawing**: 
   - Use the brush tool to draw
   - Select colors from the color picker
   - Adjust brush size with the slider
   - Use the eraser to remove parts of your drawing
   - Use the fill tool to fill areas with color

4. **Sync Canvas**: 
   - Click the sync button (refresh icon) in the toolbar to manually sync the canvas state from the server
   - The canvas automatically syncs when you return to the tab/window
   - Your local drawings are preserved during sync

5. **Chat**: Click the chat button to open the chat panel and communicate with other users.

6. **View Users**: Click the users button to see who's currently in the room.

### Important Note for Session Creators

**Known Issue**: If you are the session creator (first user) and there are multiple other users in the room, you may need to **reload the page (Ctrl+R or F5)** to see your first drawing or coloring action. This is a known synchronization issue that occurs when:
- You are the first user to join the room
- Other users have joined after you
- You make your first drawing or coloring action

**Workaround**: 
- After making your first drawing, press `Ctrl+R` (or `F5`) to reload the page
- Your drawing will appear after the reload
- Subsequent drawings will appear immediately without needing to reload
- Alternatively, use the **Sync button** (refresh icon) in the toolbar to sync the canvas state

**Note**: This issue only affects the first drawing/coloring action. All subsequent actions will appear immediately for all users, including the session creator.

## Keyboard Shortcuts

- `B` - Switch to brush tool
- `E` - Switch to eraser tool
- `F` - Switch to fill tool
- `Ctrl/Cmd + Z` - Undo last action
- `Ctrl/Cmd + Y` - Redo last action
- `Ctrl/Cmd + R` or `F5` - Reload page (useful for session creators to see first drawing)

## Project Structure

```
CollabCanvas/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # Socket.IO routes and room management
│   └── vite.ts            # Vite middleware
├── shared/                 # Shared types and schemas
│   └── socket-events.ts   # Socket.IO event types
└── package.json           # Dependencies and scripts
```

## Key Features Explained

### Real-time Synchronization
- All drawing actions are synchronized in real-time using Socket.IO
- The server broadcasts actions to other users (not back to the sender)
- Each user's own drawings are rendered immediately via `localActions`
- Other users' drawings are received via `remoteActions` from the server
- Drawings persist even when users join or leave
- Canvas state is automatically synced when joining a room

### Canvas Synchronization (Sync Feature)
- **Manual Sync**: Click the sync button (refresh icon) in the toolbar to request the latest canvas state from the server
- **Auto-sync**: Canvas automatically syncs when you return to the tab/window (on visibility change or focus)
- **Smart Merging**: Server actions are merged with existing remote actions to prevent duplicates
- **No Data Loss**: Your local drawings are preserved during sync (they're in `localActions`)

### User Limit
- Maximum 5 users per room
- Room capacity is displayed in the UI (e.g., "2/5 users online")
- Users are notified if a room is full and cannot join

### Canvas Resizing
- Canvas automatically adjusts when the browser window is resized
- Uses ResizeObserver for optimal performance
- All drawings are redrawn correctly after resize
- Debounced resize events prevent excessive redraws

### Drawing State Management
- **localActions**: Your own drawings (rendered immediately for instant feedback)
- **remoteActions**: Other users' drawings (synced from server)
- **allActions**: Combined state of localActions + remoteActions (what gets rendered)
- Actions are deduplicated using JSON stringified keys

## Development

### Type Checking
```bash
npm run check
```

### Database (if using)
```bash
npm run db:push
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Port 5000 Already in Use
If port 5000 is already in use, you can:
1. Kill the process using port 5000:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /F /PID <PID>`
   - Mac/Linux: `lsof -ti:5000 | xargs kill`

2. Or change the port in `server/index.ts`

### Drawings Not Showing
- Make sure you're connected to the server (check the connection status)
- **For session creators with multiple users**: Reload the page (Ctrl+R) to see your first drawing
- Use the sync button (refresh icon) to manually sync the canvas state
- Check the browser console (F12) for any errors or debug logs
- Ensure your browser supports WebSockets (modern browsers do)

### First Drawing Not Visible (Session Creator)
If you're the session creator and your first drawing doesn't appear:
1. Press `Ctrl+R` (or `F5`) to reload the page
2. Your drawing will appear after reload
3. Subsequent drawings will appear immediately
4. Alternatively, click the sync button (refresh icon) in the toolbar

## Future Enhancements

- [ ] Save/load drawings
- [ ] Export drawings in different formats
- [ ] More drawing tools (shapes, text, etc.)
- [ ] Drawing history/version control
- [ ] User authentication
- [ ] Private rooms with passwords

## Support

For issues or questions, please open an issue on GitHub.

