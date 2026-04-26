import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard from "./ProductCard";
import { Product } from "../types";

const mockProduct: Product = {
  id: 1,
  title: "Laptop Pro",
  price: 999.99,
  category: "electronics",
  stock: 10,
};

const outOfStockProduct: Product = { ...mockProduct, stock: 0 };

describe("ProductCard", () => {
  it("renders the product title and price", () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "Laptop Pro" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("product-price")).toHaveTextContent("$999.99");
  });

  it("renders the category badge", () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);
    expect(screen.getByTestId("product-category")).toHaveTextContent(
      "electronics",
    );
  });

  it("calls onAddToCart with the product when the button is clicked", async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("does not show the sold out badge when stock is available", () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);
    expect(screen.queryByTestId("sold-out-badge")).not.toBeInTheDocument();
  });

  it("shows the sold out badge when stock is 0", () => {
    render(<ProductCard product={outOfStockProduct} onAddToCart={() => {}} />);
    expect(screen.getByTestId("sold-out-badge")).toBeInTheDocument();
  });

  it("disables the Add to cart button when stock is 0", () => {
    render(<ProductCard product={outOfStockProduct} onAddToCart={() => {}} />);
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeDisabled();
  });

  it("does not call onAddToCart when the button is disabled", async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductCard product={outOfStockProduct} onAddToCart={onAddToCart} />,
    );
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(onAddToCart).not.toHaveBeenCalled();
  });
});
