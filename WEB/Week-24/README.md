# List of things learned.

## 1. WebSockets (The Protocol).

HTTP is a request-response protocol, the client sends a message, the server replies, the connection closes.

This works for most web applications but breaks down when the server needs to push data to the client without the client asking first.

**Polling** (asking the server every N seconds "any news?") is wasteful and slow. **WebSockets** solve this.

```
HTTP (Request-Response)
  Client ──── GET /messages ──▶ Server
  Client ◀─── 200 [data] ────── Server
  (connection closed)

  Client ──── GET /messages ──▶ Server    ← polls again 1 second later
  Client ◀─── 200 [no new data] ─ Server
  (connection closed again)

WebSocket (Persistent Bidirectional)
  Client ──── HTTP Upgrade ───▶ Server     ← one-time handshake
  Client ◀─── 101 Switching ──── Server   ← server agrees to upgrade

  Client ◀──────── message ────── Server  ← server pushes anytime
  Client ─────────── message ──▶ Server   ← client sends anytime
  Client ◀──────── message ────── Server
                    ↑ same connection stays open until explicitly closed
```

### When to Use WebSockets.

```
✅ Real-time chat apps
✅ Live notifications
✅ Collaborative editing (Google Docs-style)
✅ Live dashboards (stock prices, sports scores)
✅ Multiplayer games
✅ Live order / delivery tracking

❌ Standard CRUD operations (REST is fine)
❌ Occasional data fetching (polling or SSE is simpler)
❌ File uploads
```

### The WebSocket Handshake.

```
1. Client sends an HTTP GET with special headers:
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: <random base64 key>

2. Server responds with 101 Switching Protocols
   Sec-WebSocket-Accept: <derived from the key>

3. The TCP connection is now upgraded — both sides can
   send and receive messages at any time until one side calls close().
```

### Native WebSocket API (Browser).

```typescript
// No library needed in the browser
const ws = new WebSocket("ws://localhost:3001");

ws.addEventListener("open", () => {
  console.log("Connected");
  ws.send(JSON.stringify({ type: "hello", payload: "world" }));
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data as string);
  console.log("Received:", data);
});

ws.addEventListener("close", (event) => {
  console.log(`Closed: code=${event.code}, reason=${event.reason}`);
});

ws.addEventListener("error", (error) => {
  console.error("WebSocket error:", error);
});

// Close from the client side
ws.close(1000, "Intentional close");
```

### Close Codes.

```
1000  Normal closure
1001  Endpoint going away (page navigated away)
1006  Connection closed abnormally (no close frame)
1011  Internal server error
4000+ Application-defined codes
```

---

## 2. The `ws` Library (Raw WebSockets in Node.js).

`ws` is the standard low-level WebSocket library for Node.js.

It maps directly to the WebSocket protocol with no additional abstraction.

```bash
npm install ws
npm install --save-dev @types/ws
```

### A Basic `ws` Server.

```typescript
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const httpServer = http.createServer();
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws: WebSocket, req: http.IncomingMessage) => {
  const ip = req.socket.remoteAddress;
  console.log(`New client from ${ip}. Total: ${wss.clients.size}`);

  ws.send(JSON.stringify({ type: "welcome", message: "Connected" }));

  ws.on("message", (rawData: Buffer) => {
    const data = JSON.parse(rawData.toString());

    // Broadcast to ALL connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "broadcast", payload: data }));
      }
    });
  });

  ws.on("close", (code, reason) => console.log(`Disconnected: ${code}`));
  ws.on("error", (err) => console.error("WS error:", err.message));
});

httpServer.listen(3001, () => console.log("ws://localhost:3001"));
```

### Rooms and Broadcasting Patterns.

```typescript
const rooms = new Map<string, Set<WebSocket>>();

function joinRoom(ws: WebSocket, roomId: string): void {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId)!.add(ws);
}

function leaveRoom(ws: WebSocket, roomId: string): void {
  rooms.get(roomId)?.delete(ws);
  if (rooms.get(roomId)?.size === 0) rooms.delete(roomId);
}

function broadcastToRoom(
  roomId: string,
  data: object,
  exclude?: WebSocket,
): void {
  const clients = rooms.get(roomId);
  if (!clients) return;
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
```

### Heartbeat (Detecting Dead Connections).

```typescript
// A client that disconnects without sending a close frame
// (network drop, browser crash) will appear "open" to the server indefinitely.
// Heartbeats detect and clean up these ghost connections.

interface HeartbeatSocket extends WebSocket {
  isAlive: boolean;
}

wss.on("connection", (ws: HeartbeatSocket) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });
});

const heartbeat = setInterval(() => {
  wss.clients.forEach((rawWs) => {
    const ws = rawWs as HeartbeatSocket;
    if (!ws.isAlive) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30_000);

wss.on("close", () => clearInterval(heartbeat));
```

---

## 3. Socket.IO (WebSockets with Extras).

`socket.io` wraps WebSockets and adds:

- automatic reconnection,
- rooms,
- namespaces,
- event-based messaging,
- acknowledgements and
- HTTP long-polling fallback.

```bash
npm install socket.io         # server
npm install socket.io-client  # client
```

### Socket.IO vs Raw WebSockets.

```
Raw WebSocket (ws)                  Socket.IO
──────────────────────────────      ──────────────────────────────────
Raw binary/text frames              Named events (socket.emit('chat'))
You manage reconnection             Auto-reconnection built in
You implement rooms manually        Built-in rooms and namespaces
No acknowledgements                 Acknowledgement callbacks
Falls back to nothing               Falls back to HTTP long-polling
No middleware                       Middleware for auth, logging
```

### Setting Up Socket.IO with a Custom Next.js Server.

The App Router runs on a serverless-style model where each request is handled independently.

WebSockets need a **persistent process**.

The correct pattern for Next.js 16 + App Router is a **custom server** (`server.ts`) that boots both Next.js and Socket.IO on the same port.

```typescript
// server.ts
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // All normal HTTP (pages, API routes) goes through Next.js
    nextHandler(req, res);
  });

  // Socket.IO attaches to the SAME HTTP server
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("message", (data: { room: string; text: string }) => {
      io.to(data.room).emit("message", {
        socketId: socket.id,
        text: data.text,
        sentAt: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Next.js + Socket.IO on http://localhost:${port}`);
  });
});
```

```json
// package.json — replace next dev with the custom server
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "next build",
    "start": "NODE_ENV=production tsx server.ts"
  }
}
```

### Socket.IO Core Concepts.

```typescript
// ─── Server-side ──────────────────────────────────────────────────────────

socket.emit("event", data); // to this client only
socket.broadcast.emit("event", data); // to all EXCEPT this client
io.emit("event", data); // to ALL clients
socket.to("room1").emit("event", data); // to room, EXCLUDING sender
io.to("room1").emit("event", data); // to room, INCLUDING sender

socket.join("room1");
socket.leave("room1");
socket.rooms; // Set of room IDs

// Acknowledgements
socket.emit("event", data, (ack) => {
  console.log("Client acknowledged:", ack);
});

// ─── Client-side ──────────────────────────────────────────────────────────

import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("disconnect", (reason) => console.log("Disconnected:", reason));
socket.on("connect_error", (err) => console.error("Error:", err.message));

socket.emit("message", { text: "hello" });
socket.on("message", (data) => console.log("Received:", data));
socket.off("message"); // remove a listener
socket.disconnect(); // manual disconnect
```

### Socket.IO Middleware (Auth).

```typescript
// Server-side — runs before every connection is accepted
io.use((socket, next) => {
  const token = socket.handshake.auth.token as string;
  if (!token) return next(new Error("Authentication required"));

  try {
    const user = verifyJWT(token);
    socket.data.user = user; // attach for use in handlers
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// Client-side
const socket = io("http://localhost:3000", {
  auth: { token: localStorage.getItem("token") },
});
```

### Typed Events.

```typescript
// src/types/socket.ts
import type { Server, Socket } from "socket.io";

export interface Message {
  id: string;
  text: string;
  from: string;
  socketId: string;
  sentAt: string;
}

// Events the CLIENT sends → SERVER listens
export interface ClientToServerEvents {
  "join-room": (data: { roomId: string; name: string }) => void;
  "send-message": (data: { roomId: string; text: string }) => void;
  typing: (data: { roomId: string; isTyping: boolean }) => void;
}

// Events the SERVER sends → CLIENT listens
export interface ServerToClientEvents {
  "new-message": (msg: Message) => void;
  "room-users": (users: string[]) => void;
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
```

### Custom `useSocket` Hook.

```tsx
// src/hooks/useSocket.ts
"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // guard SSR

    const socket = io({ reconnectionAttempts: 10, reconnectionDelay: 2000 });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, connected };
}
```

### Namespaces.

```typescript
const chatNamespace = io.of("/chat");
const adminNamespace = io.of("/admin");

chatNamespace.on("connection", (socket) => {
  socket.on("send-message", (msg) => chatNamespace.emit("new-message", msg));
});

// Client connects to a specific namespace
const chatSocket = io("http://localhost:3000/chat");
```

### Typing Indicators.

```typescript
// Server
socket.on("typing", ({ roomId, isTyping }) => {
  socket.to(roomId).emit("typing-update", {
    name: socket.data.name,
    isTyping,
  });
});

// Client — debounce so it fires only after pausing
const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  socket.emit("typing", { roomId, isTyping: true });
  if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  typingTimerRef.current = setTimeout(() => {
    socket.emit("typing", { roomId, isTyping: false });
  }, 2000);
};
```

---

## 4. WebRTC (Peer-to-Peer Communication).

**WebRTC** (Web Real-Time Communication) is a browser API for **direct peer-to-peer** connections.

For video, audio and arbitrary data.

Without routing media through your server.

```
Without WebRTC (server-relayed):
  Peer A ──── video ──▶ Your Server ──── video ──▶ Peer B
  (all video goes through your server — expensive, adds latency)

With WebRTC:
  Peer A ──────────────────────── video ──▶ Peer B
  (direct P2P — your server only helps establish the connection)
```

### The Three Parts of WebRTC.

```
1. MediaDevices API      Access camera and microphone.
                         navigator.mediaDevices.getUserMedia({ video: true, audio: true })

2. RTCPeerConnection     Manage the P2P connection.
                         Handles ICE, DTLS encryption, codec negotiation.

3. RTCDataChannel        Send arbitrary data directly between peers.
                         Like a WebSocket but P2P — no server relay.
```

### The Signaling Process.

WebRTC peers must exchange metadata (SDP and ICE candidates) before the direct connection can be established.

This exchange is called **signaling** and goes through YOUR server (via WebSocket/Socket.IO).

Once signaling is complete, media flows directly.

```
Peer A (Caller)               Signaling Server            Peer B (Callee)
───────────────               ────────────────            ───────────────
1. Create Offer (SDP)
2. setLocalDescription(offer)
3. Emit 'offer' ────────────▶ relay to Peer B ─────────▶ 4. setRemoteDescription(offer)
                                                           5. Create Answer (SDP)
                                                           6. setLocalDescription(answer)
10. setRemoteDescription ◀─── relay to Peer A ◀────────── 7. Emit 'answer'

During steps 2 & 6, ICE gathering starts. Both peers emit
'ice-candidate' events via the signaling server. Each side
calls addIceCandidate() with candidates it receives.

Once a matching ICE pair is found → P2P connection open!
Media flows directly between Peer A and Peer B.
```

### SDP and ICE.

```
SDP (Session Description Protocol)
  Describes WHAT the peers can communicate:
    - Supported codecs (H.264, VP8, Opus, etc.)
    - Resolution and bitrate constraints
    - Whether audio/video is sendonly / recvonly / sendrecv

ICE (Interactive Connectivity Establishment)
  Figures out HOW the peers reach each other:
    - Host candidates:             your local LAN IP (192.168.x.x)
    - Server-reflexive candidates: your public IP via a STUN server
    - Relay candidates:            traffic relayed via TURN (last resort)

STUN server  Tells you your public IP. Use stun.l.google.com:19302 (free).
TURN server  Relays media when direct P2P fails (symmetric NAT).
             Must run your own or pay for one in production.
```

### Accessing Camera and Microphone.

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
  audio: { echoCancellation: true, noiseSuppression: true },
});

// Display in a <video> element
const videoEl = document.querySelector<HTMLVideoElement>("#local")!;
videoEl.srcObject = stream;
videoEl.muted = true; // mute local playback — you don't want to hear yourself
videoEl.play();

// List devices
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter((d) => d.kind === "videoinput");
```

### Creating a Peer Connection.

```typescript
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Production: add your TURN server here
  ],
});

// Add local tracks
localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

// Receive remote stream
pc.ontrack = (event) => {
  const [remoteStream] = event.streams;
  remoteVideo.srcObject = remoteStream;
};

// ICE candidates → relay via signaling
pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidate", {
      to: remoteSocketId,
      candidate: event.candidate,
    });
  }
};

// Monitor state
pc.onconnectionstatechange = () => {
  console.log("Connection:", pc.connectionState);
  // 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed'
};
```

### Offer / Answer Exchange.

```typescript
// ─── CALLER ─────────────────────────────────────────────────────────────
async function createOffer(pc: RTCPeerConnection, socket: Socket, to: string) {
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
  await pc.setLocalDescription(offer); // triggers ICE gathering
  socket.emit("offer", { to, sdp: offer });
}

// ─── CALLEE ─────────────────────────────────────────────────────────────
async function handleOffer(
  pc: RTCPeerConnection,
  socket: Socket,
  from: string,
  sdp: RTCSessionDescriptionInit,
) {
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("answer", { to: from, sdp: answer });
}

// ─── CALLER handles answer ───────────────────────────────────────────────
async function handleAnswer(
  pc: RTCPeerConnection,
  sdp: RTCSessionDescriptionInit,
) {
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
}

// ─── Both sides add ICE candidates ───────────────────────────────────────
async function handleIceCandidate(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit,
) {
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.error("ICE error:", e);
  }
}
```

### RTCDataChannel.

```typescript
// Caller creates the channel BEFORE creating the offer
const dc = pc.createDataChannel("chat", { ordered: true });
dc.onopen = () => console.log("Data channel open");
dc.onmessage = (e) => console.log("Received:", e.data);
dc.send("Hello, peer!");

// Callee listens for the channel
pc.ondatachannel = (event) => {
  const channel = event.channel;
  channel.onopen = () => console.log("Data channel open");
  channel.onmessage = (e) => console.log("Received:", e.data);
};
```

---

## 5. Media Controls and Stream Management.

```typescript
// Mute / unmute microphone (does NOT stop the track — just silences it)
function toggleAudio(stream: MediaStream): boolean {
  const track = stream.getAudioTracks()[0];
  track.enabled = !track.enabled;
  return track.enabled;
}

// Enable / disable camera
function toggleVideo(stream: MediaStream): boolean {
  const track = stream.getVideoTracks()[0];
  track.enabled = !track.enabled;
  return track.enabled;
}

// Stop all tracks — releases the camera/mic hardware
function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

// Screen sharing
async function startScreenShare(
  pc: RTCPeerConnection,
): Promise<MediaStreamTrack> {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
  });
  const screenTrack = screenStream.getVideoTracks()[0];

  // Replace camera track in the peer connection — no renegotiation needed
  const sender = pc.getSenders().find((s) => s.track?.kind === "video");
  if (sender) await sender.replaceTrack(screenTrack);

  return screenTrack;
}

// Record a stream
function recordStream(stream: MediaStream): () => Blob {
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
  });
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.start(1000);
  return () => {
    recorder.stop();
    return new Blob(chunks, { type: "video/webm" });
  };
}
```

---

## 6. React Patterns for WebSockets.

### Context Provider Pattern.

```tsx
// src/contexts/SocketContext.tsx
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}
const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io({ autoConnect: true, reconnectionAttempts: 10 });
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => useContext(SocketContext);
```

### `useSocketEvent` Hook.

```typescript
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useSocketEvent<T>(
  socket: Socket | null,
  event: string,
  handler: (data: T) => void,
): void {
  useEffect(() => {
    if (!socket) return;
    socket.on(event as string, handler as (...args: unknown[]) => void);
    return () => {
      socket.off(event as string, handler as (...args: unknown[]) => void);
    };
  }, [socket, event, handler]);
}
```

---

## 7. Security Considerations.

```
WebSocket Security
  ✅ Use wss:// (WebSocket Secure) in production — equivalent to HTTPS.
  ✅ Validate the Origin header on the server.
  ✅ Authenticate before accepting connections (JWT in handshake auth).
  ✅ Rate-limit messages to prevent abuse.
  ✅ Validate and sanitise all incoming payloads.

WebRTC Security
  ✅ All WebRTC media is encrypted with DTLS/SRTP — mandatory by spec.
  ✅ Authenticate the signaling channel itself.
  ✅ Use credential-protected TURN servers — never open relays.
```

```typescript
// Rate limiting per socket
const msgCount = new Map<string, number>();

io.on("connection", (socket) => {
  msgCount.set(socket.id, 0);

  socket.on("message", (data) => {
    const count = (msgCount.get(socket.id) ?? 0) + 1;
    msgCount.set(socket.id, count);
    if (count > 60) {
      socket.emit("error", "Rate limit exceeded");
      socket.disconnect();
      return;
    }
    // handle message
  });

  socket.on("disconnect", () => msgCount.delete(socket.id));
});
```

---

## Assignment.

1. **Real-Time Chat App with Socket.IO and Next.js 16.**

   **What you practice:**
   - Setting up a custom Next.js 16 server (`server.ts`) that boots both Next.js and Socket.IO
   - Typed Socket.IO events with `ClientToServerEvents` / `ServerToClientEvents` interfaces
   - `useSocket` hook with automatic cleanup on unmount
   - `useSocketEvent` for subscribing to named events
   - Socket.IO rooms — joining, broadcasting to room members only
   - Typing indicators with debounced `typing` events
   - Online presence (room user list)
   - Next.js 16 + React 19 + Tailwind CSS 4

   **Requirements:**
   - Custom `server.ts` that attaches Socket.IO to the Next.js HTTP server.
   - Users enter a name and a room ID on the lobby page and click "Join Room".
   - Messages are scoped to rooms — messages in Room A are not visible in Room B.
   - Show a real-time list of users currently in the room.
   - Show a typing indicator ("Alice is typing...") when another user is typing.
   - Show a timestamp on every message.
   - Own messages render on the right (blue), others' on the left (gray).
   - When a user disconnects, they are removed from the room's user list and a system message appears.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   # Setup
   npm install && npm run dev → open http://localhost:3000

   # 1. Lobby
   → Name + Room ID form. "Join Room" disabled until both fields filled.
   Enter "Alice" and "general" → click Join Room.
   → /chat?name=Alice&room=general. Sidebar shows "#general" and "Alice (you)".

   # 2. Multi-user
   Open a second tab. Enter "Bob", room "general".
   → Alice sees "Bob joined the room" system message.
   → Both users show in each other's member list.

   # 3. Messaging
   Alice types "Hello Bob!" and presses Enter.
   → Alice: message on RIGHT (blue). Bob: message on LEFT (gray) with "Alice" label.
   → Timestamps appear below each message.

   # 4. Typing indicator
   Bob starts typing.
   → Alice sees "Bob is typing..." below the messages.
   Bob stops for 2 seconds.
   → "Bob is typing..." disappears.

   # 5. Room isolation
   Open a third tab. Enter "Carol", room "private".
   Carol sends "hello". → Alice and Bob do NOT see this message.

   # 6. Disconnect
   Close Bob's tab.
   → Alice sees "Bob left the room" system message. Bob removed from sidebar.

   # 7. Reconnect
   Disconnect network in DevTools → Network → Offline. Re-enable.
   → Status shows "Reconnecting..." then "Connected" again automatically.
   ```

2. **Collaborative Whiteboard with Native WebSockets and Canvas.**

   **What you practice:**
   - Using the native browser `WebSocket` API without Socket.IO
   - A standalone `ws` server running separately from Next.js on port 3001
   - Drawing on HTML5 `<canvas>` with mouse events
   - Syncing canvas draw strokes in real time across clients
   - Typed discriminated union for all message types
   - Reconnect-on-close with exponential backoff
   - Heartbeat ping/pong to detect dead connections

   **Requirements:**
   - A standalone `ws` WebSocket server in `ws-server/server.ts` on port 3001.
   - The Next.js app runs normally on port 3000 with `next dev`.
   - The whiteboard page (`/whiteboard`) lets users draw with the mouse.
   - Every draw stroke is broadcast to all other connected clients in real time.
   - A colour picker and brush size slider control the drawing style.
   - A "Clear board" button broadcasts a `clear` event — wiping all connected canvases.
   - Show the current number of connected users (from `user-count` events).
   - Auto-reconnect with exponential backoff when the ws-server goes down.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   # Terminal 1 — WebSocket server
   cd ws-server && npm install && npm run dev
   → "WebSocket server on ws://localhost:3001"

   # Terminal 2 — Next.js
   cd .. && npm install && npm run dev
   → http://localhost:3000 → click "Open Whiteboard"

   # 1. User count
   Open /whiteboard in two tabs. → Both show "2 online".

   # 2. Drawing syncs
   Tab 1: select red, draw a stroke.
   → Same stroke appears on Tab 2 in real time.

   # 3. Clear board
   Click "Clear" in Tab 1.
   → Both canvases are wiped simultaneously.

   # 4. Reconnect
   Stop ws-server (Ctrl+C). → Both tabs show "Reconnecting...".
   Restart ws-server. → Both reconnect automatically (1s → 2s → 4s backoff).

   # 5. Heartbeat
   Leave tabs idle for 30+ seconds.
   → Server sends a ping; clients respond with pong.
   → Connections remain alive (no spurious disconnects).
   ```

3. **Video-Call App with WebRTC, Socket.IO signaling and Screen Sharing.**

   **What you practice:**
   - Full WebRTC signaling: offer → answer → ICE candidates via Socket.IO
   - `RTCPeerConnection` lifecycle in a `usePeerConnection` hook
   - `getUserMedia` for camera/mic, `getDisplayMedia` for screen sharing
   - `replaceTrack` to swap camera → screen mid-call without renegotiation
   - Muting audio / disabling video via `track.enabled`
   - Multi-room signaling — only peers in the same room connect
   - Graceful cleanup: stop tracks, close peer connections, leave room

   **Requirements:**
   - Custom `server.ts` handling both Next.js and Socket.IO signaling.
   - Signaling events: `join-room`, `room-peers`, `user-joined`, `user-left`, `offer`, `answer`, `ice-candidate`.
   - On joining, the new user gets the list of existing peers and sends them each an offer.
   - Each remote participant renders in their own `<video>` tile.
   - Controls: mute/unmute, camera on/off, screen share, leave call.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   # Setup
   npm install && npm run dev → http://localhost:3000
   Allow camera/microphone when prompted.

   # 1. Single user
   Enter "Alice", room "test". → Alice's video appears.

   # 2. Two-user call
   Second tab: "Bob", same room "test".
   → ICE signaling completes → Bob's video appears in Alice's view.
   → Alice's video appears in Bob's view.

   # 3. Mute / unmute
   Alice clicks "🎤 Mute". → Bob cannot hear Alice. Video continues.
   Alice clicks "🔇 Unmute". → Audio restored.

   # 4. Camera off
   Alice clicks "📹 Camera". → Bob sees a black tile for Alice.
   Alice clicks "📷 Start Cam". → Camera restored.

   # 5. Screen sharing
   Alice clicks "🖥️ Share". → Browser shows the screen picker.
   Alice selects a window. → Bob sees Alice's screen instead of camera.
   Alice clicks "🖥️ Stop Share". → Camera feed restored.

   # 6. Leave
   Alice clicks "📞 Leave".
   → Tracks stopped (camera LED off). Redirected to lobby.
   → Bob sees Alice's tile disappear. "user-left" event fired.

   # 7. Three-way (if three devices available)
   Add Carol to "test" room.
   → All three see each other (full mesh: 3 RTCPeerConnections).
   Carol leaves → Alice and Bob continue unaffected.
   ```
