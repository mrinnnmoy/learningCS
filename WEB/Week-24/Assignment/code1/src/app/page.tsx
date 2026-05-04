"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!name.trim() || !roomId.trim()) return;
    router.push(
      `/chat?name=${encodeURIComponent(name.trim())}&room=${encodeURIComponent(roomId.trim())}`,
    );
  };

  const inp =
    "w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 bg-white";

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💬</div>
          <h1 className="text-2xl font-bold text-slate-900">
            Join a Chat Room
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time chat with Socket.IO
          </p>
        </div>
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Alice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={30}
              className={inp}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Room ID
            </label>
            <input
              type="text"
              placeholder="general"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              maxLength={50}
              className={inp}
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !roomId.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Join Room →
          </button>
        </form>
      </div>
    </div>
  );
}
