import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
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

  io.on("connection", (socket: TypedSocket) => {
    socket.on("join-room", ({ roomId, name }) => {
      socket.data.name = name;
      socket.data.roomId = roomId;
      socket.join(roomId);

      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      const room = rooms.get(roomId)!;

      // Tell new joiner who's already here
      socket.emit("room-peers", Array.from(room.values()));
      // Tell existing peers about the new joiner
      socket.to(roomId).emit("user-joined", { socketId: socket.id, name });
      // Register new joiner
      room.set(socket.id, { socketId: socket.id, name });

      console.log(`[Signaling] ${name} joined ${roomId}. Size: ${room.size}`);
    });

    socket.on("offer", ({ to, sdp }) =>
      io
        .to(to)
        .emit("offer", { from: socket.id, name: socket.data.name ?? "", sdp }),
    );
    socket.on("answer", ({ to, sdp }) =>
      io.to(to).emit("answer", { from: socket.id, sdp }),
    );
    socket.on("ice-candidate", ({ to, candidate }) =>
      io.to(to).emit("ice-candidate", { from: socket.id, candidate }),
    );

    socket.on("disconnect", () => {
      const { roomId, name } = socket.data;
      if (!roomId || !name) return;
      rooms.get(roomId)?.delete(socket.id);
      socket.to(roomId).emit("user-left", { socketId: socket.id, name });
      if (rooms.get(roomId)?.size === 0) rooms.delete(roomId);
    });
  });

  httpServer.listen(port, () =>
    console.log(`> Next.js + WebRTC Signaling on http://localhost:${port}`),
  );
});
