import type { Server, Socket } from "socket.io";

export interface Message {
  id: string;
  text: string;
  from: string;
  socketId: string;
  sentAt: string;
}

export interface RoomUser {
  socketId: string;
  name: string;
}

export interface ClientToServerEvents {
  "join-room": (data: { roomId: string; name: string }) => void;
  "send-message": (data: { roomId: string; text: string }) => void;
  typing: (data: { roomId: string; isTyping: boolean }) => void;
}

export interface ServerToClientEvents {
  "new-message": (msg: Message) => void;
  "room-users": (users: RoomUser[]) => void;
  "user-joined": (user: RoomUser) => void;
  "user-left": (user: RoomUser) => void;
  "typing-update": (data: { name: string; isTyping: boolean }) => void;
}

export interface SocketData {
  name: string;
  roomId: string;
}

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
