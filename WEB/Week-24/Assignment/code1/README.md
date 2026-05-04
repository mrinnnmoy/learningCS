# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code1 --typescript --tailwind --eslint --app --src-dir
  cd code1
  npm install socket.io socket.io-client tsx

Step 2 — Create tsconfig.server.json
  Extends base tsconfig but overrides module to CommonJS and moduleResolution to node
  so tsx can run server.ts as a Node.js script. Set noEmit: false, outDir: "dist".

Step 3 — Update package.json scripts
  "dev":   "tsx server.ts"
  "build": "next build"
  "start": "NODE_ENV=production tsx server.ts"

Step 4 — Create src/types/socket.ts
  Define Message and RoomUser interfaces.
  Define ClientToServerEvents (join-room, send-message, typing).
  Define ServerToClientEvents (new-message, room-users, user-joined, user-left, typing-update).
  Define SocketData interface { name: string; roomId: string }.
  Export TypedServer and TypedSocket type aliases.

Step 5 — Write server.ts
  Import next, http, socket.io, randomUUID.
  Call nextApp.prepare() → createServer → attach Socket.IO as TypedServer.
  Track rooms as Map<string, Map<string, RoomUser>>.
  Handle 'join-room': leave previous room if any, join new room, update rooms map,
    emit 'user-joined' to others, emit 'room-users' to everyone in room.
  Handle 'send-message': build a Message object with randomUUID id and ISO sentAt,
    emit 'new-message' to everyone in the room (including sender via io.to()).
  Handle 'typing': emit 'typing-update' to room EXCLUDING sender via socket.to().
  Handle 'disconnect': remove from rooms map, emit 'user-left' and 'room-users' to room.

Step 6 — Create src/hooks/useSocket.ts
  Guard against SSR with typeof window === 'undefined' check.
  Create io() in a useEffect. Track connected state with useState.
  Store socket in a useRef. Clean up by calling socket.disconnect() on unmount.
  Return { socket: socketRef.current, connected }.

Step 7 — Create src/hooks/useSocketEvent.ts
  Generic hook: useSocketEvent<T>(socket, event, handler).
  In useEffect: socket.on(event, handler). Cleanup: socket.off(event, handler).
  Typed with unknown[] cast to satisfy the socket.io overload.

Step 8 — Create src/app/globals.css
  @import "tailwindcss";  (Tailwind CSS 4 syntax — no @tailwind directives)

Step 9 — Create src/app/layout.tsx
  Simple root layout. Import globals.css.
  No special providers needed — socket is created inside the chat page hook.

Step 10 — Create src/app/page.tsx (lobby)
  Controlled inputs for name and roomId.
  On submit: router.push('/chat?name=...&room=...').
  Disable the submit button until both fields have non-empty trimmed values.

Step 11 — Create src/app/chat/page.tsx
  Wrap the real component in <Suspense> because useSearchParams() requires it in Next.js.
  Inside ChatRoom:
    Read name and room from useSearchParams().
    Call useSocket() to get socket and connected.
    useState for messages (Message[]), roomUsers (RoomUser[]), text (string), typingMsg (string).
    useRef for bottomRef (auto-scroll), typingTimer (debounce), hasJoined (prevent double join).
    useEffect: redirect to / if name or room missing.
    useEffect: emit 'join-room' once socket is connected (guard with hasJoined.current).
    Define stable callbacks with useCallback for all socket event handlers.
    Call useSocketEvent for each event (new-message, room-users, user-joined, user-left, typing-update).
    useEffect to scroll bottomRef into view whenever messages changes.
    handleInputChange: update text state + emit 'typing' true + debounce to emit 'typing' false after 2s.
    handleSend: emit 'send-message', clear typing timer, emit 'typing' false, clear text.
    Render: sidebar (room name + user list + connection status) + main area (messages + input form).
    Own messages (socket.id === msg.socketId): right-aligned blue bubble.
    Others' messages: left-aligned gray bubble with sender name above.
    System messages (socketId === 'system'): centered pill.
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
