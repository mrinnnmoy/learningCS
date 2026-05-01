// Server Component — calls tRPC directly, no HTTP request
import Link from "next/link";
import { serverTrpc } from "@/lib/trpc/server";

export default async function HomePage() {
  // Direct call — runs on the server, no fetch() round-trip
  const products = await serverTrpc.product.getAll();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Products</h1>
      {products.length === 0 ? (
        <p className="text-slate-400">No products yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="text-5xl mb-3">🛍️</div>
              <h2 className="font-semibold text-slate-900">{product.name}</h2>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-blue-600 font-bold">
                  ${product.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
