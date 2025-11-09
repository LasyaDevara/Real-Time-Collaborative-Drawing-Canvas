import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents, UserInfo, ChatMessageData, CursorData } from '@shared/socket-events';
import type { DrawAction } from '@/components/DrawingCanvas';
import type { ChatMessage } from '@/components/ChatPanel';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket(roomId: string, username: string) {
  const socketRef = useRef<SocketType | null>(null);
  const socketIdRef = useRef<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Map<string, CursorData>>(new Map());
  const [remoteActions, setRemoteActions] = useState<DrawAction[]>([]);
  const [roomInfo, setRoomInfo] = useState({ maxUsers: 5, currentUsers: 0 });

  useEffect(() => {
    const socket: SocketType = io({
      path: '/socket.io',
      // Optimize for low latency
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
      upgrade: true,
      rememberUpgrade: true,
      // Reduce reconnection delays for faster recovery
      reconnection: true,
      reconnectionDelay: 100,
      reconnectionDelayMax: 500,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      socketIdRef.current = socket.id;
      socket.emit('join-room', { roomId, username });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('users-list', (usersList) => {
      setUsers(usersList);
      const self = usersList.find(u => u.id === socket.id);
      if (self) {
        setCurrentUser(self);
      }
    });

    socket.on('user-joined', ({ userId, username, color }) => {
      console.log(`User joined: ${username}`);
    });

    socket.on('user-left', ({ userId }) => {
      console.log(`User left: ${userId}`);
      setRemoteCursors(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on('draw-action', ({ userId, action }) => {
      // CRITICAL: Only add actions from OTHER users to remoteActions
      // The current user's own actions are handled via localActions for immediate feedback
      // The server now broadcasts to OTHER users only (not the sender)
      // This prevents duplicates and ensures proper synchronization
      if (userId !== socket.id && userId !== socketIdRef.current) {
        console.log('Received draw-action from', userId, 'with', action.points?.length || 0, 'points');
        setRemoteActions(prev => {
          console.log('Adding remote action to remoteActions, previous count:', prev.length);
          return [...prev, action];
        });
      } else {
        console.log('Ignoring own action from server (already in localActions)');
      }
    });

    socket.on('cursor-move', ({ userId, x, y, username, color }) => {
      setRemoteCursors(prev => {
        const next = new Map(prev);
        next.set(userId, {
          id: userId,
          x,
          y,
          color,
          username
        });
        return next;
      });
    });

    socket.on('chat-message', (messageData) => {
      const chatMessage: ChatMessage = {
        ...messageData,
        timestamp: new Date(messageData.timestamp)
      };
      setMessages(prev => [...prev, chatMessage]);
    });

    socket.on('canvas-clear', () => {
      setRemoteActions([]);
    });

    socket.on('canvas-state', ({ actions }) => {
      // When receiving canvas state, merge with existing remote actions
      // This happens when joining a room with existing content or when syncing
      // CRITICAL: Merge instead of replace to preserve any actions that might not be in server state yet
      console.log('Received canvas-state with', actions.length, 'actions');
      setRemoteActions(prev => {
        // Merge server actions with existing remote actions
        // Use a Set to track unique actions and avoid duplicates
        const actionMap = new Map<string, DrawAction>();
        
        // First add existing remote actions
        prev.forEach(action => {
          const key = JSON.stringify(action);
          actionMap.set(key, action);
        });
        
        // Then add server actions (these are the source of truth)
        actions.forEach(action => {
          const key = JSON.stringify(action);
          actionMap.set(key, action);
        });
        
        const merged = Array.from(actionMap.values());
        console.log('Merged canvas state:', {
          previous: prev.length,
          server: actions.length,
          merged: merged.length
        });
        return merged;
      });
    });

    socket.on('room-full', ({ message }) => {
      console.error('Room is full:', message);
      alert(message);
    });

    socket.on('room-info', ({ maxUsers, currentUsers }) => {
      console.log('Room info:', { maxUsers, currentUsers });
      setRoomInfo({ maxUsers, currentUsers });
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
    };
  }, [roomId, username]);

  const sendDrawAction = (action: DrawAction) => {
    socketRef.current?.emit('draw-action', { roomId, action });
  };

  const sendCursorMove = (x: number, y: number) => {
    socketRef.current?.emit('cursor-move', { roomId, x, y });
  };

  const sendMessage = (message: string) => {
    socketRef.current?.emit('send-message', { roomId, message });
  };

  const clearCanvas = () => {
    socketRef.current?.emit('clear-canvas', { roomId });
    setRemoteActions([]);
  };

  const syncCanvas = () => {
    // Request current canvas state from server
    // This syncs the canvas without losing local drawings
    console.log('Requesting canvas state sync for room', roomId);
    socketRef.current?.emit('request-canvas-state', { roomId });
  };

  return {
    isConnected,
    currentUser,
    users,
    messages,
    remoteCursors: Array.from(remoteCursors.values()),
    remoteActions,
    roomInfo,
    sendDrawAction,
    sendCursorMove,
    sendMessage,
    clearCanvas,
    syncCanvas,
  };
}
