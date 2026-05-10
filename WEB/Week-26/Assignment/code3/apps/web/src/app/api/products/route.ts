import { NextResponse } from "next/server";
import type { Product } from "@acme/types";

// Mock data — in a real app this would query Prisma
const products: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "Premium sound quality with ANC",
    price: 299.99,
    category: "Electronics",
    stock: 42,
    createdAt: "2025-01-10T00:00:00Z",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    description: "Tactile switches, RGB backlit",
    price: 149.99,
    category: "Electronics",
    stock: 17,
    createdAt: "2025-02-03T00:00:00Z",
  },
  {
    id: 3,
    name: "Ergonomic Mouse",
    description: "Vertical design, 12000 DPI",
    price: 89.99,
    category: "Electronics",
    stock: 8,
    createdAt: "2025-03-15T00:00:00Z",
  },
  {
    id: 4,
    name: "USB-C Hub",
    description: "7-in-1 multiport adapter",
    price: 49.99,
    category: "Accessories",
    stock: 56,
    createdAt: "2025-04-22T00:00:00Z",
  },
];

export function GET() {
  return NextResponse.json(products);
}
