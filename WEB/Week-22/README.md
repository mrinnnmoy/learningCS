# List of things learned.

## 1. What is Next.js & Why Use It.

Next.js is a **React framework** built by Vercel.

Where plain React gives you a component model and a rendering engine, Next.js gives you everything else a production web application needs:

- routing,
- server-side rendering,
- static generation,
- image optimisation,
- API routes and
- a deployment model.

All configured and working out of the box.

```
Plain React (Vite/CRA)             Next.js
──────────────────────────         ──────────────────────────────────
You wire up React Router           File-based routing built in
No server — client renders only    Server Components, SSR, SSG, ISR
You build your own API             API Routes / Route Handlers built in
SEO requires extra work            Pages pre-rendered — great for SEO
No image optimisation              <Image> component handles it
Manual code splitting              Automatic per-page code splitting
You configure everything           Sensible defaults, zero config
```

### The App Router vs the Pages Router.

Next.js has two routing systems.

The **App Router** (introduced in Next.js 13, stable in 14) is the current standard and what all new projects should use.

The older **Pages Router** is still supported but is not covered here.

```
App Router (Next.js 13+)          Pages Router (legacy)
──────────────────────────        ──────────────────────
app/ directory                    pages/ directory
React Server Components           All components are client components
Layouts with nested routing       _app.tsx for global layout
fetch() built-in caching          getStaticProps / getServerSideProps
Server Actions for mutations      API routes in pages/api/
Streaming and Suspense            No streaming
```

### Installation and Project Structure.

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
cd my-app
npm run dev
```

```
my-app/
├── src/
│   └── app/                    ← App Router root
│       ├── layout.tsx          ← Root layout (wraps every page)
│       ├── page.tsx            ← Homepage — renders at /
│       ├── globals.css
│       ├── about/
│       │   └── page.tsx        ← Renders at /about
│       ├── blog/
│       │   ├── page.tsx        ← Renders at /blog
│       │   └── [slug]/
│       │       └── page.tsx    ← Renders at /blog/:slug
│       └── api/
│           └── products/
│               └── route.ts    ← API route at /api/products
├── public/                     ← Static files served at /
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. File-Based Routing.

In Next.js, the **file system is the router**.

Every `page.tsx` file inside `app/` becomes a URL.

You never write `<Route path="...">` — the folder structure is the route definition.

### Special Files.

```
page.tsx        The UI for a route. Required to make a segment publicly accessible.
layout.tsx      Wraps page.tsx and all child routes. Persists across navigations.
loading.tsx     Shown instantly while page.tsx is loading (uses React Suspense).
error.tsx       Shown when an error is thrown anywhere in the segment.
not-found.tsx   Shown when notFound() is called or no route matches.
route.ts        API endpoint — no UI. Handles HTTP methods (GET, POST, etc.).
```

### Static Routes.

```
app/page.tsx              →  /
app/about/page.tsx        →  /about
app/blog/page.tsx         →  /blog
app/dashboard/page.tsx    →  /dashboard
```

### Dynamic Routes.

```tsx
// app/products/[id]/page.tsx
// Matches: /products/1, /products/abc, /products/any-value

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params; // Next.js 15: params is a Promise
  return <h1>Product {id}</h1>;
}
```

### Catch-All Routes.

```
app/docs/[...slug]/page.tsx   →  /docs/a, /docs/a/b, /docs/a/b/c
app/docs/[[...slug]]/page.tsx →  /docs (optional — also matches /docs with no slug)
```

```tsx
// app/docs/[...slug]/page.tsx
interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  // /docs/getting/started → slug = ['getting', 'started']
  return <h1>{slug.join(" / ")}</h1>;
}
```

### Route Groups.

Wrap a folder in `(parentheses)` to group routes logically without affecting the URL.

```
app/
├── (marketing)/
│   ├── layout.tsx         ← layout only for marketing pages
│   ├── page.tsx           →  /
│   └── about/page.tsx     →  /about
└── (dashboard)/
    ├── layout.tsx         ← separate layout for dashboard
    └── dashboard/page.tsx →  /dashboard

The (marketing) and (dashboard) folders do NOT appear in the URL.
```

### Layouts.

```tsx
// app/layout.tsx — root layout, wraps EVERY page in the application
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>My Navbar</header>
        <main>{children}</main>
        <footer>My Footer</footer>
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx — nested layout, wraps only dashboard pages
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex" }}>
      <aside>Sidebar</aside>
      <section>{children}</section>
    </div>
  );
}
// This layout stacks inside RootLayout — both render simultaneously.
// Navigating between /dashboard/orders and /dashboard/settings does NOT
// remount DashboardLayout — only the inner page changes.
```

### Navigation.

```tsx
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Link — declarative navigation, prefetches on hover
<Link href="/about">About</Link>
<Link href={`/products/${id}`}>Product</Link>

// Active link pattern
'use client';
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  return (
    <Link href={href} className={pathname === href ? 'active' : ''}>
      {label}
    </Link>
  );
}

// useRouter — programmatic navigation (Client Components only)
'use client';
function LoginButton() {
  const router = useRouter();
  return <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>;
}
// router.push('/path')        — navigate and add to history
// router.replace('/path')     — navigate without adding to history
// router.back()               — go back
// router.refresh()            — re-render the current page (re-fetches Server Component data)
```

### `loading.tsx` and `error.tsx`.

```tsx
// app/products/loading.tsx — shown immediately while page.tsx awaits async data
export default function Loading() {
  return (
    <div>
      <div className="animate-pulse bg-gray-200 h-8 w-48 rounded mb-4" />
      <div className="animate-pulse bg-gray-200 h-64 w-full rounded" />
    </div>
  );
}

// app/products/error.tsx — must be a Client Component
("use client");
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 3. Server Components vs Client Components.

This is the most important mental model in the Next.js App Router.

Every component is a **Server Component by default**. You opt into the client only when you need it.

### Server Components.

```
Run on the server only      — never in the browser.
Can be async                — can await fetch(), database queries, file reads directly.
Have access to server-only resources:       env vars, filesystem, databases.
Reduce bundle size          — their code is never sent to the browser.
Cannot use:                 useState, useEffect, event handlers, browser APIs (window, document).
```

```tsx
// app/products/page.tsx — Server Component (no 'use client' directive)
// This component runs on the server, fetches data, and sends HTML to the browser.
// The fetch and database code never reaches the client JS bundle.

import { db } from "@/lib/db";

interface Product {
  id: number;
  name: string;
  price: number;
}

export default async function ProductsPage() {
  // Direct async/await in the component — no useEffect needed
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <ul>
      {products.map((p: Product) => (
        <li key={p.id}>
          {p.name} — ${p.price}
        </li>
      ))}
    </ul>
  );
}
```

### Client Components.

```
Run in the browser (and are also server-rendered for the initial HTML).
Required for:       state, effects, event listeners, browser APIs.
Declared with 'use client' at the top of the file.
Everything imported by a Client Component also becomes a Client Component.
```

```tsx
"use client";
// app/components/AddToCartButton.tsx

import { useState } from "react";

interface Props {
  productId: number;
  name: string;
}

export default function AddToCartButton({ productId, name }: Props) {
  const [added, setAdded] = useState(false);

  return (
    <button
      onClick={() => {
        addToCart(productId);
        setAdded(true);
      }}
    >
      {added ? "✓ Added" : `Add ${name} to cart`}
    </button>
  );
}
```

### The Composition Pattern.

```
Best practice: keep Server Components as high as possible in the tree.
Push 'use client' as far DOWN as possible — only to the leaf components
that actually need interactivity.

❌ Wrong — turning a whole page into a Client Component just for one button
'use client'; // This makes the ENTIRE page a client component
export default function ProductPage() {
  const [added, setAdded] = useState(false); // only the button needs this
  // ... 100 lines of data fetching, layout, etc. all now run on the client
}

✅ Correct — Server Component page, tiny Client Component button
// page.tsx — Server Component, fetches data on the server
export default async function ProductPage() {
  const product = await fetchProduct(id);
  return (
    <div>
      <h1>{product.name}</h1>            {/* static — stays on server */}
      <p>{product.description}</p>       {/* static — stays on server */}
      <AddToCartButton productId={product.id} /> {/* interactive leaf */}
    </div>
  );
}
```

### Passing Server Data to Client Components.

```tsx
// Server Component — fetches data
export default async function Page() {
  const user = await getUser();

  // Pass serialisable data (strings, numbers, plain objects) as props.
  // You cannot pass functions or class instances from server to client.
  return <UserProfile name={user.name} email={user.email} />;
}

// Client Component — receives the data as props
'use client';
function UserProfile({ name, email }: { name: string; email: string }) {
  const [editing, setEditing] = useState(false);
  return (/* ... */);
}
```

---

## 4. Data Fetching.

### Fetching in Server Components.

The cleanest and most performant pattern. Data is fetched on the server, never exposes API keys to the browser and the page is sent as pre-rendered HTML.

```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  // fetch() in Server Components is extended by Next.js with caching options
  const res = await fetch("https://api.example.com/products", {
    // next.revalidate: how long (seconds) before the cached response is stale
    next: { revalidate: 60 }, // ISR — re-fetch every 60 seconds
  });

  if (!res.ok) throw new Error("Failed to fetch products");

  const products = await res.json();

  return (
    <ul>
      {products.map((p: Product) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Caching Behaviour.

```typescript
// 1. Static (cached forever, until redeployment)
fetch(url, { cache: "force-cache" }); // default behaviour in Next.js 14

// 2. ISR — Incremental Static Regeneration (cached, but re-fetched after N seconds)
fetch(url, { next: { revalidate: 60 } });

// 3. Dynamic (never cached — fetches on every request)
fetch(url, { cache: "no-store" });

// 4. Tag-based revalidation — revalidate specific data on demand
fetch(url, { next: { tags: ["products"] } });
// Then later call: revalidateTag('products') from a Server Action

// Setting dynamic rendering at the route level:
export const dynamic = "force-dynamic"; // never cache this page
export const revalidate = 3600; // revalidate this page every 1 hour
```

### Parallel Data Fetching.

```tsx
// Fetch multiple resources concurrently — not sequentially
export default async function DashboardPage() {
  // ❌ Sequential — waits for users THEN products (slow)
  const users    = await fetchUsers();
  const products = await fetchProducts();

  // ✅ Parallel — both start at the same time
  const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts(),
  ]);

  return (/* render with users and products */);
}
```

### Streaming with Suspense.

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";
import UserStats from "./UserStats"; // slow component
import RecentOrders from "./RecentOrders"; // fast component

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* RecentOrders renders immediately */}
      <Suspense fallback={<p>Loading recent orders...</p>}>
        <RecentOrders />
      </Suspense>

      {/* UserStats streams in when its data is ready, without blocking the page */}
      <Suspense fallback={<p>Loading user stats...</p>}>
        <UserStats />
      </Suspense>
    </div>
  );
}
```

### Fetching in Client Components.

Sometimes you need data fetching on the client, for user-specific data loaded after authentication, or data that changes based on user interaction.

```tsx
"use client";
import { useState, useEffect } from "react";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  return <p>{user?.name}</p>;
}
```

---

## 5. API Routes (Route Handlers).

Route handlers let you build API endpoints directly inside your Next.js project.

They live in `route.ts` files inside `app/api/`.

### Creating a Route Handler.

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";

// Each exported function handles an HTTP method
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const products = await db.product.findMany({
    where: category ? { category } : undefined,
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate
  if (!body.name || !body.price) {
    return NextResponse.json(
      { message: "name and price are required" },
      { status: 400 },
    );
  }

  const product = await db.product.create({ data: body });
  return NextResponse.json(product, { status: 201 });
}
```

### Dynamic Route Handlers.

```typescript
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id: parseInt(id) } });

  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: Context) {
  const { id } = await params;
  const body = await request.json();
  const updated = await db.product.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  await db.product.delete({ where: { id: parseInt(id) } });
  return new NextResponse(null, { status: 204 });
}
```

### Middleware.

```typescript
// middleware.ts — runs before every request that matches the config
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Protect all /dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on these paths
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
```

---

## 6. Server Actions.

Server Actions are async functions that run on the server but can be called directly from Client Components, like form submissions or button clicks. Without writing an API route.

They are declared with the `'use server'` directive.

```typescript
// app/actions/productActions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { z } from "zod";

const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
});

// Server Action — runs on the server, callable from the client
export async function createProduct(formData: FormData) {
  const parsed = CreateProductSchema.safeParse({
    name: formData.get("name"),
    price: parseFloat(formData.get("price") as string),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await db.product.create({ data: parsed.data });

  // Invalidate the products list cache so the page shows fresh data
  revalidatePath("/products");
  revalidateTag("products");

  // Redirect after successful creation
  redirect("/products");
}

export async function deleteProduct(id: number) {
  await db.product.delete({ where: { id } });
  revalidatePath("/products");
}
```

```tsx
// Using a Server Action in a form (no client JS required)
import { createProduct } from "@/app/actions/productActions";

export default function CreateProductForm() {
  return (
    <form action={createProduct}>
      <input name="name" type="text" required placeholder="Product name" />
      <input name="price" type="number" required placeholder="Price" />
      <input name="category" type="text" required placeholder="Category" />
      <button type="submit">Create product</button>
    </form>
  );
}
```

```tsx
// Using a Server Action from a Client Component button
"use client";
import { deleteProduct } from "@/app/actions/productActions";
import { useTransition } from "react";

export default function DeleteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteProduct(id))}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

---

## 7. Metadata and SEO.

### Static Metadata.

```tsx
// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — My Company",
  description: "Learn more about who we are.",
  openGraph: {
    title: "About Us",
    description: "Learn more about who we are.",
    images: ["/og-about.png"],
  },
};

export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

### Dynamic Metadata.

```tsx
// app/products/[id]/page.tsx
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

// generateMetadata runs on the server and can fetch data
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetch(`https://api.example.com/products/${id}`).then(
    (r) => r.json(),
  );

  return {
    title: `${product.name} — My Store`,
    description: product.description,
    openGraph: {
      images: [product.imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);
  return <h1>{product.name}</h1>;
}
```

---

## 8. Next.js Image and Font Optimisation.

### The `<Image>` Component.

```tsx
import Image from 'next/image';

// ✅ Next.js Image — automatic format conversion (WebP/AVIF), lazy loading,
// prevents layout shift, resizes to the requested size
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority        // Load eagerly — use for above-the-fold images only
/>

// Responsive image that fills its container
<div style={{ position: 'relative', height: '400px' }}>
  <Image
    src="/banner.jpg"
    alt="Banner"
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    style={{ objectFit: 'cover' }}
  />
</div>

// Remote images — must whitelist the domain in next.config.ts
<Image
  src="https://dummyjson.com/image/400"
  alt="Remote image"
  width={400}
  height={400}
/>
```

```typescript
// next.config.ts — whitelist remote image domains
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dummyjson.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default config;
```

### Font Optimisation.

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from "next/font/google";

// next/font downloads the font at build time and serves it self-hosted.
// No requests to Google's CDN at runtime — faster and more private.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## 9. Rendering Strategies.

### Static Site Generation (SSG).

```tsx
// The page is rendered at BUILD TIME and cached as static HTML.
// Fastest possible response — served from a CDN.
// Use for: marketing pages, blog posts, documentation.

export default async function BlogPage() {
  const posts = await fetchAllPosts(); // called at build time
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <a href={`/blog/${p.slug}`}>{p.title}</a>
        </li>
      ))}
    </ul>
  );
}

// generateStaticParams tells Next.js which dynamic pages to pre-render at build time
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
  // Next.js will pre-render /blog/intro-to-nextjs, /blog/typescript-tips, etc.
}
```

### Incremental Static Regeneration (ISR).

```tsx
// The page is statically generated at build time, but Next.js re-generates it
// in the background after a set interval. Visitors always get a fast cached page,
// and the cache is quietly refreshed.

export const revalidate = 60; // re-generate this page every 60 seconds

export default async function ProductsPage() {
  const products = await fetchProducts();
  return <ProductGrid products={products} />;
}
```

### Server-Side Rendering (SSR).

```tsx
// The page is rendered fresh on the server for EVERY request.
// Use for: pages that need the latest data on every load, or need
// access to cookies/headers that differ per user.

export const dynamic = "force-dynamic"; // opt out of caching

export default async function UserOrdersPage() {
  const orders = await fetchUserOrders(); // always fresh
  return <OrderList orders={orders} />;
}
```

### Choosing the Right Strategy.

```
Static (SSG)       Marketing, blog, docs, landing pages — content that rarely changes.
ISR                Product listings, news feeds — mostly static but refreshes periodically.
SSR                User dashboards, personalised pages, anything needing cookies/session.
Client-side        Highly interactive UI, real-time data, data only available after login.
```

---

## 10. Authentication with NextAuth.js.

```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    // OAuth provider
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // Email + password provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id.toString(), name: user.name, email: user.email };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

```tsx
// Reading the session in a Server Component
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <h1>Welcome, {session.user?.name}</h1>;
}
```

```tsx
// Reading the session in a Client Component
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (session) {
    return (
      <>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return <button onClick={() => signIn()}>Sign in</button>;
}
```

---

## Assignment.

1. **Static & Dynamic Pages with File-Based Routing.**

   **What you practice:**
   - Creating a Next.js 14 project with the App Router and TypeScript
   - File-based routing — `page.tsx`, nested folders, dynamic `[id]` segments
   - Root `layout.tsx` with a shared `Navbar` using `<Link>` and `usePathname`
   - `loading.tsx` for skeleton placeholders
   - `not-found.tsx` for 404 handling
   - Static metadata export and dynamic `generateMetadata`
   - `<Image>` component with remote domain whitelisting in `next.config.ts`
   - Server Components fetching data with `fetch()` and Next.js caching options

   **Requirements:**
   - Create a Next.js app with these routes:
     - `/` — Homepage: heading, short description, and a "View Products" link.
     - `/products` — Products page: fetch all products from `https://dummyjson.com/products?limit=12`. Render a grid of product cards. Each card links to `/products/[id]`.
     - `/products/[id]` — Product Detail page: fetch a single product from `https://dummyjson.com/products/[id]`. Display the product image (use `<Image>`), title, description, price, and rating. Show a "Back to Products" link.
     - `/about` — About page: static content only, no data fetching.
   - Add a `loading.tsx` in `app/products/` that renders animated skeleton placeholders.
   - Add a `not-found.tsx` in `app/products/[id]/` that shows a friendly message when a product doesn't exist.
   - Add static `metadata` on `/about` and dynamic `generateMetadata` on `/products/[id]`.
   - Whitelist `dummyjson.com` in `next.config.ts` for the `<Image>` component.
   - The shared `Navbar` (in `app/layout.tsx`) must highlight the active link using `usePathname`.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   # 1. Start the dev server
   npm run dev → open http://localhost:3000

   # 2. Homepage
   → Heading "Welcome to NextShop" renders.
   → "View Products" link is visible and navigates to /products on click.
   → Navbar shows Home, Products, About. "Home" link is highlighted (active).

   # 3. Navbar active link
   Click "Products" → Navbar highlights "Products", de-highlights "Home".
   Click "About"    → Navbar highlights "About".

   # 4. Products page — loading skeleton
   Navigate to /products for the first time.
   → Skeleton cards (animate-pulse) appear briefly while products load.
   → 12 product cards render in a grid with images, titles, prices, ratings.

   # 5. Products page — SSG / ISR
   Run: npm run build && npm start
   Navigate to /products.
   → Page loads instantly from cache. No loading state — it was pre-rendered.

   # 6. Product detail page
   Click any product card.
   → URL changes to /products/:id.
   → Product image, title, description, price, stock badge, rating all visible.
   → Browser tab title shows "{Product Name} — NextShop" (dynamic metadata working).
   → "← Back to Products" link returns to /products.

   # 7. Product detail — <Image> component
   → Product images load with Next.js optimisation (check DevTools Network tab —
     images are served as WebP and lazy-loaded for off-screen cards).

   # 8. 404 — Product not found
   Visit http://localhost:3000/products/99999 (non-existent ID).
   → "Product Not Found" message and a "Back to Products" link render.
   → The not-found.tsx file handled this gracefully.

   # 9. About page — static metadata
   Visit /about. Open browser DevTools → Elements.
   → <title> in <head> shows "About — NextShop".
   → <meta name="description"> shows the static description.

   # 10. Production build
   Run: npm run build
   → Build succeeds. Output shows which pages are Static (⚬), ISR (◐),
     or Dynamic (λ) in the route breakdown.
   ```

2. **Full-Stack Blog with API Routes, Server Actions & Prisma.**

   **What you practice:**
   - API Route Handlers (`route.ts`) for GET and POST endpoints
   - Server Actions with `'use server'` for form-based mutations
   - `revalidatePath` to clear the page cache after mutations
   - Prisma ORM with SQLite for a zero-config database in development
   - Reading and writing data in Server Components vs Client Components
   - `useTransition` and `useFormStatus` for optimistic / pending UI
   - `generateStaticParams` and `revalidate` for ISR on post detail pages
   - Zod validation inside Server Actions

   **Requirements:**
   - A blog app with two models: `Post` (id, title, content, slug, published, createdAt) and `Comment` (id, postId, authorName, body, createdAt).
   - API Routes:
     - `GET /api/posts` — return all published posts as JSON.
     - `POST /api/posts` — create a post (title, content, slug required). Return 400 for validation errors.
     - `GET /api/posts/[slug]` — return a single post with its comments.
   - Pages:
     - `/blog` — Server Component. Fetch all published posts from the DB via Prisma. Render a list of post cards linking to `/blog/[slug]`.
     - `/blog/[slug]` — Server Component. Fetch the post and its comments. Render the full post and a `CommentList` component below it.
     - `/blog/new` — Client Component form. On submit, calls a `createPost` Server Action. After success, `revalidatePath('/blog')` and `redirect('/blog')`.
   - A `AddCommentForm` Client Component on `/blog/[slug]` that calls an `addComment` Server Action. After success, `revalidatePath` the post page.
   - A `DeletePostButton` Client Component that calls a `deletePost` Server Action using `useTransition` to show a pending state.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   **What you practice:**

   - API Route Handlers (`route.ts`) for GET and POST endpoints
   - Server Actions with `'use server'` for form-based mutations
   - `revalidatePath` to clear the page cache after mutations
   - Prisma ORM with SQLite for a zero-config database in development
   - Reading and writing data in Server Components vs Client Components
   - `useTransition` and `useFormStatus` for optimistic / pending UI
   - `generateStaticParams` and `revalidate` for ISR on post detail pages
   - Zod validation inside Server Actions
   **Requirements:**

   - A blog app with two models: `Post` (id, title, content, slug, published, createdAt) and `Comment` (id, postId, authorName, body, createdAt).
   - API Routes:
     - `GET /api/posts` — return all published posts as JSON.
     - `POST /api/posts` — create a post (title, content, slug required). Return 400 for validation errors.
     - `GET /api/posts/[slug]` — return a single post with its comments.
   - Pages:
     - `/blog` — Server Component. Fetch all published posts from the DB via Prisma. Render a list of post cards linking to `/blog/[slug]`.
     - `/blog/[slug]` — Server Component. Fetch the post and its comments. Render the full post and a `CommentList` component below it.
     - `/blog/new` — Client Component form. On submit, calls a `createPost` Server Action. After success, `revalidatePath('/blog')` and `redirect('/blog')`.
   - A `AddCommentForm` Client Component on `/blog/[slug]` that calls an `addComment` Server Action. After success, `revalidatePath` the post page.
   - A `DeletePostButton` Client Component that calls a `deletePost` Server Action using `useTransition` to show a pending state.
   ```

3. **Full-Stack E-Commerce with NextAuth, Server Actions, Prisma and ISR.**

   **What you practice:**
   - NextAuth.js with `CredentialsProvider` for email/password auth
   - Session reading in Server Components (`getServerSession`) and Client Components (`useSession`)
   - Middleware protecting `/dashboard` routes without any client-side redirects
   - Combining Server Components (data display) with Client Components (interactive cart)
   - Server Actions for cart mutations (add, remove, update qty, checkout)
   - ISR with `revalidate` and `generateStaticParams` for the product catalogue
   - `revalidateTag` for targeted cache invalidation after mutations
   - A `CartContext` Client Component provider that reads cart state from the DB on mount
   - Zod validation in every Server Action
   - Prisma relations: User → Order → OrderItem → Product

   **Requirements:**
   - Models: `User` (id, email, password, name, createdAt), `Product` (id, name, price, description, category, stock, image), `Cart` (id, userId, items), `CartItem` (id, cartId, productId, quantity), `Order` (id, userId, total, status, createdAt), `OrderItem` (id, orderId, productId, quantity, price, name).
   - Auth:
     - `POST /api/auth/[...nextauth]` — NextAuth with CredentialsProvider. Bcrypt password check.
     - `/login` — login page with `signIn('credentials', ...)`.
     - `/register` — register page with a `registerUser` Server Action.
   - Pages (all TypeScript, all using the App Router):
     - `/` — Homepage (static). Hero section and a "Shop Now" button.
     - `/products` — ISR (revalidate: 60). Fetch all products from DB. Grid of product cards.
     - `/products/[id]` — ISR. Single product with `generateStaticParams`. Add to cart via Server Action.
     - `/dashboard` — Protected by middleware. Shows user's orders and a mini cart summary.
     - `/dashboard/cart` — Protected. Shows cart items with quantity controls via Server Actions.
     - `/dashboard/orders` — Protected. List of past orders.
   - Server Actions: `addToCart(productId, qty)`, `updateCartItem(itemId, qty)`, `removeFromCart(itemId)`, `checkout()` (creates Order + OrderItems, clears cart, decrements stock in a Prisma transaction).
   - Middleware at `middleware.ts` that redirects `/dashboard` routes to `/login` if no session cookie.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   # Setup
   cp .env.example .env
   # Add to .env:
   #   NEXTAUTH_SECRET=any-random-32-char-string
   #   NEXTAUTH_URL=http://localhost:3000

   npx prisma migrate dev --name init

   # Seed the database with some products (run in your terminal):
   npx prisma studio  → Open studio → Add products manually
   # OR create a quick seed script:
   # npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

   npm run dev → open http://localhost:3000

   # 1. Register
   Visit /register. Fill in name, email, password. Click "Create Account".
   → Button shows "Creating account..." while Server Action runs.
   → Redirected to /login?registered=true.
   → "Account created!" success message visible.

   # 2. Login
   Fill in email and password. Click "Sign in".
   → Redirected to /dashboard (or callbackUrl if set by middleware).
   → Navbar shows username, Cart link, and "Sign out".

   # 3. Protected route — middleware
   Open a new browser (incognito). Visit /dashboard directly.
   → Immediately redirected to /login?callbackUrl=/dashboard (middleware fired server-side —
     no flash of protected content).
   After login, redirected back to /dashboard.

   # 4. Product catalogue (ISR)
   Visit /products.
   → Product grid renders. Build the app (npm run build) and check .next/server/app/products:
     the page was statically generated (ISR).

   # 5. Add to cart
   Click any product → visit its detail page.
   Click "Add to Cart".
   → Button shows "Adding..." while Server Action runs.
   → After ~500ms, button resets. Navigate to /dashboard/cart.
   → The product appears in the cart list.
   Click "Add to Cart" again on the same product.
   → Quantity in /dashboard/cart increments from 1 to 2.

   # 6. Cart quantity controls
   On /dashboard/cart, click "+" on any item.
   → Quantity increments. Total updates. (Server Action + revalidatePath fired.)
   Click "−" until quantity reaches 0.
   → Item is removed from the cart automatically.
   Click "×" on an item.
   → Item is removed immediately.

   # 7. Checkout
   Add multiple items to the cart. Click "Place Order".
   → Button shows "Placing order..." during the Server Action.
   → Redirected to /dashboard/orders.
   → New order appears with correct total, items, and "pending" status.
   → /dashboard/cart is now empty.
   → Visit /products — product stock counts have decremented correctly
     (Prisma transaction worked atomically).

   # 8. Duplicate registration
   Try registering with an already-used email.
   → "An account with this email already exists." error appears.

   # 9. Wrong login credentials
   Enter wrong password on /login.
   → "Invalid email or password." error appears. Stay on /login.

   # 10. Sign out
   Click "Sign out" in the navbar.
   → Session cleared. Redirected to homepage.
   → Navbar shows Login and Register links.
   → Visiting /dashboard now redirects to /login (middleware catches it again).
   ```
