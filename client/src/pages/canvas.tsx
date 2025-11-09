import { useState, useEffect, useRef, useMemo } from 'react';
import DrawingCanvas, { type DrawAction, type DrawingTool } from '@/components/DrawingCanvas';
import Toolbar from '@/components/Toolbar';
import ColorPicker from '@/components/ColorPicker';
import BrushSizeSlider from '@/components/BrushSizeSlider';
import UserList from '@/components/UserList';
import ChatPanel from '@/components/ChatPanel';
import InviteLinkModal from '@/components/InviteLinkModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import { useSocket } from '@/hooks/useSocket';

function generateRoomId() {
  return Math.random().toString(36).substring(2, 15);
}

function generateUsername() {
  const adjectives = ['Happy', 'Creative', 'Artistic', 'Bright', 'Cool'];
  const nouns = ['Painter', 'Artist', 'Designer', 'Creator', 'Drawer'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawingTool>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [localActions, setLocalActions] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const cursorThrottleRef = useRef<NodeJS.Timeout>();

  const roomId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const existingRoom = params.get('room');
    if (existingRoom) return existingRoom;
    
    const newRoomId = generateRoomId();
    window.history.replaceState({}, '', `?room=${newRoomId}`);
    return newRoomId;
  }, []);

  const username = useMemo(() => generateUsername(), []);
  const inviteLink = `${window.location.origin}/?room=${roomId}`;

  const {
    isConnected,
    currentUser,
    users,
    messages,
    remoteCursors,
    remoteActions,
    roomInfo,
    sendDrawAction,
    sendCursorMove,
    sendMessage,
    clearCanvas: clearRemoteCanvas,
    syncCanvas,
  } = useSocket(roomId, username);

  const allActions = useMemo(() => {
    // FIXED SYNCHRONIZATION APPROACH:
    // localActions = current user's own drawings (rendered immediately)
    // remoteActions = other users' drawings (received from server)
    // Server uses socket.broadcast (excludes sender), so sender doesn't receive their own actions
    // This ensures:
    // 1. User sees their own drawing immediately via localActions
    // 2. Other users see the drawing via remoteActions
    // 3. No duplicates because sender doesn't receive their own action back
    
    // Strategy: Combine localActions + remoteActions
    // localActions are the user's own drawings (always visible immediately)
    // remoteActions are other users' drawings (synced from server)
    const combined: DrawAction[] = [];
    const seenActionKeys = new Set<string>();
    
    // First, add all localActions (user's own drawings - immediate feedback)
    // CRITICAL: These are always included to ensure the creator sees their own drawings
    localActions.forEach(action => {
      const key = JSON.stringify(action);
      if (!seenActionKeys.has(key)) {
        seenActionKeys.add(key);
        combined.push(action);
      }
    });
    
    // Then, add all remoteActions (other users' drawings - synced from server)
    remoteActions.forEach(action => {
      const key = JSON.stringify(action);
      if (!seenActionKeys.has(key)) {
        seenActionKeys.add(key);
        combined.push(action);
      }
    });
    
    console.log('Combined actions:', {
      local: localActions.length,
      remote: remoteActions.length,
      total: combined.length,
      users: users.length,
      maxUsers: roomInfo.maxUsers,
      localActions: localActions.map(a => ({ tool: a.tool, points: a.points?.length || 0, fillPoint: a.fillPoint ? 'yes' : 'no' })),
      remoteActions: remoteActions.map(a => ({ tool: a.tool, points: a.points?.length || 0, fillPoint: a.fillPoint ? 'yes' : 'no' }))
    });
    
    // CRITICAL: Ensure drawings are always visible
    // If we have actions but combined is empty, something is wrong
    if ((localActions.length > 0 || remoteActions.length > 0) && combined.length === 0) {
      console.error('ERROR: Actions exist but combined is empty!', {
        local: localActions.length,
        remote: remoteActions.length
      });
      // Fallback: return localActions + remoteActions directly
      return [...localActions, ...remoteActions];
    }
    
    // Return combined actions
    return combined;
  }, [localActions, remoteActions, users.length, roomInfo.maxUsers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      } else if (e.key === 'b' || e.key === 'B') {
        setTool('brush');
      } else if (e.key === 'e' || e.key === 'E') {
        setTool('eraser');
      } else if (e.key === 'f' || e.key === 'F') {
        setTool('fill');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localActions, redoStack]);

  const handleDrawAction = (action: DrawAction) => {
    // Add to localActions immediately for instant visual feedback
    // This ensures the user sees their drawing immediately, even before server confirmation
    console.log('Adding action to localActions:', action);
    setLocalActions((prev) => {
      const updated = [...prev, action];
      console.log('localActions updated, count:', updated.length);
      return updated;
    });
    setRedoStack([]);
    // Send to server for synchronization with other users
    // Server will broadcast back to all users including sender
    sendDrawAction(action);
  };

  const handleCursorMove = (x: number, y: number) => {
    setCursorPosition({ x, y });
    
    if (cursorThrottleRef.current) {
      clearTimeout(cursorThrottleRef.current);
    }
    
    // Reduced throttle to 16ms (~60fps) for instant cursor updates
    cursorThrottleRef.current = setTimeout(() => {
      sendCursorMove(x, y);
    }, 16);
  };

  const handleUndo = () => {
    if (localActions.length === 0) return;
    const lastAction = localActions[localActions.length - 1];
    setLocalActions((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastAction]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const actionToRedo = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setLocalActions((prev) => [...prev, actionToRedo]);
    sendDrawAction(actionToRedo);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This will clear it for everyone.')) {
      setLocalActions([]);
      setRedoStack([]);
      clearRemoteCanvas();
    }
  };

  useEffect(() => {
    // When canvas is cleared remotely, clear local state
    // BUT: Don't clear if it's a single user scenario - they need their localActions
    // Only clear if remoteActions is explicitly cleared (canvas-clear event)
    // This is handled by the clearCanvas function which sets remoteActions to []
    // So we only clear localActions if remoteActions is empty AND we're not the only user
    if (remoteActions.length === 0 && localActions.length > 0 && users.length > 1) {
      // Only clear if multiple users (remote clear from another user)
      setLocalActions([]);
      setRedoStack([]);
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [remoteActions.length, localActions.length, users.length]);

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `collab-canvas-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSync = () => {
    // Sync canvas state from server without losing local drawings
    // This merges server state with local state
    console.log('Syncing canvas state...');
    syncCanvas();
  };

  // Auto-sync canvas when page regains focus
  // This ensures users see the latest state when they return to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isConnected) {
        // Page became visible - sync canvas state
        console.log('Page became visible, syncing canvas...');
        syncCanvas();
      }
    };

    const handleFocus = () => {
      if (isConnected) {
        // Window regained focus - sync canvas state
        console.log('Window regained focus, syncing canvas...');
        syncCanvas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isConnected, syncCanvas]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <DrawingCanvas
        tool={tool}
        color={color}
        brushSize={brushSize}
        onDrawAction={handleDrawAction}
        onCursorMove={handleCursorMove}
        remoteActions={allActions}
        remoteCursors={remoteCursors}
      />

      <Toolbar
        tool={tool}
        onToolChange={setTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onExport={handleExport}
        onInvite={() => setShowInviteModal(true)}
        onSync={handleSync}
        canUndo={localActions.length > 0}
        canRedo={redoStack.length > 0}
      />

      <ColorPicker color={color} onChange={setColor} />

      <BrushSizeSlider size={brushSize} onChange={setBrushSize} />

      <UserList
        users={users}
        maxUsers={roomInfo.maxUsers}
        isOpen={showUserList}
        onClose={() => setShowUserList(false)}
      />

      <ChatPanel
        messages={messages}
        currentUserId={currentUser?.id || ''}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onSendMessage={handleSendMessage}
      />

      <InviteLinkModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteLink={inviteLink}
        maxUsers={roomInfo.maxUsers}
        currentUsers={roomInfo.currentUsers}
      />

      <FloatingActionButton
        onChatToggle={() => setShowChat(!showChat)}
        onUserListToggle={() => setShowUserList(!showUserList)}
        unreadMessages={0}
      />

      <div
        className="absolute bottom-4 right-4 px-4 py-2 rounded-lg backdrop-blur-xl text-sm font-medium pointer-events-none"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
        }}
        data-testid="status-bar"
      >
        Room: {roomId} • {users.filter((u) => u.isOnline).length} users online
      </div>
    </div>
  );
}
