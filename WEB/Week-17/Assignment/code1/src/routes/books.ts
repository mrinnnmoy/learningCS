import { Router, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import * as store from "../data/store";
import { NotFoundError } from "../errors/AppError";
import { BookParams, BookQuery, UpdateBookDto } from "../types";

const router = Router();

const CreateBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().min(1, "Author is required").max(100),
  genre: z.string().min(1, "Genre is required"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative"),
  publishedYear: z.number().int().min(1000).max(new Date().getFullYear()),
});

type ValidatedBook = z.infer<typeof CreateBookSchema>;

// POST /api/books
router.post(
  "/",
  validate(CreateBookSchema),
  (req: Request<{}, {}, ValidatedBook>, res: Response): void => {
    const book = store.create(req.body);
    res.status(201).json({ success: true, data: book });
  },
);

// GET /api/books
router.get("/", (req: Request<{}, {}, {}, BookQuery>, res: Response): void => {
  const { genre, author } = req.query;
  res.json({ success: true, data: store.getAll({ genre, author }) });
});

// GET /api/books/:id
router.get("/:id", (req: Request<BookParams>, res: Response): void => {
  const book = store.getById(parseInt(req.params.id, 10));
  if (!book) throw new NotFoundError("Book");
  res.json({ success: true, data: book });
});

// PUT /api/books/:id
router.put(
  "/:id",
  (req: Request<BookParams, {}, UpdateBookDto>, res: Response): void => {
    const updated = store.update(parseInt(req.params.id, 10), req.body);
    if (!updated) throw new NotFoundError("Book");
    res.json({ success: true, data: updated });
  },
);

// DELETE /api/books/:id
router.delete("/:id", (req: Request<BookParams>, res: Response): void => {
  const deleted = store.remove(parseInt(req.params.id, 10));
  if (!deleted) throw new NotFoundError("Book");
  res.json({ success: true, message: "Book deleted" });
});

export default router;
