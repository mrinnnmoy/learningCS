import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = parseInt((session.user as { id: string }).id);

  const [orderCount, cart] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    }),
  ]);

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Welcome back, {session.user.name}!
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: orderCount },
          { label: "Items in Cart", value: cartCount },
          { label: "Account Email", value: session.user.email ?? "" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
          >
            <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
