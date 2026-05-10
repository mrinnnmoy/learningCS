# How to Build.

```
Step 1 — Bootstrap from Assignment 1
  Copy code1/ to code2/ (keeps tsconfig and utils packages).
  Add two more apps (admin) and three more packages (types, ui, api-client).

Step 2 — Create packages/types
  No runtime dependencies — pure TypeScript interfaces only.
  package.json: name "@acme/types", exports { ".": "./src/index.ts" }.
  src/index.ts: export interfaces User, Product, Order, ApiResponse<T>, PaginatedResponse<T>.
  Include status unions for Order: 'pending' | 'processing' | 'shipped' | 'delivered'.

Step 3 — Create packages/ui
  package.json: name "@acme/ui".
    peerDependencies: react ^19, react-dom ^19.
    devDependencies: @acme/tsconfig, @acme/utils, react, react-dom, typescript, tailwindcss.
  tsconfig.json: extends @acme/tsconfig/nextjs.json.
  components/Button.tsx: variant (primary/secondary/ghost/danger), size (sm/md/lg), loading state.
  components/Card.tsx: title, description, children, footer props.
  components/Badge.tsx: variant (default/success/warning/danger/info), label.
  components/Input.tsx: controlled input with label, error, helper text.
  src/index.ts: barrel export all components and their prop types.

Step 4 — Create packages/api-client
  package.json: name "@acme/api-client".
    dependencies: @acme/types workspace:*.
  src/index.ts:
    ApiClient class with a baseUrl constructor param.
    getProducts(): Promise<Product[]> — fetch /api/products.
    getProduct(id): Promise<Product> — fetch /api/products/:id.
    getUsers(): Promise<User[]> — fetch /api/users.
    createOrder(data): Promise<Order> — POST /api/orders.
    All methods typed with interfaces from @acme/types.
    Export a default createApiClient(baseUrl) factory.

Step 5 — Create apps/web
  package.json deps: @acme/ui, @acme/types, @acme/api-client, @acme/utils workspace:*.
  next.config.ts: transpilePackages: ['@acme/ui'].
  page.tsx:
    Server Component — fetch product data using apiClient.getProducts().
    Render using <Card>, <Badge>, <Button> from @acme/ui.
    Show product name, price (formatCurrency from @acme/utils), status badge.

Step 6 — Create apps/admin
  package.json deps: @acme/ui, @acme/types, @acme/utils workspace:*.
  page.tsx: dashboard showing mock stats with @acme/ui components.
  Runs on port 3001.

Step 7 — Update turbo.json
  Same as Assignment 1 — the topological ordering handles types → ui/api-client → apps.
  No extra config needed; pnpm workspace deps define the graph.

Step 8 — pnpm install && pnpm turbo build
```