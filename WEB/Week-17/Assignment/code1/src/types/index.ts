export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  price: number;
  publishedYear: number;
  createdAt: Date;
}

// Omit removes 'id' and 'createdAt' — the server sets those, not the client
export type CreateBookDto = Omit<Book, "id" | "createdAt">;

// Partial makes all fields optional — used for updates
export type UpdateBookDto = Partial<CreateBookDto>;

// Typed query parameters for GET /api/books
export interface BookQuery {
  genre?: string;
  author?: string;
}

// Typed route parameters for /api/books/:id
export interface BookParams {
  id: string;
}
