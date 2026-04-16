import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { NotFoundError, ForbiddenError } from "../errors/AppError";
import { PostQuery, IdParam } from "../types";

const router = Router();

const PostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required"),
});

type PostDto = z.infer<typeof PostSchema>;

const authorSelect = { select: { id: true, name: true, email: true } } as const;

// POST /api/posts
router.post(
  "/",
  authenticate,
  validate(PostSchema),
  async (
    req: Request<{}, {}, PostDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const post = await prisma.post.create({
        data: {
          title: req.body.title,
          body: req.body.body,
          authorId: req.user!.userId,
        },
        include: { author: authorSelect },
      });
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/posts
router.get(
  "/",
  async (
    req: Request<{}, {}, {}, PostQuery>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { search } = req.query;
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          ...(search && { title: { contains: search, mode: "insensitive" } }),
        },
        include: { author: authorSelect },
        orderBy: { createdAt: "desc" },
      });
      res.json({ success: true, data: posts });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/posts/:id
router.get(
  "/:id",
  async (
    req: Request<IdParam>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const post = await prisma.post.update({
        where: { id: parseInt(req.params.id, 10) },
        data: { views: { increment: 1 } },
        include: { author: authorSelect },
      });
      res.json({ success: true, data: post });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        next(new NotFoundError("Post"));
        return;
      }
      next(err);
    }
  },
);

// PATCH /api/posts/:id/publish
router.patch(
  "/:id/publish",
  authenticate,
  async (
    req: Request<IdParam>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) throw new NotFoundError("Post");
      if (post.authorId !== req.user!.userId)
        throw new ForbiddenError("You can only publish your own posts");
      const updated = await prisma.post.update({
        where: { id },
        data: { published: !post.published },
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/posts/:id
router.delete(
  "/:id",
  authenticate,
  async (
    req: Request<IdParam>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) throw new NotFoundError("Post");
      if (post.authorId !== req.user!.userId)
        throw new ForbiddenError("You can only delete your own posts");
      await prisma.post.delete({ where: { id } });
      res.json({ success: true, message: "Post deleted" });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
