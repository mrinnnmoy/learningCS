"use client";

import { useTransition } from "react";
import { updateCartItem, removeFromCart } from "@/app/actions/cartActions";

interface CartItemRowProps {
  item: {
    id: number;
    quantity: number;
    product: { id: number; name: string; price: number; image: string };
  };
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center gap-4 py-4 border-b border-slate-100 ${isPending ? "opacity-50" : ""}`}
    >
      <div className="flex-1">
        <p className="font-medium text-slate-900">{item.product.name}</p>
        <p className="text-sm text-slate-400">
          ${item.product.price.toFixed(2)} each
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            startTransition(() => updateCartItem(item.id, item.quantity - 1))
          }
          disabled={isPending}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() =>
            startTransition(() => updateCartItem(item.id, item.quantity + 1))
          }
          disabled={isPending}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
        >
          +
        </button>
      </div>

      <p className="font-semibold text-slate-900 w-20 text-right">
        ${(item.product.price * item.quantity).toFixed(2)}
      </p>

      <button
        onClick={() => startTransition(() => removeFromCart(item.id))}
        disabled={isPending}
        className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
        aria-label="Remove item"
      >
        ×
      </button>
    </div>
  );
}
