import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { NotFoundError } from "../errors/AppError";

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type RegisterDto = z.infer<typeof RegisterSchema>;
type LoginDto = z.infer<typeof LoginSchema>;

// POST /api/auth/register
router.post(
  "/register",
  validate(RegisterSchema),
  async (
    req: Request<{}, {}, RegisterDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await prisma.user.create({
        data: {
          email: req.body.email,
          name: req.body.name,
          password: await bcrypt.hash(req.body.password, 12),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        res
          .status(409)
          .json({ success: false, message: "Email already in use" });
        return;
      }
      next(err);
    }
  },
);

// POST /api/auth/login
router.post(
  "/login",
  validate(LoginSchema),
  async (
    req: Request<{}, {}, LoginDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
        return;
      }
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "15m", algorithm: "HS256" },
      );
      res.json({ success: true, data: { accessToken } });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/auth/me
router.get(
  "/me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      if (!user) throw new NotFoundError("User");
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
