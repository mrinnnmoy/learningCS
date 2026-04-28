import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import CartItemRow from "@/app/components/CartItemRow";
import CheckoutButton from "@/app/components/CheckoutButton";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = parseInt((session.user as { id: string }).id);

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true }, orderBy: { id: "asc" } } },
  });

  const items = cart?.items ?? [];
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
          <p className="text-lg">Your cart is empty.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}

          <div className="flex items-center justify-between pt-6 mt-2 border-t border-slate-100">
            <div>
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-2xl font-bold text-slate-900">
                ${total.toFixed(2)}
              </p>
            </div>
            <CheckoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
