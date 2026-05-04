"use client";

import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useSocketEvent<T>(
  socket: Socket | null,
  event: string,
  handler: (data: T) => void,
): void {
  useEffect(() => {
    if (!socket) return;
    socket.on(event as string, handler as (...args: unknown[]) => void);
    return () => {
      socket.off(event as string, handler as (...args: unknown[]) => void);
    };
  }, [socket, event, handler]);
}
