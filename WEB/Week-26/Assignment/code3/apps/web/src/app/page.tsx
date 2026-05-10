import { Badge, Button, Card } from "@acme/ui";
import { formatCurrency } from "@acme/utils";
import type { Product } from "@acme/types";

// Server Component — fetch at request time (Next.js 16 default)
async function getProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<Product[]>;
}

function stockBadgeVariant(stock: number): "success" | "warning" | "danger" {
  if (stock > 20) return "success";
  if (stock > 5) return "warning";
  return "danger";
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Products</h1>
        <p className="text-slate-500 mt-1">
          Components from{" "}
          <code className="bg-slate-100 px-1 rounded text-sm">@acme/ui</code>,
          types from{" "}
          <code className="bg-slate-100 px-1 rounded text-sm">@acme/types</code>
          , utils from{" "}
          <code className="bg-slate-100 px-1 rounded text-sm">@acme/utils</code>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            description={product.description}
            footer={
              <div className="flex items-center justify-between">
                <Badge
                  label={
                    product.stock > 0 ? `${product.stock} left` : "Out of stock"
                  }
                  variant={stockBadgeVariant(product.stock)}
                />
                <Button
                  size="sm"
                  variant="primary"
                  disabled={product.stock === 0}
                >
                  Add to cart
                </Button>
              </div>
            }
          >
            <div className="mt-2">
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {product.category}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
