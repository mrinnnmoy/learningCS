import { Product } from "../types";

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Laptop Pro",
    price: 999.99,
    category: "electronics",
    stock: 8,
  },
  {
    id: 2,
    name: "Wireless Mouse",
    price: 29.99,
    category: "electronics",
    stock: 45,
  },
  { id: 3, name: "USB-C Hub", price: 49.99, category: "electronics", stock: 7 },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 129.99,
    category: "electronics",
    stock: 22,
  },
  {
    id: 5,
    name: "Running Shoes",
    price: 89.99,
    category: "clothing",
    stock: 60,
  },
  { id: 6, name: "T-Shirt", price: 19.99, category: "clothing", stock: 5 },
  {
    id: 7,
    name: "JavaScript Book",
    price: 39.99,
    category: "books",
    stock: 30,
  },
  { id: 8, name: "Clean Code", price: 44.99, category: "books", stock: 18 },
  { id: 9, name: "Desk Lamp", price: 34.99, category: "home", stock: 9 },
  { id: 10, name: "Coffee Maker", price: 79.99, category: "home", stock: 14 },
];
