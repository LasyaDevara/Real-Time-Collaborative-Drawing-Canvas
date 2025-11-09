import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents, UserInfo } from "@shared/socket-events";
import type { DrawAction } from "../client/src/components/DrawingCanvas";

interface RoomData {
  users: Map<string, UserInfo>;
  canvasActions: DrawAction[];
}

const USER_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
];

const MAX_USERS_PER_ROOM = 5;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map<string, RoomData>();

  function getOrCreateRoom(roomId: string): RoomData {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: new Map(), canvasActions: [] });
    }
    return rooms.get(roomId)!;
  }

  function assignUserColor(roomId: string): string {
    const room = getOrCreateRoom(roomId);
    const usedColors = Array.from(room.users.values()).map(u => u.color);
    const availableColors = USER_COLORS.filter(c => !usedColors.includes(c));
    return availableColors.length > 0 
      ? availableColors[0] 
      : USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
  }

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    let currentRoom: string | null = null;
    let currentUser: UserInfo | null = null;

    socket.on('join-room', ({ roomId, username }) => {
      console.log(`User ${socket.id} joining room ${roomId} as ${username}`);
      
      const room = getOrCreateRoom(roomId);
      
      // Check if room is full
      if (room.users.size >= MAX_USERS_PER_ROOM) {
        socket.emit('room-full', { message: `Room is full. Maximum ${MAX_USERS_PER_ROOM} users allowed.` });
        console.log(`User ${socket.id} rejected: room ${roomId} is full (${room.users.size}/${MAX_USERS_PER_ROOM})`);
        return;
      }
      
      const userColor = assignUserColor(roomId);
      
      currentRoom = roomId;
      currentUser = {
        id: socket.id,
        username,
        color: userColor,
        isOnline: true
      };

      room.users.set(socket.id, currentUser);
      socket.join(roomId);

      // Send existing canvas state to the newly joined user
      socket.emit('canvas-state', { actions: room.canvasActions });

      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        username,
        color: userColor
      });

      const usersList = Array.from(room.users.values());
      io.to(roomId).emit('users-list', usersList);
      // Send room info to all users in the room
      io.to(roomId).emit('room-info', { maxUsers: MAX_USERS_PER_ROOM, currentUsers: room.users.size });
    });

    socket.on('draw-action', ({ roomId, action }) => {
      const room = rooms.get(roomId);
      if (room) {
        // Store the action in room history
        room.canvasActions.push(action);
      }
      
      // CRITICAL: Broadcast to OTHER users only (NOT the sender)
      // The sender already sees their drawing via localActions on the client
      // This prevents the sender from receiving their own action back
      // The sender's drawing is rendered immediately locally, then synced to others
      socket.to(roomId).volatile.emit('draw-action', {
        userId: socket.id,
        action
      });
    });

    socket.on('cursor-move', ({ roomId, x, y }) => {
      if (!currentUser) return;
      
      // Use volatile emit for instant cursor updates (low priority, can be dropped if needed)
      socket.to(roomId).volatile.emit('cursor-move', {
        userId: socket.id,
        x,
        y,
        username: currentUser.username,
        color: currentUser.color
      });
    });

    socket.on('send-message', ({ roomId, message }) => {
      if (!currentUser) return;

      const messageData = {
        id: `${socket.id}-${Date.now()}`,
        userId: socket.id,
        username: currentUser.username,
        userColor: currentUser.color,
        message,
        timestamp: new Date().toISOString()
      };

      io.to(roomId).emit('chat-message', messageData);
    });

    socket.on('clear-canvas', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room) {
        // Clear canvas history
        room.canvasActions = [];
      }
      io.to(roomId).emit('canvas-clear');
    });

    socket.on('request-canvas-state', ({ roomId }) => {
      // Send current canvas state to the requesting user
      // This allows users to sync/reload the canvas without losing their local drawings
      const room = rooms.get(roomId);
      if (room) {
        console.log(`Sending canvas state to ${socket.id} for room ${roomId} with ${room.canvasActions.length} actions`);
        socket.emit('canvas-state', { actions: room.canvasActions });
      }
    });

    socket.on('leave-room', ({ roomId }) => {
      handleUserLeave(roomId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (currentRoom) {
        handleUserLeave(currentRoom);
      }
    });

    function handleUserLeave(roomId: string) {
      const room = rooms.get(roomId);
      if (!room) return;

      room.users.delete(socket.id);
      socket.leave(roomId);

      socket.to(roomId).emit('user-left', { userId: socket.id });

      const usersList = Array.from(room.users.values());
      io.to(roomId).emit('users-list', usersList);
      // Send updated room info to all users
      io.to(roomId).emit('room-info', { maxUsers: MAX_USERS_PER_ROOM, currentUsers: room.users.size });

      if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }
  });

  return httpServer;
}
