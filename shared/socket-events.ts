import type { DrawAction } from '../client/src/components/DrawingCanvas';

export interface ServerToClientEvents {
  'user-joined': (data: { userId: string; username: string; color: string }) => void;
  'user-left': (data: { userId: string }) => void;
  'users-list': (users: UserInfo[]) => void;
  'draw-action': (data: { userId: string; action: DrawAction }) => void;
  'cursor-move': (data: { userId: string; x: number; y: number; username: string; color: string }) => void;
  'chat-message': (data: ChatMessageData) => void;
  'canvas-clear': () => void;
  'canvas-state': (data: { actions: DrawAction[] }) => void;
  'room-full': (data: { message: string }) => void;
  'room-info': (data: { maxUsers: number; currentUsers: number }) => void;
}

export interface ClientToServerEvents {
  'join-room': (data: { roomId: string; username: string }) => void;
  'leave-room': (data: { roomId: string }) => void;
  'draw-action': (data: { roomId: string; action: DrawAction }) => void;
  'cursor-move': (data: { roomId: string; x: number; y: number }) => void;
  'send-message': (data: { roomId: string; message: string }) => void;
  'clear-canvas': (data: { roomId: string }) => void;
  'request-canvas-state': (data: { roomId: string }) => void;
}

export interface UserInfo {
  id: string;
  username: string;
  color: string;
  isOnline: boolean;
}

export interface ChatMessageData {
  id: string;
  userId: string;
  username: string;
  userColor: string;
  message: string;
  timestamp: string;
}

export interface CursorData {
  id: string;
  x: number;
  y: number;
  color: string;
  username: string;
}
