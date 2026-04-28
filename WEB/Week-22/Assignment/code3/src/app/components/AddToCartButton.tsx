"use client";

import { useTransition } from "react";
import { addToCart } from "@/app/actions/cartActions";

export default function AddToCartButton({ productId }: { productId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => addToCart(productId, 1))}
      disabled={isPending}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? "Adding..." : "Add to Cart"}
    </button>
  );
}
