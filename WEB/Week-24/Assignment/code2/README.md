# How to Build.

```
Step 1 — Initialise Next.js app
  npx create-next-app@latest code2 --typescript --tailwind --eslint --app --src-dir
  cd code2
  npm install
  (No socket.io — this assignment uses the native WebSocket API)

Step 2 — Set up the ws-server
  mkdir ws-server && cd ws-server
  npm init -y
  npm install ws tsx
  npm install --save-dev @types/ws @types/node typescript
  Create tsconfig.json: target ES2020, module CommonJS, moduleResolution node.

Step 3 — Write ws-server/server.ts
  Create an http.createServer and attach WebSocketServer to it.
  Extend WebSocket with isAlive: boolean for heartbeat tracking.
  broadcast(data, exclude?): iterate wss.clients, send to all except exclude.
  broadcastUserCount(): send { type:'user-count', count: wss.clients.size } to all.
  On 'connection': set ws.isAlive = true, call broadcastUserCount(),
    attach 'pong' handler that sets ws.isAlive = true.
  On 'message': parse rawData.toString() as JSON (drop if invalid), call broadcast(text, ws).
  On 'close': call broadcastUserCount().
  Heartbeat interval (30s): iterate clients, terminate if isAlive is false,
    otherwise set isAlive = false and call ws.ping().
  On wss 'close': clearInterval(heartbeat).
  httpServer.listen(3001).

Step 4 — Define src/types/messages.ts
  DrawEvent: { type:'draw'; x0,y0,x1,y1: number; color: string; lineWidth: number }
  ClearEvent: { type:'clear' }
  UserCountEvent: { type:'user-count'; count: number }
  WsMessage = DrawEvent | ClearEvent | UserCountEvent (discriminated union)

Step 5 — Create src/hooks/useWebSocket.ts
  Accept { onMessage, onOpen, onClose } options.
  Track WebSocket instance in wsRef, retry delay in retryDelay (starts 1000ms), mounted flag.
  connect() function: create new WebSocket(WS_URL).
    onopen: reset retryDelay to 1000, call onOpen?.().
    onmessage: JSON.parse event.data, call onMessage(parsed).
    onclose: call onClose?.(), schedule reconnect via setTimeout with current retryDelay,
      double retryDelay (capped at 30_000ms), call connect() again.
    onerror: call ws.close() to trigger onclose and reconnect.
  In useEffect: set mounted = true, call connect(). Cleanup: set mounted = false,
    clearTimeout(retryTimer), wsRef.current?.close().
  Return { send } where send(data) calls wsRef.current.send(JSON.stringify(data))
    only if readyState === WebSocket.OPEN.

Step 6 — Create src/app/globals.css
  @import "tailwindcss";

Step 7 — Create src/app/layout.tsx and src/app/page.tsx
  layout.tsx: dark background (bg-slate-900).
  page.tsx: static landing page with a Link to /whiteboard.

Step 8 — Create src/app/whiteboard/page.tsx
  Single <canvas> ref (canvasRef). Track isDrawing and lastPoint in refs (not state —
    no re-render needed for these).
  useState for color ('#ffffff'), lineWidth (4), userCount (0), connected (false).
  handleMessage callback (stable with useCallback):
    'draw': call drawLine(ctx, ...) with the received coordinates.
    'clear': ctx.clearRect(0, 0, width, height).
    'user-count': setUserCount(msg.count).
  Call useWebSocket with handleMessage, onOpen sets connected true, onClose sets false.
  Canvas resize useEffect: read parentElement.getBoundingClientRect(), set canvas.width/height.
    Add window resize event listener. Clean up on unmount.
  getPoint(canvas, e): convert mouse clientX/Y to canvas coordinates accounting for
    the scaling ratio (canvas.width / rect.width).
  drawLine(ctx, x0, y0, x1, y1, color, lineWidth): beginPath, moveTo, lineTo,
    set strokeStyle/lineWidth/lineCap/lineJoin, stroke, closePath.
  handleMouseDown: set isDrawing = true, set lastPoint.
  handleMouseMove: if not drawing, return. Call drawLine locally with prev/curr points.
    Build a DrawEvent and call send(event). Update lastPoint.
  handleMouseUp / onMouseLeave: set isDrawing = false, lastPoint = null.
  handleClear: clearRect locally, call send({ type:'clear' }).
  Render: toolbar (colour picker, range slider, user count badge, Clear button)
    + canvas filling the remaining height.
```

--

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
