import { Book, CreateBookDto, UpdateBookDto } from "../types";

let books: Book[] = [
  {
    id: 1,
    title: "The Pragmatic Programmer",
    author: "Dave Thomas",
    genre: "programming",
    price: 49.99,
    publishedYear: 1999,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "programming",
    price: 44.99,
    publishedYear: 2008,
    createdAt: new Date("2024-01-02"),
  },
  {
    id: 3,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "fantasy",
    price: 14.99,
    publishedYear: 1937,
    createdAt: new Date("2024-01-03"),
  },
];
let nextId = 4;

export const getAll = (filters: { genre?: string; author?: string }): Book[] =>
  books.filter((b) => {
    if (filters.genre && b.genre.toLowerCase() !== filters.genre.toLowerCase())
      return false;
    if (
      filters.author &&
      !b.author.toLowerCase().includes(filters.author.toLowerCase())
    )
      return false;
    return true;
  });

export const getById = (id: number): Book | undefined =>
  books.find((b) => b.id === id);

export const create = (data: CreateBookDto): Book => {
  const book: Book = { id: nextId++, ...data, createdAt: new Date() };
  books.push(book);
  return book;
};

export const update = (id: number, data: UpdateBookDto): Book | undefined => {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return undefined;
  books[index] = { ...books[index], ...data };
  return books[index];
};

export const remove = (id: number): boolean => {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return false;
  books.splice(index, 1);
  return true;
};
