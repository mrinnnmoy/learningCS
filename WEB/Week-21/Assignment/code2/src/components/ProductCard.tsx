import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <article aria-label={product.title}>
      <h3>{product.title}</h3>
      <p data-testid="product-price">${product.price.toFixed(2)}</p>
      <span data-testid="product-category">{product.category}</span>
      {isOutOfStock && <span data-testid="sold-out-badge">Sold out</span>}
      <button onClick={() => onAddToCart(product)} disabled={isOutOfStock}>
        Add to cart
      </button>
    </article>
  );
}
