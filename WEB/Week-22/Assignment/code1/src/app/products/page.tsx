import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  rating: number;
}

interface ProductListResponse {
  products: Product[];
  total: number;
}

// ISR — revalidate the products list every 60 seconds
export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  const res = await fetch("https://dummyjson.com/products?limit=12", {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data: ProductListResponse = await res.json();
  return data.products;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: Product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
          >
            <div className="relative aspect-square">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-slate-900 text-sm line-clamp-2">
                {product.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{product.category}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-blue-600 font-bold">
                  ${product.price}
                </span>
                <span className="text-xs text-slate-400">
                  ⭐ {product.rating}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
