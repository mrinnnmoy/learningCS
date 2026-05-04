"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { WsMessage, DrawEvent } from "@/types/messages";

interface Point {
  x: number;
  y: number;
}

function getPoint(canvas: HTMLCanvasElement, e: React.MouseEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  lineWidth: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.closePath();
}

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(4);
  const [userCount, setUserCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const handleMessage = useCallback((msg: WsMessage) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (msg.type === "draw") {
      drawLine(ctx, msg.x0, msg.y0, msg.x1, msg.y1, msg.color, msg.lineWidth);
    } else if (msg.type === "clear") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (msg.type === "user-count") {
      setUserCount(msg.count);
    }
  }, []);

  const { send } = useWebSocket({
    onMessage: handleMessage,
    onOpen: () => setConnected(true),
    onClose: () => setConnected(false),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width, height } = canvas.parentElement!.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    isDrawing.current = true;
    lastPoint.current = getPoint(canvasRef.current!, e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const curr = getPoint(canvas, e);
    const prev = lastPoint.current;
    drawLine(ctx, prev.x, prev.y, curr.x, curr.y, color, lineWidth);
    const event: DrawEvent = {
      type: "draw",
      x0: prev.x,
      y0: prev.y,
      x1: curr.x,
      y1: curr.y,
      color,
      lineWidth,
    };
    send(event);
    lastPoint.current = curr;
  };

  const handleMouseUp = (): void => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const handleClear = (): void => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    send({ type: "clear" });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-4 flex-shrink-0">
        <span className="text-white font-semibold text-sm">🎨 Whiteboard</span>
        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-xs">Colour</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-xs">Size</label>
          <input
            type="range"
            min={1}
            max={40}
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
            className="w-24"
          />
          <span className="text-slate-400 text-xs w-6">{lineWidth}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span
            className={`flex items-center gap-1.5 text-xs ${connected ? "text-green-400" : "text-red-400"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
            />
            {connected ? `${userCount} online` : "Reconnecting..."}
          </span>
          <button
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 w-full h-full"
          style={{ background: "#1e1e2e" }}
        />
      </div>
    </div>
  );
}
