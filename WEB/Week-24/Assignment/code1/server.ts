import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { randomUUID } from "crypto";
import type { TypedServer, TypedSocket, RoomUser } from "./src/types/socket";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const httpServer = createServer((req, res) => nextHandler(req, res));

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  }) as TypedServer;

  // roomId → Map<socketId, RoomUser>
  const rooms = new Map<string, Map<string, RoomUser>>();

  function getRoomUsers(roomId: string): RoomUser[] {
    return Array.from(rooms.get(roomId)?.values() ?? []);
  }

  io.on("connection", (socket: TypedSocket) => {
    console.log(`[Socket.IO] Connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, name }) => {
      const prevRoom = socket.data.roomId;
      if (prevRoom) {
        socket.leave(prevRoom);
        rooms.get(prevRoom)?.delete(socket.id);
        io.to(prevRoom).emit("user-left", {
          socketId: socket.id,
          name: socket.data.name,
        });
        io.to(prevRoom).emit("room-users", getRoomUsers(prevRoom));
      }

      socket.join(roomId);
      socket.data.name = name;
      socket.data.roomId = roomId;

      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      rooms.get(roomId)!.set(socket.id, { socketId: socket.id, name });

      socket.to(roomId).emit("user-joined", { socketId: socket.id, name });
      io.to(roomId).emit("room-users", getRoomUsers(roomId));
      console.log(`[Socket.IO] ${name} joined ${roomId}`);
    });

    socket.on("send-message", ({ roomId, text }) => {
      const msg = {
        id: randomUUID(),
        text: text.trim(),
        from: socket.data.name ?? "Unknown",
        socketId: socket.id,
        sentAt: new Date().toISOString(),
      };
      io.to(roomId).emit("new-message", msg);
    });

    socket.on("typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("typing-update", {
        name: socket.data.name ?? "Someone",
        isTyping,
      });
    });

    socket.on("disconnect", () => {
      const { roomId, name } = socket.data;
      if (roomId && name) {
        rooms.get(roomId)?.delete(socket.id);
        io.to(roomId).emit("user-left", { socketId: socket.id, name });
        io.to(roomId).emit("room-users", getRoomUsers(roomId));
        if (rooms.get(roomId)?.size === 0) rooms.delete(roomId);
      }
      console.log(`[Socket.IO] Disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Next.js + Socket.IO ready on http://localhost:${port}`);
  });
});
