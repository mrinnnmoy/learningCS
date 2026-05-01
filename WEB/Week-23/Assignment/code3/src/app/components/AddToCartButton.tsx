"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";

type CartItem = inferRouterOutputs<AppRouter>["cart"]["getCart"][number];

export default function AddToCartButton({ productId }: { productId: number }) {
  const utils = trpc.useUtils();
  const [added, setAdded] = useState(false);

  const addToCart = trpc.cart.addItem.useMutation({
    // Optimistic update — add to cart immediately before server confirms
    onMutate: async ({ productId, quantity }) => {
      await utils.cart.getCart.cancel();
      const previousCart = utils.cart.getCart.getData();

      utils.cart.getCart.setData(undefined, (old) => {
        if (!old) return old;
        const existing = old.find((i) => i.productId === productId);
        if (existing) {
          return old.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + (quantity ?? 1) }
              : i,
          );
        }
        // We don't have full product data here — the optimistic item is simplified
        return old;
      });

      return { previousCart };
    },

    onError: (_err, _vars, context) => {
      // Roll back on error
      if (context?.previousCart) {
        utils.cart.getCart.setData(undefined, context.previousCart);
      }
    },

    onSettled: () => {
      utils.cart.getCart.invalidate();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    },
  });

  return (
    <button
      onClick={() => addToCart.mutate({ productId, quantity: 1 })}
      disabled={addToCart.isPending}
      className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-colors"
    >
      {addToCart.isPending
        ? "Adding..."
        : added
          ? "✓ Added to cart"
          : "Add to Cart"}
    </button>
  );
}
