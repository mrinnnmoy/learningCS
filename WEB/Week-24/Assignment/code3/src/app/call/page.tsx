"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import type { RoomUser } from "@/types/socket";

function VideoTile({
  stream,
  name,
  muted = false,
}: {
  stream: MediaStream | null;
  name: string;
  muted?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          👤
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
        {name}
      </div>
    </div>
  );
}

function CallRoom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") ?? "";
  const roomId = searchParams.get("room") ?? "";

  const { socket, connected } = useSocket();
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const {
    peers,
    sendOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
    replaceVideoTrack,
    closeAll,
  } = usePeerConnection(socket, localStream);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [joined, setJoined] = useState(false);
  const hasJoined = useRef(false);

  const joinCall = useCallback(async () => {
    if (!socket || !connected || hasJoined.current) return;
    hasJoined.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setJoined(true);
      socket.emit("join-room", { roomId, name });
    } catch {
      alert("Please allow camera and microphone access.");
    }
  }, [socket, connected, roomId, name]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room-peers", (ps: RoomUser[]) =>
      ps.forEach((p) => sendOffer(p.socketId, p.name)),
    );
    socket.on("user-joined", (_u: RoomUser) => {
      /* callee will send us an offer */
    });
    socket.on("user-left", (u: RoomUser) => removePeer(u.socketId));
    socket.on("offer", ({ from, name: n, sdp }) => handleOffer(from, n, sdp));
    socket.on("answer", ({ from, sdp }) => handleAnswer(from, sdp));
    socket.on("ice-candidate", ({ from, candidate }) =>
      handleIceCandidate(from, candidate),
    );

    return () => {
      socket.off("room-peers");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [
    socket,
    sendOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
  ]);

  useEffect(() => {
    if (connected && !joined) joinCall();
  }, [connected, joined, joinCall]);

  const toggleAudio = (): void => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setAudioEnabled(t.enabled);
    }
  };

  const toggleVideo = (): void => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setVideoEnabled(t.enabled);
    }
  };

  const toggleScreen = async (): Promise<void> => {
    if (sharing) {
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        camTrack.enabled = videoEnabled;
        await replaceVideoTrack(camTrack);
      }
      setSharing(false);
    } else {
      try {
        const ss = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const track = ss.getVideoTracks()[0];
        await replaceVideoTrack(track);
        track.onended = () => {
          setSharing(false);
        };
        setSharing(true);
      } catch {
        /* user cancelled */
      }
    }
  };

  const leaveCall = (): void => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    closeAll();
    socket?.disconnect();
    router.push("/");
  };

  const btn = (label: string, onClick: () => void, danger = false) => (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        danger
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-slate-700 hover:bg-slate-600 text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-white font-semibold">Room: {roomId}</h1>
          <p className="text-slate-400 text-xs">
            {peers.length + 1} participant{peers.length !== 0 ? "s" : ""}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs ${connected ? "text-green-400" : "text-yellow-400"}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-yellow-400"}`}
          />
          {connected ? "Connected" : "Reconnecting..."}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div
          className={`grid gap-4 ${
            peers.length === 0
              ? "grid-cols-1 max-w-lg mx-auto"
              : peers.length <= 1
                ? "grid-cols-2"
                : peers.length <= 3
                  ? "grid-cols-2"
                  : "grid-cols-3"
          }`}
        >
          <VideoTile stream={localStream} name={`${name} (you)`} muted />
          {peers.map((p) => (
            <VideoTile key={p.socketId} stream={p.stream} name={p.name} />
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-center gap-3 flex-shrink-0">
        {btn(audioEnabled ? "🎤 Mute" : "🔇 Unmute", toggleAudio)}
        {btn(videoEnabled ? "📹 Camera" : "📷 Start Cam", toggleVideo)}
        {btn(sharing ? "🖥️ Stop Share" : "🖥️ Share", toggleScreen)}
        {btn("📞 Leave", leaveCall, true)}
      </div>
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-slate-400">
          Loading...
        </div>
      }
    >
      <CallRoom />
    </Suspense>
  );
}
