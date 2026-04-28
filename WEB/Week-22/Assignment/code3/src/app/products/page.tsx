import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Products</h1>
      {products.length === 0 ? (
        <p className="text-slate-400">
          No products yet. Seed the database to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-square bg-slate-100 flex items-center justify-center text-4xl">
                🛍️
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-slate-900 text-sm">
                  {p.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">{p.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-600 font-bold">
                    ${p.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {p.stock > 0 ? `${p.stock} left` : "Out of stock"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
