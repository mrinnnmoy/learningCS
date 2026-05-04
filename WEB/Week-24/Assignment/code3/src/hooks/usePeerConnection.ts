"use client";
import { useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export interface PeerInfo {
  socketId: string;
  name: string;
  stream: MediaStream | null;
}

export function usePeerConnection(
  socket: Socket | null,
  localStream: MediaStream | null,
) {
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [peers, setPeers] = useState<PeerInfo[]>([]);

  const updatePeer = useCallback(
    (socketId: string, name: string, stream: MediaStream | null) => {
      setPeers((prev) => {
        const exists = prev.find((p) => p.socketId === socketId);
        if (exists)
          return prev.map((p) =>
            p.socketId === socketId ? { ...p, stream } : p,
          );
        return [...prev, { socketId, name, stream }];
      });
    },
    [],
  );

  const removePeer = useCallback((socketId: string) => {
    pcsRef.current.get(socketId)?.close();
    pcsRef.current.delete(socketId);
    setPeers((prev) => prev.filter((p) => p.socketId !== socketId));
  }, []);

  const createPc = useCallback(
    (remoteId: string, remoteName: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      localStream?.getTracks().forEach((track) => {
        if (localStream) pc.addTrack(track, localStream);
      });

      pc.ontrack = (e) => {
        const [rs] = e.streams;
        updatePeer(remoteId, remoteName, rs);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("ice-candidate", {
            to: remoteId,
            candidate: e.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          removePeer(remoteId);
        }
      };

      pcsRef.current.set(remoteId, pc);
      updatePeer(remoteId, remoteName, null);
      return pc;
    },
    [socket, localStream, updatePeer, removePeer],
  );

  const sendOffer = useCallback(
    async (remoteId: string, remoteName: string) => {
      if (!socket) return;
      const pc = createPc(remoteId, remoteName);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: remoteId, sdp: offer });
    },
    [socket, createPc],
  );

  const handleOffer = useCallback(
    async (from: string, name: string, sdp: RTCSessionDescriptionInit) => {
      if (!socket) return;
      const pc = createPc(from, name);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, sdp: answer });
    },
    [socket, createPc],
  );

  const handleAnswer = useCallback(
    async (from: string, sdp: RTCSessionDescriptionInit) => {
      const pc = pcsRef.current.get(from);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    },
    [],
  );

  const handleIceCandidate = useCallback(
    async (from: string, candidate: RTCIceCandidateInit) => {
      const pc = pcsRef.current.get(from);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error(e);
        }
      }
    },
    [],
  );

  const replaceVideoTrack = useCallback(async (newTrack: MediaStreamTrack) => {
    await Promise.all(
      Array.from(pcsRef.current.values()).map((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        return sender ? sender.replaceTrack(newTrack) : Promise.resolve();
      }),
    );
  }, []);

  const closeAll = useCallback(() => {
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();
    setPeers([]);
  }, []);

  return {
    peers,
    sendOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
    replaceVideoTrack,
    closeAll,
  };
}
