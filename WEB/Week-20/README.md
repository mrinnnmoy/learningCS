# List of things learned.

## 1. Routing.

In Week-19 we built a hand-rolled page switcher using `useState`.

That worked for two or three views but had no real URLs, no back-button support and no deep-linking.

**React Router** solves all of that. It syncs the browser's URL with which components are rendered, making React apps feel like real multi-page websites without ever reloading the page.

```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
# Note: react-router-dom v6.4+ ships its own types — @types is often not needed
```

### Setting Up the Router.

```tsx
// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

### Defining Routes.

```tsx
// App.tsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
```

### Navigation (`Link` and `NavLink`).

```tsx
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>

      {/* NavLink auto-applies an 'active' class when the URL matches */}
      <NavLink
        to="/products"
        className={({ isActive }: { isActive: boolean }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
        Products
      </NavLink>
    </nav>
  );
}
```

### Reading URL Parameters.

```tsx
import { useParams } from "react-router-dom";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  // useParams<{ id: string }>() types the returned object precisely
  // id is string | undefined — always check before using

  return <h1>Product #{id}</h1>;
}
```

### Reading and Setting Query Strings.

```tsx
import { useSearchParams } from "react-router-dom";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  return (
    <select
      value={category}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        setSearchParams({ category: e.target.value, page: "1" })
      }
    >
      <option value="all">All</option>
      <option value="electronics">Electronics</option>
    </select>
  );
}
```

### Programmatic Navigation.

```tsx
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginApi();
    navigate("/dashboard");
    // navigate(-1)                      go back one step in history
    // navigate('/login', { replace: true }) replace the current history entry
  };
}
```

### Nested Routes and Layouts.

```tsx
// layouts/DashboardLayout.tsx
import { Outlet, NavLink } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>
        <NavLink to="/dashboard" end>
          Overview
        </NavLink>
        <NavLink to="/dashboard/orders">Orders</NavLink>
        <NavLink to="/dashboard/settings">Settings</NavLink>
      </aside>
      <main>
        <Outlet /> {/* child route elements render here */}
      </main>
    </div>
  );
}

// App.tsx — nested route config
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardOverview />} />
  <Route path="orders" element={<DashboardOrders />} />
  <Route path="settings" element={<DashboardSettings />} />
</Route>;
```

### Protected Routes.

```tsx
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
}

export default function ProtectedRoute({
  isAuthenticated,
}: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// In route config:
<Route element={<ProtectedRoute isAuthenticated={!!user} />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>;
```

---

## 2. Context API.

As the component tree grows, threading props through many layers becomes unmanageable, "_prop drilling_."

The **Context API** lets you share data globally across any part of the tree without threading it through every intermediate component.

### Creating Typed Context.

```tsx
// context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of what the context exposes
interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// createContext<T> types the entire context
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem("token", data.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — throws a typed error if used outside the provider
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
  // After this check, TypeScript knows ctx is AuthContextType, never null
}
```

```tsx
// main.tsx — wrap the app in the Provider
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
```

```tsx
// Any component, anywhere in the tree
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  // TypeScript knows: user is User | null, logout is () => void

  return (
    <nav>
      {user ? (
        <>
          <span>Hello, {user.name}</span>
          <button onClick={logout}>Log out</button>
        </>
      ) : (
        <Link to="/login">Log in</Link>
      )}
    </nav>
  );
}
```

### When to Use Context (and When Not To).

```
Good uses of Context:
  Auth state (current user, logged-in status)
  App-wide theme (light / dark)
  Language / locale preferences
  Shopping cart (needed in navbar AND checkout simultaneously)

Bad uses of Context:
  State only ONE component needs → use local useState instead
  State two siblings need → lift state to their common parent first
  Rapidly-changing state (mouse position, scroll) → every consumer re-renders
```

### Multiple Contexts.

```tsx
<BrowserRouter>
  <AuthProvider>
    <CartProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </CartProvider>
  </AuthProvider>
</BrowserRouter>
```

---

## 3. Lifting State Up.

"_Lifting state up_" is the React pattern for sharing state between sibling components.

If two components need the same data, move that state to their closest common ancestor and pass it down as props.

```tsx
// ❌ Wrong — two separate copies of the same data that can drift out of sync
function TabBar() {
  const [selected, setSelected] = useState<string>("overview");
}
function TabContent() {
  const [selected, setSelected] = useState<string>("overview"); // completely separate
}

// ✅ Correct — one copy, owned by the parent, passed down
type Tab = "overview" | "orders" | "settings";

interface TabBarProps {
  selected: Tab;
  onSelect: (tab: Tab) => void;
}

interface TabContentProps {
  selected: Tab;
}

function TabBar({ selected, onSelect }: TabBarProps) {
  const tabs: Tab[] = ["overview", "orders", "settings"];
  return (
    <div>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          style={{ fontWeight: selected === tab ? "bold" : "normal" }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function TabContent({ selected }: TabContentProps) {
  if (selected === "overview") return <Overview />;
  if (selected === "orders") return <Orders />;
  if (selected === "settings") return <Settings />;
  return null;
}

function App() {
  const [selectedTab, setSelectedTab] = useState<Tab>("overview");

  return (
    <div>
      <TabBar selected={selectedTab} onSelect={setSelectedTab} />
      <TabContent selected={selectedTab} />
    </div>
  );
}
```

---

## 4. Custom Hooks.

Custom hooks are functions whose names start with `use` that encapsulate reusable stateful logic.

They keep component code clean and make logic shareable across many components.

### useFetch (Reusable Data Fetching).

```tsx
// hooks/useFetch.ts
import { useState, useEffect, useCallback } from "react";

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export default function useFetch<T>(url: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json: T = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Usage — fully typed
interface Product {
  id: number;
  title: string;
  price: number;
}
interface ProductListResponse {
  products: Product[];
  total: number;
}

function ProductList() {
  const { data, loading, error } =
    useFetch<ProductListResponse>("/api/products");
  // data is ProductListResponse | null — TypeScript knows exactly what's inside
}
```

### `useLocalStorage` (Typed Persistent State).

```tsx
// hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

export default function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Could not save ${key} to localStorage`);
    }
  }, [key, value]);

  return [value, setValue];
}

// Usage — T is inferred from initialValue
function App() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
  // TypeScript knows theme is 'light' | 'dark', not just string
}
```

### `useDebounce` (Delay Rapid Updates).

```tsx
// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export default function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage
function SearchBar() {
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce<string>(query, 400);
  // Only fires the fetch after the user stops typing for 400ms
  const { data } = useFetch<ProductListResponse>(
    debouncedQuery ? `/api/search?q=${debouncedQuery}` : null,
  );
}
```

### `useClickOutside` (Detect Clicks Outside an Element).

```tsx
// hooks/useClickOutside.ts
import { useEffect, useRef, RefObject } from "react";

export default function useClickOutside<T extends HTMLElement>(
  handler: () => void,
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);

  return ref;
}

// Usage
function Dropdown() {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setOpen((o) => !o)}>Menu</button>
      {open && (
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      )}
    </div>
  );
}
```

---

## 5. Recoil (State Management).

As apps grow, you often need state shared across many unrelated components.

**Recoil** gives you a graph of shared state (atoms) and derived state (selectors) that any component can subscribe to independently.

```bash
npm install recoil
```

### Core Concepts.

```
Atom            → a shared unit of state. Any component can read or write it.
Selector        → derived/computed state based on one or more atoms.
                    Re-computes automatically when upstream atoms change.
RecoilRoot      → the Provider that must wrap your app.
```

### Typed Atoms.

```tsx
// store/atoms.ts
import { atom } from "recoil";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  qty: number;
}

export const cartAtom = atom<CartItem[]>({
  key: "cartAtom",
  default: [],
});

export const searchAtom = atom<string>({
  key: "searchAtom",
  default: "",
});

export const themeAtom = atom<"light" | "dark">({
  key: "themeAtom",
  default: "light",
});
```

### Typed Selectors.

```tsx
// store/selectors.ts
import { selector } from "recoil";
import { cartAtom } from "./atoms";

export const cartTotalSelector = selector<number>({
  key: "cartTotalSelector",
  get: ({ get }) => {
    const cart = get(cartAtom);
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  },
});

export const cartCountSelector = selector<number>({
  key: "cartCountSelector",
  get: ({ get }) => {
    const cart = get(cartAtom);
    return cart.reduce((sum, item) => sum + item.qty, 0);
  },
});
```

### Using Atoms and Selectors.

```tsx
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { cartAtom, CartItem } from "../store/atoms";
import { cartTotalSelector, cartCountSelector } from "../store/selectors";

// Read AND write
function Cart() {
  const [cart, setCart] = useRecoilState<CartItem[]>(cartAtom);
  return <p>{cart.length} items</p>;
}

// Read only
function CartBadge() {
  const count = useRecoilValue<number>(cartCountSelector);
  return <span>{count}</span>;
}

// Write only (component won't re-render when atom changes)
function AddToCartButton({ product }: { product: CartItem }) {
  const setCart = useSetRecoilState<CartItem[]>(cartAtom);

  const addToCart = (): void => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  return <button onClick={addToCart}>Add to cart</button>;
}
```

### RecoilRoot Setup.

```tsx
// main.tsx
import { RecoilRoot } from "recoil";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>,
);
```

---

## 6. Performance Basics.

React is fast by default. These tools exist for cases where profiling reveals a genuine problem.

### `React.memo` (Skip Unnecessary Re-Renders).

```tsx
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

// Wrapped in memo — only re-renders when props actually change
const ProductCard = React.memo(function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div>
      <h3>{product.title}</h3>
      <button onClick={() => onAddToCart(product.id)}>Add</button>
    </div>
  );
});
```

### `useCallback` (Stable Function References).

```tsx
function App() {
  const [items, setItems] = useState<Item[]>([]);

  // Without useCallback: a new function is created on every render,
  // which defeats React.memo on the child because the prop reference changes.
  const handleDelete = useCallback((id: number): void => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []); // empty deps: setItems is stable, no deps needed

  return <ItemList items={items} onDelete={handleDelete} />;
}
```

### `useMemo` (Cache Expensive Computations).

```tsx
function ProductList({ products, filters }: ProductListProps) {
  // Only recomputes when products or filters change — not on every unrelated re-render
  const sortedAndFiltered = useMemo<Product[]>(
    () =>
      products
        .filter((p) => p.category === filters.category)
        .sort((a, b) => a.price - b.price),
    [products, filters],
  );

  return (
    <ul>
      {sortedAndFiltered.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### `useEffect` (Managing Side Effects).

```tsx
function ProductPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/products/${productId}`)
      .then((res) => res.json() as Promise<Product>)
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [productId]); // re-runs when productId changes

  if (loading) return <p>Loading...</p>;
  return <h1>{product?.title}</h1>;
}

// The 3 forms:
useEffect(() => {
  /* runs after EVERY render */
});
useEffect(() => {
  /* runs ONCE on mount */
}, []);
useEffect(() => {
  /* runs when x changes */
}, [x]);
```

### Code Splitting with `React.lazy`.

```tsx
import { lazy, Suspense } from "react";

// Each page's code is only downloaded when first rendered
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

function App() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 7. Folder Structure Organization.

```
src/
├── main.tsx
├── App.tsx
├── vite-env.d.ts          ← Vite's ambient type declarations
│
├── assets/
│
├── components/            ← shared, reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
│
├── context/               ← React Context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
│
├── hooks/                 ← custom hooks
│   ├── useFetch.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useClickOutside.ts
│
├── layouts/               ← route-level layout wrappers with <Outlet />
│   └── DashboardLayout.tsx
│
├── pages/                 ← one component per route
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── dashboard/
│       ├── OverviewPage.tsx
│       ├── OrdersPage.tsx
│       └── SettingsPage.tsx
│
├── store/                 ← Recoil atoms and selectors
│   ├── atoms.ts
│   └── selectors.ts
│
├── services/              ← API call functions
│   ├── api.ts
│   └── productService.ts
│
├── types/                 ← shared TypeScript interfaces and types
│   └── index.ts
│
└── utils/                 ← pure helper functions (no React)
    ├── formatDate.ts
    └── formatCurrency.ts
```

### Shared Types File.

```tsx
// types/index.ts — one place for all shared interfaces

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  thumbnail: string;
  category: string;
  rating: number;
  stock: number;
}

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  date: string;
}

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";
```

### The Services Layer.

```ts
// services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// services/productService.ts
import { apiFetch } from "./api";
import { Product } from "../types";

export const productService = {
  getAll: () => apiFetch<Product[]>("/api/products"),
  getById: (id: number) => apiFetch<Product>(`/api/products/${id}`),
  create: (d: Omit<Product, "id">) =>
    apiFetch<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(d),
    }),
};
```

---

## Assignment.

1. **Multi-Page App with React-Router, AuthContext and a Custom Hook.**

   **What you practice:**
   - React Router v6 with `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`
   - `useParams<{ id: string }>()` for typed dynamic segments
   - `useNavigate` for programmatic navigation after login
   - A typed `AuthContext` with `User` interface and `useAuth()` hook
   - `useFetch<T>()` generic custom hook
   - A `ProtectedRoute` component that redirects unauthenticated users
   - TypeScript throughout — typed props, typed state, typed events

   **Requirements:**
   - Vite + React + TypeScript project with `react-router-dom`.
   - Routes: `/` (HomePage — product grid), `/products/:id` (ProductDetailPage), `/login` (LoginPage), `/dashboard` (protected).
   - `AuthContext` with `User` type, `login(email: string): void`, `logout(): void`.
   - `Navbar` showing user email + logout when logged in, login link when not.
   - `useFetch<T>(url: string | null)` returning `{ data: T | null; loading: boolean; error: string | null }`.
   - `HomePage` fetches `https://dummyjson.com/products?limit=12`, renders a product grid, each card links to `/products/:id`.
   - `ProductDetailPage` uses `useParams<{ id: string }>()`, fetches the single product, displays title, description, price, rating.
   - On successful login, `useNavigate` redirects to `/dashboard`.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   # 1. Product grid
   npm run dev → open http://localhost:5173
   → 12 product cards load from dummyjson with thumbnails, titles, and prices.

   # 2. Product detail navigation
   Click any product card.
   → URL changes to /products/:id. No page reload. Full product details render.
   Click "← Back to products".
   → Returns to / without a reload.

   # 3. Protected route — unauthenticated
   Visit http://localhost:5173/dashboard directly while not logged in.
   → Immediately redirected to /login.

   # 4. Login
   Enter any email and password. Click Sign in.
   → Redirected to /dashboard. Navbar shows email and a Logout button.

   # 5. Protected route — authenticated
   While logged in, visit /dashboard directly.
   → Dashboard renders. No redirect.

   # 6. Logout
   Click Logout.
   → Navbar shows "Login" link. Visiting /dashboard redirects to /login.

   # 7. 404 route
   Visit any unmatched URL (e.g. /does-not-exist).
   → "404 — Page not found" message.
   ```

2. **E-Commerce Store with Recoil, Cart, Search and Typed Pagination.**

   **What you practice:**
   - Typed Recoil atoms (`atom<CartItem[]>`) and selectors (`selector<number>`)
   - `useRecoilState`, `useRecoilValue`, `useSetRecoilState` with correct type inference
   - `React.memo` on a typed component + `useCallback` with typed arguments
   - `useSearchParams` for URL-driven category and page filters
   - Client-side filtering using a Recoil selector driven by `searchAtom`
   - TypeScript interfaces for all data shapes in `src/types/index.ts`

   **Requirements:**
   - Recoil with `RecoilRoot`. Typed `cartAtom: atom<CartItem[]>` and `searchAtom: atom<string>`.
   - Typed selectors: `cartTotalSelector: selector<number>`, `cartCountSelector: selector<number>`.
   - `Navbar` reads `cartCountSelector`, shows a badge with the item count.
   - `HomePage`: fetches 100 products, supports `?category=` and `?page=` via `useSearchParams`, search bar writes to `searchAtom`, client-side filtering, 10 per page.
   - `ProductCard` wrapped in `React.memo`. `useSetRecoilState<CartItem[]>` for Add to Cart. `useCallback` on the handler.
   - `CartPage` (`/cart`): reads `cartAtom`, shows items with +/− controls, total from `cartTotalSelector`, "Clear cart" button.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   # 1. Product grid and pagination
   npm run dev → open http://localhost:5173
   → First 10 products render. "100 products" total.
   → Pagination buttons appear. Click page 2 → URL shows ?page=2, next 10 load.

   # 2. Category filter
   Click any category (e.g. "laptops").
   → URL: ?category=laptops&page=1. Only laptops shown. Count updates.

   # 3. Search
   Type "phone" in the search bar.
   → Products filter client-side. Page resets to 1. Count updates.
   Clear search. → All products (within selected category) return.

   # 4. Add to cart
   Click "Add to cart" on any product.
   → Cart badge in Navbar shows "1".
   Click same product again → badge shows "2" (qty incremented, not duplicate).
   Click a different product → badge shows "3".

   # 5. Cart page
   Click "Cart" in the Navbar.
   → Items show thumbnail, title, price×qty, quantity controls.
   → Total correctly sums all items.
   Click "+" on any item → qty goes up, total updates.
   Click "−" on item with qty 1 → item removed.
   Click "×" → item removed immediately.

   # 6. Clear cart
   Click "Clear cart".
   → Cart empties. "Your cart is empty." shown. Badge disappears.

   # 7. State persistence across routes
   Add items, navigate between / and /cart.
   → Cart atom persists — Recoil state survives route changes.
   ```

3. **Full Dashboard with AuthContext + Recoil + Custom Hooks + Code Splitting.**

   **What you practice:**
   - Typed `AuthContext` (login with name + email, `updateDisplayName`) combined with Recoil for domain state
   - Typed Recoil atoms (`ordersAtom: atom<Order[]>`, `productsAtom: atom<Product[]>`) and typed selectors
   - `useMemo<T>` with explicit type parameters to cache expensive computations
   - `useCallback` with typed arguments to stabilize handlers for memoized children
   - `useDebounce<string>` and `useClickOutside<HTMLDivElement>` typed custom hooks
   - `React.lazy` + `Suspense` for code splitting all 4 dashboard pages
   - Nested routes with `<Outlet />` in `DashboardLayout.tsx` — sidebar never unmounts
   - `useSearchParams` for status filter that survives page refresh

   **Requirements:**
   - `src/types/index.ts` holds `User`, `Order`, `OrderStatus`, `Product` interfaces.
   - `AuthContext`: typed `User | null` state, `login(name, email)`, `logout()`, `updateDisplayName(name)`.
   - Recoil atoms: `ordersAtom: atom<Order[]>`, `productsAtom: atom<Product[]>`, `statusFilterAtom: atom<OrderStatus | 'all'>`, `searchAtom: atom<string>`.
   - Recoil selectors: `orderStatsSelector: selector<OrderStats>`, `filteredOrdersSelector: selector<Order[]>`.
   - `DashboardLayout.tsx`: persistent sidebar with typed `NavLink`, `useClickOutside<HTMLDivElement>` dropdown in the topbar.
   - 4 lazy-loaded pages: `OverviewPage`, `OrdersPage`, `ProductsPage`, `SettingsPage`.
   - `OverviewPage`: reads `orderStatsSelector` for stat cards, shows last 5 orders.
   - `OrdersPage`: `useSearchParams` for `?status=`, `useDebounce<string>` on search, `useMemo` to sort filtered orders, `useCallback` on status change handler.
   - `ProductsPage`: reads `productsAtom`, shows LOW STOCK badge when `stock < 10`.
   - `SettingsPage`: controlled form that calls `updateDisplayName` from `AuthContext`.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   # 1. Login and protected route
   npm run dev → open http://localhost:5173
   → Redirected to /login (no user in AuthContext).
   Enter any name (e.g. "Alice") and email, click Sign in.
   → Redirected to /dashboard. Sidebar shows 4 links. Topbar shows "Alice".

   # 2. Protected route enforcement
   Open a new tab, visit /dashboard/orders directly without logging in.
   → Immediately redirected to /login.

   # 3. Overview page — stat cards
   → Total Revenue: sum of all delivered order totals.
   → Pending, Delivered counts match the mock data.
   → Recent Orders table shows the 5 most recent orders in reverse date order.

   # 4. Sidebar navigation — nested routes + Outlet
   Click "Orders" → URL: /dashboard/orders. Content changes. Sidebar stays mounted.
   Click "Products" → same. Click "Settings" → same.
   The sidebar NEVER unmounts between navigations — only <Outlet /> content swaps.

   # 5. Code splitting (DevTools Network tab)
   Open DevTools → Network → JS filter.
   First visit to each sub-page triggers a new .js chunk download.
   Second visit to the same page → no new download (cached).

   # 6. Orders page — status filter with URL persistence
   Click "pending".
   → URL: /dashboard/orders?status=pending. Only pending orders show.
   Refresh the page.
   → "pending" filter still active — URL-driven filter survives refresh.
   Click "all" → all 15 orders appear.

   # 7. Orders page — debounced search
   Type "alice" in the search box.
   → Wait ~300ms. Only Alice Johnson's orders appear.
   Type fast characters one by one — results update ONLY after you pause,
   not on every single keystroke. This proves useDebounce is working.

   # 8. Products page — LOW STOCK badge
   Laptop Pro (8), USB-C Hub (7), T-Shirt (5), Desk Lamp (9) all have stock < 10.
   → Their stock numbers are red and a "LOW" badge appears next to them.
   Wireless Mouse (45), Running Shoes (60) etc. → no badge.

   # 9. Settings page — update display name
   Click "Settings". Form shows current name ("Alice").
   Change to "Admin User", click "Save changes".
   → "✓ Saved!" appears briefly.
   → Topbar button now shows "Admin User" — AuthContext updated and Topbar re-rendered.

   # 10. useClickOutside dropdown
   Click the name button in the topbar.
   → Dropdown opens showing email + Logout button.
   Click anywhere outside the dropdown.
   → Dropdown closes (useClickOutside<HTMLDivElement> fired).
   Open it again, click Logout.
   → AuthContext clears user. Redirected to /login.

   # 11. TypeScript verification
   Run: npm run build
   → Build succeeds with zero type errors.
   Any intentional type violation (e.g. passing a number where a string is expected)
   should be caught immediately by your IDE (red underline) and fail the build.
   ```
