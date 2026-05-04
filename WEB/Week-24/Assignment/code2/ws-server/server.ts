import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

interface HeartbeatSocket extends WebSocket {
  isAlive: boolean;
}

const httpServer = http.createServer((_req, res) => {
  res.writeHead(200);
  res.end("WS server running");
});

const wss = new WebSocketServer({ server: httpServer });

function broadcastUserCount(): void {
  const payload = JSON.stringify({
    type: "user-count",
    count: wss.clients.size,
  });
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(payload);
  });
}

function broadcast(data: string, exclude?: WebSocket): void {
  wss.clients.forEach((c) => {
    if (c !== exclude && c.readyState === WebSocket.OPEN) c.send(data);
  });
}

wss.on("connection", (rawWs: WebSocket) => {
  const ws = rawWs as HeartbeatSocket;
  ws.isAlive = true;
  console.log(`[WS] Client connected. Total: ${wss.clients.size}`);
  broadcastUserCount();

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (rawData: Buffer) => {
    const text = rawData.toString();
    try {
      JSON.parse(text);
    } catch {
      return;
    } // drop non-JSON
    broadcast(text, ws);
  });

  ws.on("close", () => {
    console.log(`[WS] Client disconnected. Total: ${wss.clients.size}`);
    broadcastUserCount();
  });

  ws.on("error", (err) => console.error("[WS] Error:", err.message));
});

const heartbeat = setInterval(() => {
  wss.clients.forEach((rawC) => {
    const c = rawC as HeartbeatSocket;
    if (!c.isAlive) {
      c.terminate();
      return;
    }
    c.isAlive = false;
    c.ping();
  });
}, 30_000);

wss.on("close", () => clearInterval(heartbeat));

httpServer.listen(PORT, () =>
  console.log(`WebSocket server on ws://localhost:${PORT}`),
);
