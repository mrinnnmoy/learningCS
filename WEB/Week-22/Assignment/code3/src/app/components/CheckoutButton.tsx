"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkout } from "@/app/actions/cartActions";

export default function CheckoutButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCheckout = (): void => {
    setError("");
    startTransition(async () => {
      const result = await checkout();
      if (result.success) {
        router.push("/dashboard/orders");
      } else {
        setError(result.error ?? "Checkout failed");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleCheckout}
        disabled={isPending}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Placing order..." : "Place Order"}
      </button>
    </div>
  );
}
