import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/app/components/AddToCartButton";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { id: true } });
  return products.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — NextStore`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });
  if (!product) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/products"
        className="text-blue-500 hover:text-blue-700 mb-6 block"
      >
        ← Back to Products
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-8xl">
          🛍️
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {product.name}
            </h1>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-full ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
          {product.stock > 0 ? (
            <AddToCartButton productId={product.id} />
          ) : (
            <button
              disabled
              className="w-full bg-slate-200 text-slate-400 py-3 rounded-xl font-medium cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
