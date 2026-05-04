# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code3 --typescript --tailwind --eslint --app --src-dir
  cd code3
  npm install socket.io socket.io-client tsx
  npm install -D cross-env

Step 2 — Create tsconfig.server.json
  Same pattern as Assignment 1 — CommonJS module, node moduleResolution,
  noEmit: false, outDir: "dist", include: ["server.ts","src/types/**/*.ts"].

Step 3 — Update package.json scripts
  "dev":   "tsx server.ts"
  "build": "next build"
  "start": "cross-env NODE_ENV=production tsx server.ts"

Step 4 — Create src/types/socket.ts
  RoomUser interface: { socketId: string; name: string }.
  ClientToServerEvents: join-room, offer, answer, ice-candidate.
  ServerToClientEvents: room-peers, user-joined, user-left, offer (with from+name), answer, ice-candidate.
  SocketData: { name: string; roomId: string }.
  Export TypedServer and TypedSocket.

Step 5 — Write server.ts
  Same custom server pattern as Assignment 1 (next + http + socket.io on same port).
  Track rooms as Map<string, Map<string, RoomUser>>.
  Handle 'join-room':
    Set socket.data.name and socket.data.roomId.
    socket.join(roomId).
    Emit 'room-peers' to the JOINING socket with Array.from(room.values()).
      (This tells the new joiner who to call — they will initiate offers to each.)
    Emit 'user-joined' to everyone ELSE in the room.
    Add the new socket to the room map.
  Handle 'offer': relay to the 'to' socket, add 'from' (socket.id) and 'name' (socket.data.name).
  Handle 'answer': relay to the 'to' socket with 'from' added.
  Handle 'ice-candidate': relay to the 'to' socket with 'from' added.
  Handle 'disconnect': delete from room map, emit 'user-left' to remaining peers.

Step 6 — Create src/hooks/useSocket.ts
  Same as Assignment 1 — io() in useEffect, track connected state, cleanup on unmount.

Step 7 — Create src/hooks/usePeerConnection.ts
  State: peers (PeerInfo[]) in useState. pcsRef: Map<string, RTCPeerConnection> in useRef.
  PeerInfo interface: { socketId, name, stream: MediaStream | null }.
  ICE_SERVERS array with two Google STUN servers.
  updatePeer(socketId, name, stream): if exists → update stream, else → append to peers.
  removePeer(socketId): close and delete from pcsRef, filter out of peers state.
  createPc(remoteId, remoteName): RTCPeerConnection with ICE servers.
    Add all localStream tracks via pc.addTrack(track, localStream).
    pc.ontrack: extract event.streams[0], call updatePeer with the remote stream.
    pc.onicecandidate: if event.candidate, emit 'ice-candidate' to remoteId via socket.
    pc.onconnectionstatechange: if 'failed' or 'closed', call removePeer.
    Store in pcsRef, call updatePeer with null stream initially (placeholder tile).
    Return pc.
  sendOffer(remoteId, remoteName): createPc → createOffer (offerToReceiveAudio/Video true) →
    setLocalDescription → emit 'offer' to remoteId.
  handleOffer(from, name, sdp): createPc(from, name) → setRemoteDescription →
    createAnswer → setLocalDescription → emit 'answer' to from.
  handleAnswer(from, sdp): pcsRef.get(from) → setRemoteDescription.
  handleIceCandidate(from, candidate): pcsRef.get(from) → addIceCandidate (try/catch).
  replaceVideoTrack(newTrack): iterate all pcs, find video sender, sender.replaceTrack(newTrack).
  closeAll: close and clear all pcs, setPeers([]).
  Return all functions + peers.

Step 8 — Create src/app/globals.css
  @import "tailwindcss";

Step 9 — Create src/app/layout.tsx and src/app/page.tsx
  layout.tsx: dark background (bg-slate-950).
  page.tsx: name + room inputs, router.push to /call on submit.

Step 10 — Create src/app/call/page.tsx
  Wrap in <Suspense> (required for useSearchParams in Next.js).
  Inside CallRoom component:
    Read name and room from useSearchParams(). Redirect to / if either is missing.
    useSocket() for socket + connected.
    localStreamRef (useRef) stores the MediaStream — ref not state so it never
      causes re-renders when tracks are replaced mid-call.
    localStream (useState) is used only to pass to usePeerConnection and trigger
      the VideoTile re-render when the stream first arrives.
    usePeerConnection(socket, localStream) for all WebRTC logic.
    useState for audioEnabled, videoEnabled, sharing, joined.
    hasJoined ref to prevent duplicate join-room emissions.
    joinCall(): getUserMedia → store in localStreamRef → setLocalStream →
      setJoined(true) → socket.emit('join-room', ...).
      Catch errors and alert the user to allow camera/mic access.
    Register socket event handlers in a useEffect that cleans up on unmount:
      'room-peers' → peers.forEach(p => sendOffer(p.socketId, p.name)).
        (The newly joined user calls all existing peers.)
      'user-joined' → no action needed here; the new user will call us.
      'user-left'   → removePeer(user.socketId).
      'offer'       → handleOffer(from, name, sdp).
      'answer'      → handleAnswer(from, sdp).
      'ice-candidate' → handleIceCandidate(from, candidate).
    useEffect: if connected && !joined → joinCall().
    toggleAudio(): get audio track from localStreamRef, flip track.enabled, update state.
    toggleVideo(): same for video track.
    toggleScreen():
      If currently sharing: restore camera track (find it in localStreamRef), replaceVideoTrack, setSharing(false).
      If not sharing: getDisplayMedia({ video: true }) → get video track →
        replaceVideoTrack → set track.onended to stop sharing → setSharing(true).
    leaveCall(): stop all tracks in localStreamRef, closeAll(), socket.disconnect(), router.push('/').
    VideoTile component: useRef<HTMLVideoElement>, useEffect sets videoRef.current.srcObject = stream.
      Shows a 👤 placeholder when stream is null.
      name label overlaid at the bottom-left.
    Render: header (room name, participant count, connection status) +
      grid of VideoTiles (local first, then one per peer) +
      control bar (mute, camera, screen share, leave).
    Grid columns: 1 col if alone, 2 cols for 2-3 participants, 3 cols for 4+.
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
