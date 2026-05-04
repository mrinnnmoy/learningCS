import type { Server, Socket } from "socket.io";

export interface RoomUser {
  socketId: string;
  name: string;
}

export interface ClientToServerEvents {
  "join-room": (data: { roomId: string; name: string }) => void;
  offer: (data: { to: string; sdp: RTCSessionDescriptionInit }) => void;
  answer: (data: { to: string; sdp: RTCSessionDescriptionInit }) => void;
  "ice-candidate": (data: {
    to: string;
    candidate: RTCIceCandidateInit;
  }) => void;
}

export interface ServerToClientEvents {
  "room-peers": (peers: RoomUser[]) => void;
  "user-joined": (user: RoomUser) => void;
  "user-left": (user: RoomUser) => void;
  offer: (data: {
    from: string;
    name: string;
    sdp: RTCSessionDescriptionInit;
  }) => void;
  answer: (data: { from: string; sdp: RTCSessionDescriptionInit }) => void;
  "ice-candidate": (data: {
    from: string;
    candidate: RTCIceCandidateInit;
  }) => void;
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
