import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProductList from "./ProductList";
import { Product } from "../types";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const fakeProducts: Product[] = [
  { id: 1, title: "Laptop", price: 999, category: "electronics", stock: 10 },
  { id: 2, title: "Phone", price: 599, category: "electronics", stock: 0 },
  { id: 3, title: "T-Shirt", price: 29, category: "clothing", stock: 50 },
];

describe("ProductList", () => {
  beforeEach(() => mockFetch.mockClear());

  it("shows a loading state initially", () => {
    // Mock that never resolves — keeps component in loading state
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => new Promise(() => {}),
    });

    render(<ProductList />);

    expect(screen.getByLabelText("loading")).toBeInTheDocument();
    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("renders a product card for each product after a successful fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeProducts),
    });

    render(<ProductList />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Laptop" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Phone" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "T-Shirt" }),
      ).toBeInTheDocument();
    });

    // Loading indicator should be gone
    expect(screen.queryByLabelText("loading")).not.toBeInTheDocument();
  });

  it("shows an error message when the fetch fails with a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to load products"));

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to load products",
      );
    });
  });

  it("shows an error message when the server returns a non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to load products",
      );
    });
  });

  it("shows the sold out state correctly for a product with 0 stock", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeProducts),
    });

    render(<ProductList />);

    await waitFor(() => {
      // Phone has stock: 0 — should show sold out badge and disabled button
      expect(screen.getByTestId("sold-out-badge")).toBeInTheDocument();
    });

    // All "Add to cart" buttons for in-stock products should be enabled
    const buttons = screen.getAllByRole("button", { name: "Add to cart" });
    // 3 products, 2 in stock (laptop and t-shirt enabled, phone disabled)
    const enabledButtons = buttons.filter((b) => !b.hasAttribute("disabled"));
    const disabledButtons = buttons.filter((b) => b.hasAttribute("disabled"));
    expect(enabledButtons).toHaveLength(2);
    expect(disabledButtons).toHaveLength(1);
  });

  it("makes a fetch request to /api/products on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<ProductList />);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(mockFetch).toHaveBeenCalledWith("/api/products");
  });
});
