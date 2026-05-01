"use client";

import { useTransition } from "react";
import { trpc } from "@/lib/trpc/client";

interface Props {
  item: {
    productId: number;
    quantity: number;
    product: { name: string; price: number };
  };
}

export default function CartItemRow({ item }: Props) {
  const utils = trpc.useUtils();
  const [isPending, startTransition] = useTransition();

  const updateItem = trpc.cart.updateItem.useMutation({
    onMutate: async ({ productId, quantity }) => {
      await utils.cart.getCart.cancel();
      const prev = utils.cart.getCart.getData();
      utils.cart.getCart.setData(undefined, (old) => {
        if (!old) return old;
        if (quantity === 0) return old.filter((i) => i.productId !== productId);
        return old.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        );
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.cart.getCart.setData(undefined, ctx.prev);
    },
    onSettled: () => utils.cart.getCart.invalidate(),
  });

  return (
    <div
      className={`flex items-center gap-4 py-3 border-b border-slate-100 ${isPending ? "opacity-50" : ""}`}
    >
      <div className="flex-1">
        <p className="font-medium text-slate-900 text-sm">
          {item.product.name}
        </p>
        <p className="text-blue-600 text-sm font-bold">
          ${(item.product.price * item.quantity).toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            updateItem.mutate({
              productId: item.productId,
              quantity: item.quantity - 1,
            })
          }
          disabled={updateItem.isPending}
          className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <button
          onClick={() =>
            updateItem.mutate({
              productId: item.productId,
              quantity: item.quantity + 1,
            })
          }
          disabled={updateItem.isPending}
          className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        onClick={() =>
          updateItem.mutate({ productId: item.productId, quantity: 0 })
        }
        disabled={updateItem.isPending}
        className="text-red-400 hover:text-red-600 text-lg disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}
