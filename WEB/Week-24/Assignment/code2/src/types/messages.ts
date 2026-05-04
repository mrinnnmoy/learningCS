export interface DrawEvent {
  type: "draw";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  lineWidth: number;
}

export interface ClearEvent {
  type: "clear";
}

export interface UserCountEvent {
  type: "user-count";
  count: number;
}

export type WsMessage = DrawEvent | ClearEvent | UserCountEvent;
