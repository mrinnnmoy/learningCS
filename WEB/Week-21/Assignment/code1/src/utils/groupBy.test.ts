import { describe, it, expect } from "vitest";
import { groupBy } from "./groupBy";

interface Product {
  id: number;
  name: string;
  category: string;
}

describe("groupBy", () => {
  const products: Product[] = [
    { id: 1, name: "Laptop", category: "electronics" },
    { id: 2, name: "Phone", category: "electronics" },
    { id: 3, name: "T-Shirt", category: "clothing" },
    { id: 4, name: "JS Book", category: "books" },
    { id: 5, name: "Running Shoes", category: "clothing" },
  ];

  it("groups items by the specified key", () => {
    const result = groupBy(products, (p) => p.category);
    expect(result["electronics"]).toHaveLength(2);
    expect(result["clothing"]).toHaveLength(2);
    expect(result["books"]).toHaveLength(1);
  });

  it("each group contains the correct items", () => {
    const result = groupBy(products, (p) => p.category);
    expect(result["electronics"].map((p) => p.name)).toEqual([
      "Laptop",
      "Phone",
    ]);
  });

  it("returns an empty object for an empty array", () => {
    expect(groupBy([], (x: Product) => x.category)).toEqual({});
  });

  it("handles all items having the same key", () => {
    const items = [
      { id: 1, name: "A", category: "same" },
      { id: 2, name: "B", category: "same" },
    ];
    const result = groupBy(items, (i) => i.category);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result["same"]).toHaveLength(2);
  });

  it("works with a numeric key converted to string", () => {
    const nums = [1, 2, 3, 4, 5, 6];
    const result = groupBy(nums, (n) => (n % 2 === 0 ? "even" : "odd"));
    expect(result["even"]).toEqual([2, 4, 6]);
    expect(result["odd"]).toEqual([1, 3, 5]);
  });
});
