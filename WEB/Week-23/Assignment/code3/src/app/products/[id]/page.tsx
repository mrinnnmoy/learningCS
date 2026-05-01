import { notFound } from "next/navigation";
import { serverTrpc } from "@/lib/trpc/server";
import Link from "next/link";
import AddToCartButton from "@/app/components/AddToCartButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  let product;
  try {
    product = await serverTrpc.product.getById({ id: parseInt(id, 10) });
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="text-blue-500 hover:text-blue-700 text-sm mb-6 block"
      >
        ← Back
      </Link>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="text-7xl mb-4">🛍️</div>
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
        <p className="text-slate-500 mt-2">{product.description}</p>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-3xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <span
            className={`text-sm px-2 py-1 rounded-full ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
        {product.stock > 0 && <AddToCartButton productId={product.id} />}
      </div>
    </div>
  );
}
