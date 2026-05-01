"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import CartItemRow from "@/app/components/CartItemRow";

export default function CartPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: cartItems, isLoading } = trpc.cart.getCart.useQuery(undefined, {
    retry: false,
  });

  const checkout = trpc.order.checkout.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      router.push("/orders");
    },
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => utils.cart.getCart.invalidate(),
  });

  if (isLoading) return <p className="text-slate-400">Loading cart...</p>;

  const total = (cartItems ?? []).reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

      {!cartItems || cartItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
          <p>Cart is empty.</p>
          <Link
            href="/"
            className="text-blue-500 hover:underline text-sm mt-2 block"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          {cartItems.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
            <div>
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-2xl font-bold text-slate-900">
                ${total.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => clearCart.mutate()}
                disabled={clearCart.isPending}
                className="px-4 py-2 text-sm text-slate-400 hover:text-red-500 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors"
              >
                {checkout.isPending ? "Placing order..." : "Place Order"}
              </button>
            </div>
          </div>
          {checkout.error && (
            <p className="text-red-500 text-sm mt-2">
              {checkout.error.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
