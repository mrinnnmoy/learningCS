import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <span className="text-6xl">🔍</span>
      <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
      <p className="text-slate-500">
        The product you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/products"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Back to Products
      </Link>
    </div>
  );
}
