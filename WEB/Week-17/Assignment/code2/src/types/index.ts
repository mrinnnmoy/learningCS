declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface JwtPayload {
  userId: number;
  role: "USER" | "ADMIN";
  iat: number;
  exp: number;
}

export interface PostQuery {
  search?: string;
}

export interface IdParam {
  id: string;
}

export {};
