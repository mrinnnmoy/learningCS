import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`https://dummyjson.com/products/${id}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json() as Promise<Product>;
}

// Dynamic metadata — fetches the product to build the page title
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.title} — NextShop`,
    description: product.description,
    openGraph: {
      title: product.title,
      images: [product.thumbnail],
    },
  };
}

// Pre-render the first 12 products at build time
export async function generateStaticParams() {
  const res = await fetch("https://dummyjson.com/products?limit=12");
  const data = (await res.json()) as { products: { id: number }[] };
  return data.products.map((p) => ({ id: String(p.id) }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/products"
        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 mb-6"
      >
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {product.title}
            </h1>
            {product.brand && (
              <p className="text-sm text-slate-400 mt-1">by {product.brand}</p>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-blue-600">
              ${product.price}
            </span>
            <span className="text-sm text-slate-400">⭐ {product.rating}</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                product.stock > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <button className="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
