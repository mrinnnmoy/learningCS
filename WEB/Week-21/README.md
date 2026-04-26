# List of things learned.

## 1. Why Testing Matters.

Writing tests is not about proving your code works right now. It is about proving it **continues to work** as you add features, refactor internals and fix bugs.

Without tests, every change you make requires manually re-verifying the entire application, which is impractical and which nobody actually does consistently.

```
Without tests:
  You change a utility function → it silently breaks a feature three files away →
  a user reports it two weeks later → you spend hours tracing the source.

With tests:
  You change the same utility function → a test fails immediately →
  you see exactly what broke and where → you fix it in minutes.
```

### The Testing Pyramid.

```
                     ▲
                   /E2E\          End-to-end tests (Playwright)
                  /─────\         Fewest in number. Slow. Test real user flows
                 /       \        in a real browser against a running app.
                /─────────\
               / Integration\     Integration tests (Vitest + React Testing Library)
              /─────────────\     Test multiple units working together —
             /               \    components, hooks, API calls.
            /─────────────────\
           /    Unit Tests      \  Most in number. Fast. Test one function or
          /─────────────────────\  component in complete isolation.
                                   (Vitest)
```

### Types of Tests We Write.

```
Unit test         Tests a single function or component in isolation.
                  Fast. Deterministic. No network, no DB, no browser.
                  Example: "does formatCurrency(1999) return '$1,999.00'?"

Integration test  Tests multiple units working together.
                  Example: "does the LoginForm call onSubmit with the right
                  data when the user fills the form and clicks Sign in?"

End-to-end test   Tests a full user journey in a real browser.
                  Example: "can a user register, log in, add a product to cart,
                  and complete checkout without errors?"
```

---

## 2. Vitest (Unit and Integration Testing).

**Vitest** is a testing framework built on top of Vite.

It uses the same configuration and module resolution as your app, which means zero extra configuration for TypeScript, path aliases, or CSS modules.

It is compatible with the Jest API

- `describe`,
- `it`,
- `expect`,
- `vi`.

So everything you know from Jest applies directly.

```bash
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Configuring Vitest.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate a browser environment in Node
    environment: "jsdom",

    // Auto-import expect, describe, it, vi in every test file
    globals: true,

    // Run this setup file before each test file
    setupFiles: ["./src/test/setup.ts"],

    // Optional: collect coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
```

```typescript
// src/test/setup.ts
// Extends Vitest's expect with DOM matchers like toBeInTheDocument()
import "@testing-library/jest-dom";
```

```json
// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Writing Your First Tests.

```typescript
// src/utils/formatCurrency.ts
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
}
```

```typescript
// src/utils/formatCurrency.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

// describe groups related tests together
describe("formatCurrency", () => {
  it("formats a whole number correctly", () => {
    expect(formatCurrency(1999)).toBe("$1,999.00");
  });

  it("formats a decimal correctly", () => {
    expect(formatCurrency(9.99)).toBe("$9.99");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats a different currency", () => {
    expect(formatCurrency(100, "EUR")).toBe("€100.00");
  });

  it("handles large numbers", () => {
    expect(formatCurrency(1_000_000)).toBe("$1,000,000.00");
  });
});
```

### Vitest Matchers.

```typescript
// Equality
expect(value).toBe(42); // strict equality (===)
expect(value).toEqual({ a: 1 }); // deep equality (for objects and arrays)
expect(value).not.toBe(null); // negation with .not

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThanOrEqual(10);
expect(value).toBeCloseTo(0.3, 5); // for floating-point comparisons

// Strings
expect(str).toContain("hello");
expect(str).toMatch(/^hello/);

// Arrays
expect(arr).toHaveLength(3);
expect(arr).toContain("item");
expect(arr).toEqual([1, 2, 3]);

// Objects
expect(obj).toHaveProperty("name", "Alice");
expect(obj).toMatchObject({ id: 1, name: "Alice" }); // partial match

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("Expected error message");
expect(() => fn()).toThrow(TypeError);

// Async
await expect(asyncFn()).resolves.toBe("value");
await expect(asyncFn()).rejects.toThrow("error");
```

---

## 3. Testing Utility Functions.

Pure functions (no side effects, same input always gives same output) are the easiest things to test.

Write these tests first, they build confidence and are very fast to run.

### Testing with Edge Cases.

```typescript
// src/utils/validators.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}
```

```typescript
// src/utils/validators.test.ts
import { describe, it, expect } from "vitest";
import { isValidEmail, isStrongPassword, clamp, slugify } from "./validators";

describe("isValidEmail", () => {
  it("returns true for valid emails", () => {
    expect(isValidEmail("alice@example.com")).toBe(true);
    expect(isValidEmail("user+tag@domain.co.uk")).toBe(true);
  });

  it("returns false for invalid emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
    expect(isValidEmail("missing@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isStrongPassword", () => {
  it("returns true for a strong password", () => {
    expect(isStrongPassword("Secure1!")).toBe(true);
    expect(isStrongPassword("MyPass99")).toBe(true);
  });

  it("returns false if too short", () => {
    expect(isStrongPassword("Ab1")).toBe(false);
  });

  it("returns false if no uppercase", () => {
    expect(isStrongPassword("secure123")).toBe(false);
  });

  it("returns false if no number", () => {
    expect(isStrongPassword("SecurePass")).toBe(false);
  });
});

describe("clamp", () => {
  it("returns the value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when value is below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max when value is above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("works when value equals min or max", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    expect(slugify("Hello   World")).toBe("hello---world");
  });
});
```

### Testing Async Functions.

```typescript
// src/services/productService.ts
export interface Product {
  id: number;
  title: string;
  price: number;
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  if (!res.ok) throw new Error(`Product not found: ${id}`);
  return res.json() as Promise<Product>;
}
```

```typescript
// src/services/productService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchProduct } from "./productService";

// vi.fn() creates a mock function — replace the real fetch with a controlled version
// so tests never make real network requests
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch); // replace the global fetch

describe("fetchProduct", () => {
  beforeEach(() => {
    mockFetch.mockClear(); // reset mock call history before each test
  });

  it("returns a product on success", async () => {
    const fakeProduct = { id: 1, title: "Laptop", price: 999 };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeProduct),
    });

    const product = await fetchProduct(1);

    expect(product).toEqual(fakeProduct);
    expect(mockFetch).toHaveBeenCalledWith("https://dummyjson.com/products/1");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("throws an error when the response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    await expect(fetchProduct(999)).rejects.toThrow("Product not found: 999");
  });
});
```

---

## 4. Testing React Components.

**React Testing Library (RTL)** tests components the way a user interacts with them.

By finding elements the way a user would (by text, role, label) rather than by CSS class names or component internals.

```
Core RTL philosophy:
  "The more your tests resemble the way your software is used, the more
   confidence they can give you." — Kent C. Dodds

  ❌ find by internal prop name, component state, CSS class
  ✅ find by visible text, ARIA role, label text, placeholder
```

### Rendering and Querying.

```tsx
// src/components/Button.tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger";
}

export default function Button({
  label,
  onClick,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {label}
    </button>
  );
}
```

```tsx
// src/components/Button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button", () => {
  it("renders the label text", () => {
    render(<Button label="Save" onClick={() => {}} />);

    // screen.getByRole finds the button by its ARIA role
    // This is the preferred query — it tests accessibility at the same time
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn(); // mock function — tracks calls
    const user = userEvent.setup();

    render(<Button label="Save" onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button label="Save" onClick={handleClick} disabled />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("is disabled when the disabled prop is true", () => {
    render(<Button label="Save" onClick={() => {}} disabled />);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
```

### RTL Query Priority.

```typescript
// Queries in order of preference (most to least recommended):

// 1. getByRole — tests accessibility, finds by ARIA role + accessible name
screen.getByRole("button", { name: "Submit" });
screen.getByRole("textbox", { name: "Email" });
screen.getByRole("heading", { name: "Welcome" });
screen.getByRole("checkbox", { name: "Accept terms" });

// 2. getByLabelText — finds form inputs by their associated <label>
screen.getByLabelText("Email address");

// 3. getByPlaceholderText — finds inputs by placeholder (avoid if label exists)
screen.getByPlaceholderText("Enter your email");

// 4. getByText — finds by visible text content
screen.getByText("Submit");
screen.getByText(/welcome/i); // case-insensitive regex

// 5. getByTestId — last resort, use data-testid attribute
// Only when no other query makes sense
screen.getByTestId("product-card");

// Query variants:
// getBy*   → throws if not found (use for things that must be present)
// queryBy* → returns null if not found (use when checking something is ABSENT)
// findBy*  → async, waits until element appears (use for async UI changes)
// getAllBy*, queryAllBy*, findAllBy* → return arrays of all matches
```

### Testing Forms.

```tsx
// src/components/LoginForm.tsx
import { useState, FormEvent } from "react";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Both fields are required");
      return;
    }
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign in</button>
    </form>
  );
}
```

```tsx
// src/components/LoginForm.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  it("renders email, password fields and a submit button", () => {
    render(<LoginForm onSubmit={() => {}} />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("calls onSubmit with email and password when form is valid", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "Secure123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(handleSubmit).toHaveBeenCalledWith("alice@example.com", "Secure123");
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows an error and does not call onSubmit when fields are empty", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // role="alert" is the accessible role for error messages
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Both fields are required",
    );
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("clears the error when valid data is provided after an error", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={() => {}} />);

    // Trigger the error first
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Now fill in valid data and submit
    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "Secure123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // The error element should no longer be in the DOM
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

### Testing Async Components (Data Fetching).

```tsx
// src/components/ProductList.tsx
import { useEffect, useState } from "react";

interface Product {
  id: number;
  title: string;
  price: number;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json() as Promise<Product[]>)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.title} — ${p.price}
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// src/components/ProductList.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProductList from "./ProductList";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const fakeProducts = [
  { id: 1, title: "Laptop", price: 999 },
  { id: 2, title: "Phone", price: 599 },
];

describe("ProductList", () => {
  beforeEach(() => mockFetch.mockClear());

  it("shows a loading state initially", () => {
    mockFetch.mockResolvedValueOnce({
      json: () => new Promise(() => {}), // never resolves — stays in loading state
    });

    render(<ProductList />);

    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("renders products after successful fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(fakeProducts),
    });

    render(<ProductList />);

    // waitFor retries the assertion until it passes or times out
    // Required because the component renders "Loading..." first, then the data
    await waitFor(() => {
      expect(screen.getByText("Laptop — $999")).toBeInTheDocument();
      expect(screen.getByText("Phone — $599")).toBeInTheDocument();
    });
  });

  it("shows an error message when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to load products",
      );
    });
  });
});
```

---

## 5. Mocking with `vi`.

Mocking replaces real dependencies with controlled, predictable versions so tests stay fast, deterministic and isolated.

### `vi.fn()` (Mock Functions).

```typescript
import { vi, expect } from "vitest";

// Create a mock function
const mockFn = vi.fn();

// Call it
mockFn("hello", 42);
mockFn("world");

// Assert on calls
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith("hello", 42);
expect(mockFn).toHaveBeenLastCalledWith("world");

// Make it return a specific value
const mockAdd = vi.fn().mockReturnValue(10);
expect(mockAdd(2, 3)).toBe(10);

// Return different values on successive calls
const mockFetch = vi
  .fn()
  .mockResolvedValueOnce({ data: "first call" })
  .mockResolvedValueOnce({ data: "second call" });

// Inspect the calls
console.log(mockFn.mock.calls); // [[['hello', 42]], [['world']]]
console.log(mockFn.mock.results); // [{ type: 'return', value: undefined }, ...]

// Reset the mock
mockFn.mockClear(); // clear call history, keep implementation
mockFn.mockReset(); // clear history AND implementation
mockFn.mockRestore(); // restore the original (only for vi.spyOn)
```

### `vi.mock()` (Mock Entire Modules).

```typescript
// src/services/authService.ts
export async function loginApi(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
```

```typescript
// src/components/LoginForm.test.ts
import { vi } from "vitest";

// Mock the entire module — all exports become vi.fn()
vi.mock("../services/authService", () => ({
  loginApi: vi.fn(),
}));

// Import AFTER vi.mock() — you get the mocked version
import { loginApi } from "../services/authService";
import { mockedLoginApi } from "../services/__mocks__/authService"; // if you prefer a __mocks__ folder

// Now you can control what loginApi returns in each test
(loginApi as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
  token: "abc123",
});
```

### `vi.spyOn()` (Spy on Real Functions).

```typescript
import { vi, expect } from "vitest";

// Spy on console.error to test that errors are logged without actually logging
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// After the test
consoleSpy.mockRestore(); // restore original console.error

// Spy on a method of an object
import * as utils from "./utils";
const formatSpy = vi.spyOn(utils, "formatCurrency");

formatSpy("something");

expect(formatSpy).toHaveBeenCalled();
formatSpy.mockRestore();
```

### `vi.useFakeTimers()` (Control Time).

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { debounce } from "./utils";

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("only calls the function after the delay has passed", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();

    // The function hasn't been called yet — delay hasn't passed
    expect(fn).not.toHaveBeenCalled();

    // Fast-forward time by 300ms
    vi.advanceTimersByTime(300);

    // Now it should have been called exactly once
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

---

## 6. Testing Custom Hooks.

Custom hooks can't be called directly outside a component.

Use `renderHook` from React Testing Library to test them in isolation.

```typescript
// src/hooks/useCounter.ts
import { useState } from "react";

export default function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

```typescript
// src/hooks/useCounter.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useCounter from "./useCounter";

describe("useCounter", () => {
  it("starts at the initial value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("defaults to 0 when no initial value is provided", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("increments the count", () => {
    const { result } = renderHook(() => useCounter());

    // act() wraps state updates — ensures React processes them before asserting
    act(() => result.current.increment());

    expect(result.current.count).toBe(1);
  });

  it("decrements the count", () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(4);
  });

  it("resets to initial value", () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => result.current.increment());
    act(() => result.current.increment());
    act(() => result.current.reset());
    expect(result.current.count).toBe(5);
  });
});
```

### Testing Hooks with Context.

When a custom hook depends on a Context (like `useAuth`), wrap it in the provider.

```typescript
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

// Create a wrapper component that provides the required context
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('starts with no user logged in', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('sets the user on login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.login('alice@example.com'));

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe('alice@example.com');
  });

  it('clears the user on logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.login('alice@example.com'));
    act(() => result.current.logout());

    expect(result.current.user).toBeNull();
  });
});
```

---

## 7. Playwright (End-to-End Testing).

**Playwright** automates real browsers (Chromium, Firefox, WebKit) and lets you write tests that simulate complete user journeys like:

- filling forms,
- clicking buttons,
- navigating pages,
- making API calls.

Exactly as a real user would.

```bash
npm install --save-dev @playwright/test
npx playwright install   # downloads browser binaries
```

### Configuring Playwright.

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", // where E2E tests live
  timeout: 30_000, // 30s per test
  retries: process.env.CI ? 2 : 0, // retry twice in CI to handle flakiness

  use: {
    baseURL: "http://localhost:5173", // your Vite dev server
    screenshot: "only-on-failure", // save screenshots when tests fail
    video: "on-first-retry", // save video on first retry
    trace: "on-first-retry", // save trace on first retry (like a DevTools recording)
  },

  // Start the dev server before running E2E tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
```

```json
// package.json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:headed": "playwright test --headed",
    "e2e:debug": "playwright test --debug"
  }
}
```

### Your First Playwright Test.

```typescript
// e2e/home.spec.ts
import { test, expect } from "@playwright/test";

test("homepage loads and displays the page title", async ({ page }) => {
  // Navigate to the base URL
  await page.goto("/");

  // Assert the page title
  await expect(page).toHaveTitle(/Products/);

  // Assert a heading is visible
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
});

test("navigation links work correctly", async ({ page }) => {
  await page.goto("/");

  // Click the About link
  await page.getByRole("link", { name: "About" }).click();

  // Assert the URL changed
  await expect(page).toHaveURL(/\/about/);
});
```

### Playwright Locators (Finding Elements).

```typescript
// Playwright's recommended locator strategies (in order of preference):

// By role — semantically correct, accessibility-friendly
page.getByRole("button", { name: "Sign in" });
page.getByRole("link", { name: "Home" });
page.getByRole("textbox", { name: "Email" });
page.getByRole("heading", { name: "Products" });
page.getByRole("checkbox", { name: "Remember me" });

// By label — for form inputs
page.getByLabel("Email address");

// By placeholder
page.getByPlaceholder("Enter your email");

// By text
page.getByText("Submit");
page.getByText(/welcome/i); // regex, case-insensitive

// By test id (data-testid attribute)
page.getByTestId("product-card");

// CSS selector (last resort)
page.locator(".btn-primary");
page.locator("#submit-button");
```

### Playwright Actions and Assertions.

```typescript
// Actions
await page.goto("/login");
await page.getByLabel("Email").fill("alice@example.com");
await page.getByLabel("Password").fill("Secure123");
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("button", { name: "Sign in" }).dblclick();
await page.keyboard.press("Enter");
await page.keyboard.type("some text");
await page.selectOption("select#category", "electronics");
await page.check("input[type=checkbox]");
await page.hover(".dropdown-toggle");
await page.waitForURL("/dashboard");
await page.waitForLoadState("networkidle");

// Assertions — all are async, auto-retry until passing or timeout
await expect(page).toHaveURL("/dashboard");
await expect(page).toHaveTitle("Dashboard");
await expect(page.getByRole("heading")).toBeVisible();
await expect(page.getByRole("alert")).toContainText("Invalid credentials");
await expect(page.getByRole("button")).toBeDisabled();
await expect(page.getByRole("button")).toBeEnabled();
await expect(page.locator(".cart-badge")).toHaveText("3");
await expect(page.getByRole("list")).toHaveCount(10); // number of list items
await expect(page.getByRole("img")).toHaveAttribute("alt", "Product photo");
await expect(page.locator(".spinner")).toBeHidden();
```

### Testing a Full User Flow.

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("user can log in and access the dashboard", async ({ page }) => {
    await page.goto("/login");

    // Fill the login form
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Password").fill("Secure123");
    await page.getByRole("button", { name: "Sign in" }).click();

    // After login, should be on the dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    // Navbar should show the user's email
    await expect(page.getByText("alice@example.com")).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Should stay on login page with an error
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("alert")).toContainText("Invalid credentials");
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    // Try to access a protected route directly
    await page.goto("/dashboard");

    // Should be redirected to login
    await expect(page).toHaveURL("/login");
  });

  test("user can log out", async ({ page }) => {
    // Log in first
    await page.goto("/login");
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Password").fill("Secure123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/dashboard");

    // Then log out
    await page.getByRole("button", { name: "Logout" }).click();

    // Should be back on login page
    await expect(page).toHaveURL("/login");

    // Navigating back to dashboard should redirect to login
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });
});
```

### Page Object Model (POM).

As E2E tests grow, repeating locators and actions across test files becomes unmaintainable. The Page Object Model encapsulates page interactions in reusable classes.

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Sign in" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(text: string): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }
}

// e2e/pages/DashboardPage.ts
import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Dashboard" });
  }

  async isVisible(): Promise<void> {
    await expect(this.page).toHaveURL("/dashboard");
    await expect(this.heading).toBeVisible();
  }
}
```

```typescript
// e2e/auth.spec.ts — using POM
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

test("user can log in with valid credentials", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login("alice@example.com", "Secure123");
  await dashboardPage.isVisible();
});

test("shows error for invalid credentials", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login("bad@example.com", "wrongpass");
  await loginPage.expectError("Invalid credentials");
  await expect(page).toHaveURL("/login");
});
```

### Mocking API Calls in Playwright.

```typescript
// Intercept and mock network requests in E2E tests — useful when the
// backend is not running or you want to test specific error states
import { test, expect } from "@playwright/test";

test("shows an error when the API is down", async ({ page }) => {
  // Intercept the products API call and return a 500 error
  await page.route("**/api/products", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Internal server error" }),
    }),
  );

  await page.goto("/products");

  await expect(page.getByRole("alert")).toContainText(
    "Failed to load products",
  );
});

test("renders products from a mocked API response", async ({ page }) => {
  await page.route("**/api/products", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 1, title: "Mock Laptop", price: 999 },
        { id: 2, title: "Mock Phone", price: 599 },
      ]),
    }),
  );

  await page.goto("/products");

  await expect(page.getByText("Mock Laptop")).toBeVisible();
  await expect(page.getByText("Mock Phone")).toBeVisible();
});
```

---

## 8. Test Organization and Best Practices.

### File Naming and Location.

```
Two common conventions — pick one and stick to it across the project:

Co-located (most common with Vite):
  src/
  └── components/
      ├── Button.tsx
      ├── Button.test.tsx      ← unit/integration tests next to the source file
      └── LoginForm/
          ├── LoginForm.tsx
          └── LoginForm.test.tsx

Separate test directory:
  src/
  └── components/
      └── Button.tsx
  tests/
  └── unit/
      └── Button.test.tsx

E2E tests always go in a separate top-level directory:
  e2e/
  ├── auth.spec.ts
  ├── products.spec.ts
  └── pages/
      ├── LoginPage.ts
      └── DashboardPage.ts
```

### Test Structure (Arrange, Act, Assert).

```typescript
it('calls onSubmit with the correct data', async () => {
  // ARRANGE — set up the test environment
  const handleSubmit = vi.fn();
  const user = userEvent.setup();
  render(<LoginForm onSubmit={handleSubmit} />);

  // ACT — perform the action being tested
  await user.type(screen.getByLabelText('Email'), 'alice@example.com');
  await user.type(screen.getByLabelText('Password'), 'Secure123');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  // ASSERT — verify the outcome
  expect(handleSubmit).toHaveBeenCalledWith('alice@example.com', 'Secure123');
});
```

### Lifecycle Hooks.

```typescript
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

describe("ProductService", () => {
  beforeAll(() => {
    // Runs once before all tests in this describe block
    // Good for: setting up a test database, starting a mock server
  });

  afterAll(() => {
    // Runs once after all tests in this describe block
    // Good for: tearing down the test database, stopping the mock server
  });

  beforeEach(() => {
    // Runs before EACH test
    // Good for: resetting mocks, restoring state
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Runs after EACH test
    // Good for: cleanup that must happen regardless of pass/fail
    vi.useRealTimers();
  });
});
```

### What Makes a Good Test.

```
✅ Tests ONE thing — if a test fails, you know exactly what is broken.
✅ Tests BEHAVIOUR, not implementation — if you refactor internals without
   changing behaviour, tests should still pass.
✅ Is INDEPENDENT — tests don't depend on each other or on execution order.
✅ Is DETERMINISTIC — running the same test multiple times always gives
   the same result.
✅ Is READABLE — the test name describes the expected behaviour clearly.
   "calls onSubmit with email and password when form is valid" is better than "form works".

❌ Don't test implementation details:
   Testing that useState was called with a specific value.
   Testing that a specific CSS class was added.
   Testing that an internal helper function was called.

❌ Don't test third-party libraries:
   Testing that React renders correctly.
   Testing that fetch actually makes a network request.
   These are tested by the library authors — trust them.
```

---

## Assignment.

1. **Unit Testing Utility Functions and a Custom Hook.**

   **What you practice:**
   - Vitest setup with `globals: true` and `jsdom` environment
   - Writing `describe`/`it`/`expect` blocks for pure utility functions
   - Testing edge cases, boundary values, and error paths
   - `renderHook` + `act` to test a custom hook in isolation
   - `vi.fn()` for mock functions and `vi.useFakeTimers()` for time control
   - `beforeEach` / `afterEach` lifecycle hooks

   **Requirements:**
   - Set up a Vite + TypeScript project with Vitest and `@testing-library/react`.
   - Write utilities in `src/utils/`: `formatCurrency(amount, currency?)`, `truncate(text, maxLength)`, `groupBy<T>(arr, keyFn)`, `debounce(fn, delay)`.
   - Write a custom hook `src/hooks/useCounter.ts` with `increment`, `decrement`, `reset`, and `incrementBy(n)`.
   - Write tests for all 4 utilities covering happy paths, edge cases, and boundary values.
   - Write tests for `useCounter` using `renderHook` and `act`, covering all 4 operations.
   - Use `vi.useFakeTimers()` to test `debounce` without actually waiting.

   [Solution](./Assignment/code1)

   **Vitest Output (expected):**

   ```
   ✓ src/utils/formatCurrency.test.ts (6 tests)
   ✓ src/utils/truncate.test.ts (6 tests)
   ✓ src/utils/groupBy.test.ts (5 tests)
   ✓ src/utils/debounce.test.ts (5 tests)
   ✓ src/hooks/useCounter.test.ts (8 tests)

   Test Files  5 passed (5)
   Tests       30 passed (30)
   ```

2. **Component Integration Tests with React Testing Library.**

   **What you practice:**
   - `render` + `screen` queries in order of preference (role → label → text)
   - `userEvent.setup()` for realistic user interactions (type, click, keyboard)
   - `waitFor` and `findBy*` for async UI changes after data fetching
   - `vi.stubGlobal('fetch', mockFetch)` to mock network calls
   - Testing a form: validation errors, controlled inputs, submission
   - Testing conditional rendering (loading, error, success states)
   - `vi.fn()` to verify callbacks were called with the right arguments

   **Requirements:**
   - Build and test 3 components:
     - `SearchBar` — a controlled input that calls an `onSearch(query: string)` prop when the user types. Debounces the call by 300ms (use `vi.useFakeTimers` to test).
     - `ProductCard` — displays product title, price, and a category badge. Has an "Add to cart" button that calls `onAddToCart(product)`. Shows a "Sold out" badge and disables the button when `stock === 0`.
     - `ProductList` — fetches `GET /api/products` on mount. Shows a loading spinner, an error state, or a grid of `ProductCard` components depending on the fetch result.
   - Write integration tests that cover:
     - Correct rendering of all visual states.
     - User interactions triggering the right callbacks with the right arguments.
     - Async loading/error/success states using `waitFor` and mocked fetch.
     - The disabled state of "Add to cart" when stock is 0.

   [Solution](./Assignment/code2)

   **Vitest Output (expected):**

   ```
   ✓ src/components/SearchBar.test.tsx (4 tests)
   ✓ src/components/ProductCard.test.tsx (7 tests)
   ✓ src/components/ProductList.test.tsx (6 tests)

   Test Files  3 passed (3)
   Tests       17 passed (17)
   ```

3. **End-to-End Testing with Playwright and Page Object Model.**

   **What you practice:**
   - Playwright project setup with `playwright.config.ts` and `webServer`
   - `page.goto`, `page.getByRole`, `page.getByLabel`, `page.fill`, `page.click`
   - `expect(page).toHaveURL`, `expect(locator).toBeVisible`, `expect(locator).toContainText`
   - `page.route` to mock API responses in E2E tests
   - The Page Object Model (POM) pattern for reusable page interactions
   - `test.describe`, `test.beforeEach` for test organization
   - Running tests across multiple browsers (Chromium, Firefox, WebKit)
   - `test.use({ storageState })` for authenticated test sessions

   **Requirements:**
   - Set up Playwright on a Vite + React + TypeScript project (you can reuse the Week-20 Assignment 1 app — it has login, products, and a protected dashboard that are perfect for E2E testing).
   - Write E2E tests covering these user flows:
     - **Homepage**: page title is correct, product cards render, clicking a card navigates to the detail page.
     - **Product detail**: URL contains the product ID, title and price are visible, back button returns to the homepage.
     - **Auth — login**: filling the form and submitting redirects to `/dashboard` and shows the user's email in the navbar.
     - **Auth — validation**: submitting with empty fields shows the error message and stays on `/login`.
     - **Auth — protected route**: visiting `/dashboard` while not logged in redirects to `/login`.
     - **Auth — logout**: logging in and then clicking Logout returns to `/login`.
   - Build a `LoginPage` POM class and a `DashboardPage` POM class.
   - Mock the `dummyjson` API in the homepage test so it does not make real network requests.

   [Solution](./Assignment/code3)

   **Playwright Test Output (expected):**

   ```
   Running 13 tests using 1 worker

   ✓  e2e/home.spec.ts:17:3 › Homepage › displays the page heading
   ✓  e2e/home.spec.ts:23:3 › Homepage › renders a card for each mocked product
   ✓  e2e/home.spec.ts:31:3 › Homepage › renders the price for each product
   ✓  e2e/home.spec.ts:38:3 › Homepage › clicking a product card navigates to detail
   ✓  e2e/home.spec.ts:51:3 › Homepage › navbar contains a link to the Dashboard
   ✓  e2e/product.spec.ts:10:3 › Product Detail Page › displays title and price for product 1
   ✓  e2e/product.spec.ts:18:3 › Product Detail Page › URL contains the product ID
   ✓  e2e/product.spec.ts:23:3 › Product Detail Page › back button returns to the homepage
   ✓  e2e/auth.spec.ts:21:3 › Authentication › user can log in and is redirected
   ✓  e2e/auth.spec.ts:33:3 › Authentication › navbar shows the user email after login
   ✓  e2e/auth.spec.ts:43:3 › Authentication › shows an error when form is submitted empty
   ✓  e2e/auth.spec.ts:54:3 › Authentication › redirects unauthenticated users to /login
   ✓  e2e/auth.spec.ts:63:3 › Authentication › user can log out and is returned to /login

   13 passed (18.4s)
   ```
