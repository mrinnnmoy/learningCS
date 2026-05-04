"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import type { Message, RoomUser } from "@/types/socket";

function ChatRoom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") ?? "";
  const roomId = searchParams.get("room") ?? "";

  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [text, setText] = useState("");
  const [typingMsg, setTypingMsg] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasJoined = useRef(false);

  useEffect(() => {
    if (!name || !roomId) router.replace("/");
  }, [name, roomId, router]);

  useEffect(() => {
    if (!socket || !connected || hasJoined.current) return;
    hasJoined.current = true;
    socket.emit("join-room", { roomId, name });
  }, [socket, connected, roomId, name]);

  const onNewMessage = useCallback(
    (msg: Message) => setMessages((p) => [...p, msg]),
    [],
  );
  const onRoomUsers = useCallback(
    (users: RoomUser[]) => setRoomUsers(users),
    [],
  );
  const onUserJoined = useCallback(
    (user: RoomUser) =>
      setMessages((p) => [
        ...p,
        {
          id: crypto.randomUUID(),
          text: `${user.name} joined`,
          from: "system",
          socketId: "system",
          sentAt: new Date().toISOString(),
        },
      ]),
    [],
  );
  const onUserLeft = useCallback(
    (user: RoomUser) =>
      setMessages((p) => [
        ...p,
        {
          id: crypto.randomUUID(),
          text: `${user.name} left`,
          from: "system",
          socketId: "system",
          sentAt: new Date().toISOString(),
        },
      ]),
    [],
  );
  const onTypingUpdate = useCallback(
    ({ name: t, isTyping }: { name: string; isTyping: boolean }) =>
      setTypingMsg(isTyping ? `${t} is typing...` : ""),
    [],
  );

  useSocketEvent<Message>(socket, "new-message", onNewMessage);
  useSocketEvent<RoomUser[]>(socket, "room-users", onRoomUsers);
  useSocketEvent<RoomUser>(socket, "user-joined", onUserJoined);
  useSocketEvent<RoomUser>(socket, "user-left", onUserLeft);
  useSocketEvent<{ name: string; isTyping: boolean }>(
    socket,
    "typing-update",
    onTypingUpdate,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit("typing", { roomId, isTyping: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing", { roomId, isTyping: false });
    }, 2000);
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!socket || !text.trim()) return;
    socket.emit("send-message", { roomId, text: text.trim() });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    socket.emit("typing", { roomId, isTyping: false });
    setText("");
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider">
            Room
          </p>
          <p className="font-semibold text-blue-400 truncate mt-0.5">
            #{roomId}
          </p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
            Members ({roomUsers.length})
          </p>
          <ul className="flex flex-col gap-2">
            {roomUsers.map((u) => (
              <li key={u.socketId} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span
                  className={`text-sm truncate ${u.name === name ? "text-white font-medium" : "text-slate-300"}`}
                >
                  {u.name}
                  {u.name === name ? " (you)" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-slate-700">
          <span
            className={`flex items-center gap-2 text-xs ${connected ? "text-green-400" : "text-red-400"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
            />
            {connected ? "Connected" : "Reconnecting..."}
          </span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-semibold text-slate-900">#{roomId}</h1>
            <p className="text-xs text-slate-400">
              {roomUsers.length} member{roomUsers.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            Leave
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {messages.map((msg) => {
            const isOwn = msg.socketId === socket?.id;
            const isSys = msg.socketId === "system";

            if (isSys)
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col gap-1 max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}
                >
                  {!isOwn && (
                    <span className="text-xs text-slate-400 px-1">
                      {msg.from}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white text-slate-900 border border-slate-100 shadow-sm rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-slate-300 px-1">
                    {fmt(msg.sentAt)}
                  </span>
                </div>
              </div>
            );
          })}

          {typingMsg && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 shadow-sm px-4 py-2.5 rounded-2xl rounded-bl-sm">
                <span className="text-xs text-slate-400 italic">
                  {typingMsg}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="bg-white border-t border-slate-100 px-6 py-4 flex-shrink-0">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={text}
              onChange={handleInputChange}
              placeholder={`Message #${roomId}...`}
              disabled={!connected}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={!connected || !text.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-slate-400">
          Loading...
        </div>
      }
    >
      <ChatRoom />
    </Suspense>
  );
}
