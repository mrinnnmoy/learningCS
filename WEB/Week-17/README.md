# List of things learned.

## 1. Basic Types.

TypeScript is a **superset of JavaScript**. Every valid JavaScript program is also valid TypeScript.

What TypeScript adds is a **static type system** that runs at compile time, before your code ever executes.

**The core idea is simple**: You annotate variables, function parameters and return values with types. The _TypeScript compiler_ (`tsc`) checks that you never pass the wrong kind of data anywhere in your program. If you do, it tells you before you run the code & not when a user triggers it at 2am in production.

```
JavaScript workflow:
  Write code → Run it → Bug surfaces at runtime (user-facing)

TypeScript workflow:
  Write code → tsc checks types → Bug caught at compile time (developer-facing)
```

### Installation and Setup.

```bash
# Install TypeScript globally
npm install -g typescript

# Or as a project dependency (recommended for teams)
npm install --save-dev typescript

# Check the version
tsc --version

# Initialise a tsconfig.json in your project
tsc --init

# Compile a file
tsc index.ts       # produces index.js

# Watch mode — recompile on every change
tsc --watch
```

### `tsconfig.json` (The TypeScript Configuration File).

```json
{
  "compilerOptions": {
    "target": "ES2022",
    // What JavaScript version to compile to.
    // ES2022 is safe for Node 18+ and modern browsers.

    "module": "commonjs",
    // Module system. "commonjs" for Node.js (require/module.exports).
    // "ESNext" for frontend bundlers (import/export).

    "outDir": "./dist",
    // Where compiled .js files go.

    "rootDir": "./src",
    // Where your .ts source files live.

    "strict": true,
    // Enables ALL strict checks at once. Always turn this on.
    // Includes: strictNullChecks, noImplicitAny, strictFunctionTypes, etc.

    "esModuleInterop": true,
    // Allows: import express from 'express'
    // Instead of: import * as express from 'express'

    "skipLibCheck": true,
    // Skip type checking .d.ts declaration files from node_modules.
    // Speeds up compilation without sacrificing your own type safety.

    "sourceMap": true,
    // Generates .map files so debuggers show TypeScript source, not compiled JS.

    "resolveJsonModule": true,
    // Allows importing JSON files: import config from './config.json'

    "forceConsistentCasingInFileNames": true,
    // Catches case-sensitivity bugs (import './User' vs import './user')

    "noUnusedLocals": true,
    // Error on declared-but-unused variables.

    "noUnusedParameters": true,
    // Error on declared-but-unused function parameters.

    "noImplicitReturns": true
    // Error if a function can return without hitting a return statement.
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Primitive Types.

```typescript
// The three most common primitives
let name: string = "Alice";
let age: number = 28; // number covers integers AND floats
let isAdmin: boolean = true;

// TypeScript can infer types from the initial value
// You do not need to annotate when the type is obvious
let username = "Alice"; // TypeScript infers: string
let count = 0; // TypeScript infers: number
let active = true; // TypeScript infers: boolean

// Type annotations become necessary when:
// 1. Declaring without assigning
let result: string; // no initial value — must annotate

// 2. When the inferred type is too wide
let status = "pending"; // inferred as string
let status2: "pending" | "active" | "cancelled" = "pending"; // literal type (better)
```

### The Special Types.

```typescript
// null and undefined
// With strict: true, these are NOT assignable to string, number, boolean
let name: string = null; // ❌ Error with strictNullChecks
let name: string | null = null; // ✅ must explicitly allow null

let value: undefined = undefined;

// any — the escape hatch (use sparingly)
// Disables ALL type checking for this value
let data: any = "hello";
data = 42; // no error
data = { foo: "bar" }; // no error
data.nonExistent(); // no error — but will crash at runtime

// unknown — the safe escape hatch (prefer over any)
// Like any, unknown can hold any value.
// Unlike any, you MUST narrow the type before using it.
let input: unknown = getValueFromSomewhere();
input.toUpperCase(); // ❌ Error — cannot call method on unknown
if (typeof input === "string") {
  input.toUpperCase(); // ✅ TypeScript now knows it's a string
}

// never — a value that can never exist
// Used for functions that always throw or infinite loops
function throwError(msg: string): never {
  throw new Error(msg);
  // nothing after a throw can be reached — return type is never
}

// void — a function that returns nothing meaningful
function log(msg: string): void {
  console.log(msg);
  // implicit return undefined — void signals "don't use this return value"
}
```

### Arrays and Tuples.

```typescript
// Arrays
let numbers: number[] = [1, 2, 3];
let names: string[] = ["Alice", "Bob"];
let mixed: (string | number)[] = ["Alice", 28];

// Generic syntax (equivalent, matter of preference)
let scores: Array<number> = [95, 87, 72];

// Readonly arrays — cannot be mutated
const tags: readonly string[] = ["redis", "node", "typescript"];
tags.push("react"); // ❌ Error — cannot mutate readonly array

// Tuples — fixed-length arrays with specific types at each position
let point: [number, number] = [10, 20];
let entry: [string, number] = ["alice", 98];
let triplet: [string, number, boolean] = ["active", 3, true];

point[0] = "hello"; // ❌ Error — position 0 must be number

// Named tuple members (more readable)
let user: [name: string, age: number, isActive: boolean] = ["Alice", 28, true];
```

### Type Assertions.

```typescript
// When YOU know more than TypeScript about a value's type
// This is a promise to the compiler — it does not actually change the runtime value

const input = document.getElementById("email") as HTMLInputElement;
input.value; // now TypeScript knows .value exists on HTMLInputElement

// Alternate syntax (not allowed in TSX files)
const input2 = <HTMLInputElement>document.getElementById("email");

// Double assertion — for when types are completely incompatible
// Use very sparingly — you're overriding the type system
const weirdCase = someValue as unknown as SomeOtherType;
```

---

## 2. Interfaces.

An interface defines the **shape** of an object (the names, types and optionality of its properties).

It is a contract: any value that claims to implement an interface must have all the required properties.

### Defining and Using Interfaces.

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

// Every object assigned to User must have ALL these properties
const alice: User = {
  id: 1,
  email: "alice@example.com",
  name: "Alice",
  role: "admin",
  createdAt: new Date(),
};

// TypeScript will catch missing or extra properties
const incomplete: User = {
  id: 1,
  email: "alice@example.com",
  // ❌ Error: Property 'name' is missing
};
```

### Optional and Readonly Properties.

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string; // optional — may be undefined
  readonly sku: string; // readonly — cannot be changed after creation
  readonly createdAt: Date;
}

const laptop: Product = {
  id: 1,
  name: "Laptop",
  price: 999,
  sku: "LAP-001",
  createdAt: new Date(),
  // description is optional — omitting it is fine
};

laptop.price = 849; // ✅ allowed
laptop.sku = "LAP-002"; // ❌ Error: cannot assign to readonly property
```

### Extending Interfaces.

```typescript
interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// User extends BaseEntity — inherits all its properties
interface User extends BaseEntity {
  email: string;
  name: string;
  password: string;
  role: "user" | "admin";
}

// A value of type User must have ALL properties from both interfaces
const user: User = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  email: "alice@example.com",
  name: "Alice",
  password: "hashed",
  role: "admin",
};

// Multiple extension
interface AdminUser extends User, AuditLog {
  permissions: string[];
}
```

### Interfaces for Functions.

```typescript
// An interface can describe a function's signature
interface Validator {
  (value: string): boolean;
}

const isEmail: Validator = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isNotEmpty: Validator = (value) => value.trim().length > 0;

// Interface with a call signature AND properties
interface Logger {
  (message: string): void; // callable
  level: "info" | "warn" | "error";
  prefix: string;
}
```

### Interfaces for Classes.

```typescript
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

// A class can implement multiple interfaces
class UserModel implements Serializable, Timestamped {
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  serialize(): string {
    return JSON.stringify(this);
  }

  deserialize(data: string): void {
    Object.assign(this, JSON.parse(data));
  }
}
// TypeScript verifies that UserModel has ALL required methods and properties
```

### Index Signatures.

```typescript
// When you don't know the property names in advance but know their types
interface StringMap {
  [key: string]: string;
}

const headers: StringMap = {
  "Content-Type": "application/json",
  Authorization: "Bearer abc123",
  "X-Request-Id": "req-42",
};
// Any string key → string value is allowed

// Can mix known and unknown properties
interface Config {
  timeout: number; // known property
  [key: string]: string | number; // index signature must be compatible
}
```

---

## 3. Type Aliases.

A _type alias_ is an alternative name for any type — primitives, objects, unions, intersections, tuples or anything else.

Where interfaces can only describe object shapes, type aliases can describe any type.

### Defining Type Aliases.

```typescript
// Primitive alias
type UserId = number;
type Email = string;
type Timestamp = Date;

// Object alias — same shape as an interface
type Point = {
  x: number;
  y: number;
};

// Function alias
type Handler = (req: Request, res: Response) => void;

// Using aliases
const userId: UserId = 42;
const origin: Point = { x: 0, y: 0 };
```

### Union Types.

```typescript
// A union type means "this OR that"
type Status = "pending" | "active" | "cancelled" | "completed";
type ID = string | number;
type Result<T> = T | null | undefined;

let orderStatus: Status = "pending";
orderStatus = "active"; // ✅
orderStatus = "flying"; // ❌ Error — not in the union

// Union with different shapes
type StringOrNumber = string | number;
const value: StringOrNumber = "hello"; // or 42 — both fine

// Discriminated union — a pattern for handling different shapes cleanly
type ApiResponse =
  | { status: "success"; data: User }
  | { status: "error"; message: string }
  | { status: "loading" };

function handleResponse(res: ApiResponse) {
  // TypeScript narrows the type based on the 'status' discriminant
  switch (res.status) {
    case "success":
      console.log(res.data.email); // TypeScript knows data: User is available
      break;
    case "error":
      console.log(res.message); // TypeScript knows message: string is available
      break;
    case "loading":
      console.log("Loading...");
      break;
  }
}
```

### Intersection Types.

```typescript
// An intersection type means "this AND that" — combines all properties
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type WithId = {
  id: number;
};

// A User must have ALL properties from all three
type User = WithId &
  Timestamped & {
    email: string;
    name: string;
  };

// Useful for mixing in shared properties
type AdminUser = User & {
  permissions: string[];
  department: string;
};
```

### Interface vs Type Alias (When to Use Which).

```
Use interface when:
  Describing the shape of an object or class.
  You want to use extends for inheritance.
  You need declaration merging (adding properties later in separate files).

Use type alias when:
  You need a union (A | B) or intersection (A & B).
  You're aliasing a primitive.
  You're describing a function signature.
  You're creating a tuple type.
  You want to compute a type from another (mapped types, conditionals).

In practice: both work for object shapes. Be consistent within a project.
Many teams use interfaces for public API shapes and type aliases for internal utilities.
```

```typescript
// Declaration merging — ONLY interfaces support this
// If you define the same interface name twice, they merge
interface Window {
  customProperty: string; // adds to the built-in Window interface
}

// Type aliases cannot be redeclared — this is an error:
type Window = { customProperty: string }; // ❌ duplicate identifier
```

---

## 4. Generics.

Generics allow you to write code that works with **any type** while still being type-safe.

Instead of committing to a specific type, you use a type parameter as a placeholder that gets filled in when the function or class is actually used.

```typescript
// Without generics — you have to either duplicate code or lose type safety
function getFirstItemNumber(arr: number[]): number | undefined {
  return arr[0];
}
function getFirstItemString(arr: string[]): string | undefined {
  return arr[0];
}

// With generics — one function, any type, fully type-safe
function getFirstItem<T>(arr: T[]): T | undefined {
  return arr[0];
  // T is a type parameter. When you call the function, TypeScript fills in T
  // based on the argument you pass.
}

const firstNum = getFirstItem([1, 2, 3]); // T = number, returns number | undefined
const firstStr = getFirstItem(["a", "b", "c"]); // T = string, returns string | undefined
const firstBool = getFirstItem([true, false]); // T = boolean, returns boolean | undefined
```

### Generic Functions.

```typescript
// Swap two values of the same type
function swap<T>(a: T, b: T): [T, T] {
  return [b, a];
}

const [x, y] = swap(1, 2); // T = number
const [s, t] = swap("hello", "world"); // T = string

// Multiple type parameters
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const entry = pair("name", "Alice"); // [string, string]
const score = pair(1, 95); // [number, number]
const mixed = pair("id", 42); // [string, number]

// Generic with a return type different from the input
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const users = [
  { name: "Alice", age: 28 },
  { name: "Bob", age: 34 },
];
const names = pluck(users, "name"); // string[]
const ages = pluck(users, "age"); // number[]
// pluck(users, 'email') would be a ❌ Error — 'email' is not a key of the user shape
```

### Generic Constraints.

```typescript
// Constrain T to only types that have a .length property
function logLength<T extends { length: number }>(item: T): T {
  console.log(item.length);
  return item;
}

logLength("hello"); // ✅ string has .length
logLength([1, 2, 3]); // ✅ array has .length
logLength({ length: 5 }); // ✅ explicit length property
logLength(42); // ❌ Error — number has no .length

// keyof constraint — T must be a key of U
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Alice", email: "alice@example.com" };
getValue(user, "name"); // ✅ returns string
getValue(user, "id"); // ✅ returns number
getValue(user, "phone"); // ❌ Error — 'phone' does not exist on user
```

### Generic Interfaces and Types.

```typescript
// Generic interface — used for API responses, repositories, etc.
interface ApiResponse<T> {
  data:    T;
  status:  number;
  message: string;
}

interface PaginatedResponse<T> {
  data:       T[];
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

// Usage
const userResponse:    ApiResponse<User>                 = { data: alice, status: 200, message: 'OK' };
const productsPage:    PaginatedResponse<Product>        = { data: [...], page: 1, limit: 10, total: 50, totalPages: 5 };

// Generic type alias for common patterns
type Nullable<T>  = T | null;
type Optional<T>  = T | undefined;
type Maybe<T>     = T | null | undefined;
type Awaited<T>   = T extends Promise<infer U> ? U : T; // infer the resolved type
```

### Generic Classes.

```typescript
// A type-safe in-memory repository
class Repository<T extends { id: number }> {
  private items: T[] = [];

  add(item: T): T {
    this.items.push(item);
    return item;
  }

  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  findAll(): T[] {
    return [...this.items];
  }

  update(id: number, updates: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    this.items[index] = { ...this.items[index], ...updates };
    return this.items[index];
  }

  delete(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}

// Fully type-safe usage
const userRepo = new Repository<User>();
const productRepo = new Repository<Product>();

userRepo.add({
  id: 1,
  name: "Alice",
  email: "...",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
});
const found = userRepo.findById(1); // type: User | undefined
```

---

## 5. Implementing Interfaces.

Classes in TypeScript can implement interfaces, which forces them to provide all required members. This is useful for defining contracts that multiple classes must honour.

### Basic Class Implementation.

```typescript
interface Shape {
  area(): number;
  perimeter(): number;
  toString(): string;
}

class Circle implements Shape {
  constructor(private radius: number) {}

  area(): number {
    return Math.PI * this.radius ** 2;
  }
  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
  toString(): string {
    return `Circle(r=${this.radius})`;
  }
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number,
  ) {}

  area(): number {
    return this.width * this.height;
  }
  perimeter(): number {
    return 2 * (this.width + this.height);
  }
  toString(): string {
    return `Rectangle(${this.width}×${this.height})`;
  }
}

// Because both implement Shape, they can be used interchangeably
function printShapeInfo(shape: Shape): void {
  console.log(`${shape.toString()}: area=${shape.area().toFixed(2)}`);
}

printShapeInfo(new Circle(5));
printShapeInfo(new Rectangle(4, 6));
```

### Class Access Modifiers.

```typescript
class UserService {
  // public  → accessible from anywhere (default)
  // private → accessible only within this class
  // protected → accessible within this class and subclasses
  // readonly → cannot be reassigned after construction

  public readonly id: number;
  private hash: string;
  protected role: string;

  constructor(id: number, password: string, role: string) {
    this.id = id;
    this.hash = hashPassword(password); // sets private field
    this.role = role;
  }

  // Shorthand constructor parameter properties — same as above but less verbose
  // constructor(
  //   public readonly id: number,
  //   private hash: string,
  //   protected role: string
  // ) {}

  public getRole(): string {
    return this.role;
  }
  private getHash(): string {
    return this.hash;
  }
}

class AdminService extends UserService {
  constructor(id: number, password: string) {
    super(id, password, "admin");
  }

  canDeleteUsers(): boolean {
    return this.role === "admin"; // ✅ protected — accessible in subclass
  }
}
```

### Abstract Classes.

Abstract classes define shared behaviour for subclasses but cannot be instantiated directly.

```typescript
abstract class BaseRepository<T extends { id: number }> {
  protected items: T[] = [];

  // Concrete method — shared by all subclasses
  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  findAll(): T[] {
    return [...this.items];
  }

  // Abstract methods — each subclass MUST implement these
  abstract create(data: Omit<T, "id">): T;
  abstract validate(data: unknown): data is T;
}

class UserRepository extends BaseRepository<User> {
  private nextId = 1;

  create(data: Omit<User, "id">): User {
    const user: User = { id: this.nextId++, ...data };
    this.items.push(user);
    return user;
  }

  validate(data: unknown): data is User {
    return (
      typeof data === "object" &&
      data !== null &&
      "email" in data &&
      typeof (data as any).email === "string"
    );
  }

  findByEmail(email: string): User | undefined {
    return this.items.find((u) => u.email === email);
  }
}

// const repo = new BaseRepository(); // ❌ Error — cannot instantiate abstract class
const userRepo = new UserRepository(); // ✅
```

---

## 6. Type-Safe APIs.

This is where TypeScript pays off most clearly in backend development. You define types for your request bodies, response shapes and route parameters.

And any mismatch is caught before it reaches the user.

### Setting Up TypeScript with Express.

```bash
npm install express
npm install --save-dev @types/express @types/node tsx nodemon typescript
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Typed Request Bodies.

```typescript
import express, { Request, Response, NextFunction } from "express";

// Define the expected shape of request bodies
interface CreateUserBody {
  email: string;
  name: string;
  password: string;
}

interface UpdateUserBody {
  name?: string;
  email?: string;
}

// Type the Request with a generic parameter for the body
app.post(
  "/api/users",
  async (
    req: Request<{}, {}, CreateUserBody>,
    res: Response,
    next: NextFunction,
  ) => {
    // req.body is now typed as CreateUserBody
    const { email, name, password } = req.body;
    // TypeScript knows these are strings — autocompletion works
  },
);

// Route parameters and query strings
interface UserParams {
  id: string;
}
interface UserQuery {
  include?: string;
}

app.get(
  "/api/users/:id",
  async (req: Request<UserParams, {}, {}, UserQuery>, res: Response) => {
    const id = req.params.id; // string
    const include = req.query.include; // string | undefined
  },
);
```

### Typed Responses.

```typescript
// Define response shapes
interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  // password is intentionally absent — never send it
}

interface ErrorResponse {
  message: string;
  errors?: string[];
}

// A generic API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function that constructs typed responses
const sendSuccess = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ success: true, data } satisfies ApiResponse<T>);
};

const sendError = (res: Response, message: string, status = 400): void => {
  res
    .status(status)
    .json({ success: false, error: message } satisfies ApiResponse<never>);
};
```

### Typed Middleware.

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express's Request type to include our custom fields
// Declaration merging on the express namespace
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

interface JwtPayload {
  userId: number;
  role: "user" | "admin";
  iat: number;
  exp: number;
}

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
};
```

### Utility Types for API Development.

TypeScript ships with powerful built-in utility types that are extremely useful for API development.

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Partial<T> — makes all properties optional. Used for update payloads.
type UpdateUserDto = Partial<User>;
// { id?: number; email?: string; name?: string; ... }

// Required<T> — makes all properties required. Opposite of Partial.
type CompleteUser = Required<User>;

// Pick<T, K> — select only specific properties
type UserResponse = Pick<User, "id" | "email" | "name" | "role" | "createdAt">;
// { id: number; email: string; name: string; role: ...; createdAt: Date }
// password and updatedAt are excluded

// Omit<T, K> — remove specific properties
type CreateUserDto = Omit<User, "id" | "createdAt" | "updatedAt">;
// { email: string; name: string; password: string; role: ... }

// Readonly<T> — makes all properties readonly
type ImmutableUser = Readonly<User>;

// Record<K, V> — creates an object type with keys K and values V
type RolePermissions = Record<"user" | "admin", string[]>;
const permissions: RolePermissions = {
  user: ["read:posts", "create:comments"],
  admin: ["read:posts", "create:posts", "delete:posts", "manage:users"],
};

// ReturnType<T> — extracts the return type of a function
function createUser(data: CreateUserDto): User {
  /* ... */
}
type CreatedUser = ReturnType<typeof createUser>; // User

// Parameters<T> — extracts the parameter types as a tuple
type CreateUserParams = Parameters<typeof createUser>; // [CreateUserDto]

// NonNullable<T> — removes null and undefined from a union
type MaybeUser = User | null | undefined;
type DefiniteUser = NonNullable<MaybeUser>; // User
```

---

## 7. TypeScript with React.

React and TypeScript work together very naturally. You type props, state, refs, events and context.

All of the places where JavaScript lets values slip through without checking.

### Typing Component Props.

```typescript
import React, { FC } from 'react';

// Interface for component props
interface ButtonProps {
  label:     string;
  onClick:   () => void;
  variant?:  'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  children?: React.ReactNode;
}

// FC<Props> = FunctionComponent<Props>
const Button: FC<ButtonProps> = ({ label, onClick, variant = 'primary', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};

// Usage — TypeScript checks every prop
<Button label="Save" onClick={() => save()} />               // ✅
<Button label="Delete" onClick={() => {}} variant="danger" /> // ✅
<Button onClick={() => {}} />                                 // ❌ Error: label is required
<Button label="Save" onClick={() => {}} variant="purple" />   // ❌ Error: invalid variant
```

### Typing useState.

```typescript
import { useState } from "react";

// TypeScript infers the state type from the initial value
const [count, setCount] = useState(0); // count: number
const [name, setName] = useState(""); // name: string
const [active, setActive] = useState(false); // active: boolean

// When the initial value is null or undefined, you must provide the type
const [user, setUser] = useState<User | null>(null);
// Without the generic, TypeScript infers null and you can never set a User

const [products, setProducts] = useState<Product[]>([]);
// Without the generic, TypeScript infers never[] and you can't push Products

// Example with a complex state shape
interface FormState {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

const [form, setForm] = useState<FormState>({
  email: "",
  password: "",
  error: null,
  loading: false,
});

// Update one field without touching others
setForm((prev) => ({ ...prev, loading: true }));
```

### Typing Events.

```typescript
// React event types are generic on the HTML element
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
};

const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  // process form
};

const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
  e.stopPropagation();
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  if (e.key === 'Enter') submit();
};

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  const file = e.target.files?.[0]; // File | undefined
};

// In JSX — TypeScript infers the event type automatically
<input onChange={(e) => setEmail(e.target.value)} />
// e is inferred as React.ChangeEvent<HTMLInputElement>
```

### Typing useRef.

```typescript
import { useRef } from "react";

// Ref to a DOM element
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);

// Ref to a mutable value (not a DOM element)
const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
const countRef = useRef<number>(0);

// Usage
const focusInput = () => {
  inputRef.current?.focus(); // optional chain — current could be null before mount
};
```

### Typing useContext.

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user:   User | null;
  login:  (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with undefined as default (we'll check for it in the hook)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await loginApi(email, password);
    setUser(data.user);
  };

  const logout = (): void => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook with proper typing — throws if used outside provider
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; // TypeScript knows this is AuthContextType, not undefined
};
```

### Typing Custom Hooks.

```typescript
import { useState, useEffect } from "react";

// Return type annotation makes the hook's contract explicit
function useFetch<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: T = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// Usage
const { data: users, loading, error } = useFetch<User[]>("/api/users");
// data is User[] | null — TypeScript infers the type from the generic parameter
```

---

## 8. TypeScript with Node.

TypeScript on the backend gives you typed database results, typed environment variables, typed middleware chains and typed error handling.

All things that are painful to debug in plain JavaScript.

### Environment Variable Typing.

```typescript
// config/env.ts
// Validate and type all environment variables at startup.
// The app crashes immediately with a clear message if anything is missing.

interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  REDIS_URL: string;
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
}

function getEnv(): Env {
  const required = ["DATABASE_URL", "JWT_SECRET", "REDIS_URL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    REDIS_URL: process.env.REDIS_URL!,
    PORT: parseInt(process.env.PORT || "3000", 10),
    NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
  };
}

export const env = getEnv();
// After this, env.DATABASE_URL is string — TypeScript does NOT allow undefined
```

### Typed Prisma Queries.

Prisma generates TypeScript types automatically from your schema. You get full autocomplete and type safety on every query result.

```typescript
import { PrismaClient, User, Post, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Return type is inferred automatically
const getUser = async (id: number): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

// With select — Prisma generates a precise type for the subset of fields
const getUserSafe = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
    // TypeScript knows this returns: { id, email, name, role } — NOT password
  });
};
// return type: { id: number; email: string; name: string; role: Role } | null

// Prisma's generated input types
const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
  return prisma.user.create({ data });
};

const updateUser = async (
  id: number,
  data: Prisma.UserUpdateInput,
): Promise<User> => {
  return prisma.user.update({ where: { id }, data });
};

// Type the result of a complex query with include
type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { name: true; email: true } } };
}>;
// TypeScript knows exactly what shape this has
```

### Typed Error Handling.

```typescript
// A custom error class with a status code
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(msg: string) {
    super(msg, 404);
  }
}
class UnauthorizedError extends AppError {
  constructor(msg: string) {
    super(msg, 401);
  }
}
class ForbiddenError extends AppError {
  constructor(msg: string) {
    super(msg, 403);
  }
}
class ValidationError extends AppError {
  constructor(msg: string) {
    super(msg, 400);
  }
}

// Type-safe error handler in Express
import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res
        .status(409)
        .json({ success: false, message: "Record already exists" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
  }

  // Unknown errors
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
};
```

### Typing with Zod for Runtime Validation.

TypeScript types only exist at compile time. At runtime, user input is still untyped. Zod validates the shape of data at runtime and infers the TypeScript type from the schema.

The best of both worlds.

```typescript
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Define schema — this is both the validator AND the type source
const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role: z.enum(["user", "admin"]).default("user"),
});

// Infer the TypeScript type from the schema — no duplication
type CreateUserDto = z.infer<typeof CreateUserSchema>;
// { email: string; name: string; password: string; role: "user" | "admin" }

// Generic validation middleware — works with any Zod schema
const validate = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    req.body = result.data; // replace body with validated + parsed data
    next();
  };
};

// Usage
app.post("/api/users", validate(CreateUserSchema), async (req, res) => {
  const body: CreateUserDto = req.body; // fully typed, validated
  // TypeScript knows body.email is string, body.role is 'user' | 'admin'
});
```

---

## Assignment.

1. **Type-Safe REST API with Express and TypeScript.**

   **What you practice:**
   - `tsconfig.json` setup
   - typed Express request, response and route parameters
   - interfaces and type aliases for data shapes
   - `Omit` and `Partial` utility types for DTOs
   - custom `AppError` class
   - Zod validation with `z.infer<>` to derive TypeScript types
   - generic validate middleware
   - typed global error handler.

   **Requirements:**
   - Fully typed Express API for a `Book` resource: `id`, `title`, `author`, `genre`, `price` (number), `publishedYear` (number), `createdAt`.
   - Endpoints:
     - `POST /api/books` — validate body with Zod. Return `201` with the created book.
     - `GET /api/books` — return all books. Support `?genre=` and `?author=` query params (typed).
     - `GET /api/books/:id` — return one book. Throw a typed `NotFoundError` if not found.
     - `PUT /api/books/:id` — partial update using `Partial<CreateBookDto>`. Return updated book.
     - `DELETE /api/books/:id` — delete. Return `{ message: 'Book deleted' }`.
   - All errors handled by a typed global error handler that distinguishes `AppError` from unknown errors.
   - In-memory array as the data store — no database needed.

   [Solution](./Assignment/code1/)

   **POSTMAN Test Cases.**

   ```
   # 1. Create a book — success
   POST http://localhost:3000/api/books
   Body: { "title": "You Don't Know JS", "author": "Kyle Simpson", "genre": "programming", "price": 39.99, "publishedYear": 2015 }
   → 201  { success: true, data: { id: 4, title: "You Don't Know JS", ..., createdAt: "..." } }

   # 2. Validation failure — missing title
   POST http://localhost:3000/api/books
   Body: { "author": "Kyle Simpson", "price": 39.99, "publishedYear": 2015 }
   → 400  { success: false, message: "Validation failed", errors: [{ field: "title", message: "Title is required" }, { field: "genre", message: "..." }] }

   # 3. Validation failure — negative price
   POST http://localhost:3000/api/books
   Body: { "title": "Test", "author": "Test", "genre": "test", "price": -10, "publishedYear": 2020 }
   → 400  { errors: [{ field: "price", message: "Price cannot be negative" }] }

   # 4. Get all books
   GET http://localhost:3000/api/books
   → 200  { success: true, data: [ 4 books ] }

   # 5. Filter by genre
   GET http://localhost:3000/api/books?genre=programming
   → 200  { data: [ only programming books ] }

   # 6. Filter by author (partial match, case-insensitive)
   GET http://localhost:3000/api/books?author=tolkien
   → 200  { data: [ The Hobbit ] }

   # 7. Get one — found
   GET http://localhost:3000/api/books/1
   → 200  { success: true, data: { id: 1, title: "The Pragmatic Programmer", ... } }

   # 8. Get one — not found
   GET http://localhost:3000/api/books/9999
   → 404  { success: false, message: "Book not found" }

   # 9. Partial update — only price changes
   PUT http://localhost:3000/api/books/1
   Body: { "price": 39.99 }
   → 200  { data: { id: 1, title: "The Pragmatic Programmer", price: 39.99, ... } }

   # 10. Update — not found
   PUT http://localhost:3000/api/books/9999
   Body: { "price": 10 }
   → 404  { message: "Book not found" }

   # 11. Delete — success
   DELETE http://localhost:3000/api/books/4
   → 200  { success: true, message: "Book deleted" }

   # 12. Delete — already gone
   DELETE http://localhost:3000/api/books/4
   → 404  { message: "Book not found" }
   ```

2. **Type-Safe Express + Prisma API with Zod Validation and JWT Auth.**

   **What you practice:**
   - Prisma-generated model types
   - `declare global` to extend Express `Request`
   - typed JWT payload interface
   - `z.infer<>` for DTO types
   - `Omit<User, 'password'>` for safe responses
   - `PrismaClientKnownRequestError` error handling
   - `ReturnType<typeof fn>` to avoid type duplication
   - typed async middleware chains.

   **Requirements:**
   - Models: `User` (id, email, name, password, role enum USER/ADMIN, createdAt) and `Post` (id, title, body, published Boolean default false, views Int default 0, authorId FK, createdAt, updatedAt). Use Prisma.
   - Auth endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
   - Post endpoints: `POST /api/posts`, `GET /api/posts` (published only, `?search=`), `GET /api/posts/:id` (increment views), `PATCH /api/posts/:id/publish` (author only), `DELETE /api/posts/:id` (author only).

   [Solution](./Assignment/code2/)

   **POSTMAN Test Cases.**

   ```
   # 1. Register
   POST http://localhost:3000/api/auth/register
   Body: { "email": "alice@example.com", "name": "Alice", "password": "Secure123" }
   → 201  { success: true, data: { id: 1, email, name, role: "USER", createdAt } }
         (no password in response)

   # 2. Duplicate email
   POST http://localhost:3000/api/auth/register
   Body: { "email": "alice@example.com", "name": "Alice2", "password": "Secure123" }
   → 409  { message: "Email already in use" }

   # 3. Login
   POST http://localhost:3000/api/auth/login
   Body: { "email": "alice@example.com", "password": "Secure123" }
   → 200  { data: { accessToken: "eyJ..." } }  (copy it)

   # 4. Wrong password
   POST http://localhost:3000/api/auth/login
   Body: { "email": "alice@example.com", "password": "wrong" }
   → 401  { message: "Invalid credentials" }

   # 5. Get current user
   GET http://localhost:3000/api/auth/me
   Headers: Authorization: Bearer <accessToken>
   → 200  { data: { id: 1, email, name, role: "USER" } }

   # 6. No token
   GET http://localhost:3000/api/auth/me
   → 401  { message: "No token provided" }

   # 7. Create a post
   POST http://localhost:3000/api/posts
   Headers: Authorization: Bearer <accessToken>
   Body: { "title": "My TypeScript Journey", "body": "TypeScript is amazing..." }
   → 201  { data: { id: 1, published: false, views: 0, author: { name: "Alice" } } }

   # 8. Post validation failure
   POST http://localhost:3000/api/posts
   Headers: Authorization: Bearer <accessToken>
   Body: { "title": "" }
   → 400  { errors: [{ field: "title", message: "..." }, { field: "body", message: "..." }] }

   # 9. Get published posts — empty (post not published yet)
   GET http://localhost:3000/api/posts
   → 200  { data: [] }

   # 10. Publish the post
   PATCH http://localhost:3000/api/posts/1/publish
   Headers: Authorization: Bearer <accessToken>
   → 200  { data: { id: 1, published: true } }

   # 11. Get published posts — now appears
   GET http://localhost:3000/api/posts
   → 200  { data: [{ id: 1, title: "My TypeScript Journey", author: { name: "Alice" } }] }

   # 12. Search posts
   GET http://localhost:3000/api/posts?search=typescript
   → 200  { data: [ matching posts ] }

   # 13. Get one post — views increment
   GET http://localhost:3000/api/posts/1
   → 200  { data: { ..., views: 1 } }
   GET http://localhost:3000/api/posts/1
   → 200  { data: { ..., views: 2 } }

   # 14. Ownership check — register Bob, try to delete Alice's post
   POST /api/auth/register  Body: { "email": "bob@example.com", "name": "Bob", "password": "Secure123" }
   POST /api/auth/login     Body: { "email": "bob@example.com", "password": "Secure123" }
   DELETE http://localhost:3000/api/posts/1
   Headers: Authorization: Bearer <bob_token>
   → 403  { message: "You can only delete your own posts" }

   # 15. Alice deletes her own post
   DELETE http://localhost:3000/api/posts/1
   Headers: Authorization: Bearer <alice_token>
   → 200  { message: "Post deleted" }
   ```

3. **Generics, Discriminated Union Result Type and Advanced TypeScript Patterns.**

   **What you practice:**
   - Generic `Repository<T>` class
   - `Result<T>` discriminated union for error handling without exceptions
   - `withResult` async wrapper
   - `satisfies` operator for config validation
   - user-defined type guards (`isAppError`, `isValidStatus`)
   - `infer` keyword in conditional types
   - `AsyncReturnType<T>` utility type
   - Drizzle ORM in JavaScript with TypeScript wrapping everything else.

   **Requirements:**
   - Use Drizzle ORM with a JavaScript schema file (same pattern as Week-15 Assignment 3) but TypeScript for all application code.
   - Models: `users`, `products` (id, name, price, category, stock), `orders` (id, userId, total, status), `orderItems` (orderId, productId, quantity, price, name).
   - Implement a `Result<T>` discriminated union: `{ success: true; data: T } | { success: false; error: string; code: number }`.
   - Implement `withResult<T>(fn: () => Promise<T>): Promise<Result<T>>` — wraps any async function and catches errors.
   - Implement a generic `Repository<T extends { id: number }>` class where all methods return `Promise<Result<T>>`.
   - `POST /api/orders` — place an order. For each item check stock, decrement, snapshot price. Return `Result<Order>`.
   - `GET /api/dashboard` — revenue by month, top products, orders by status. All return `Result<DashboardData>`.
   - Type-safe env config using `satisfies`.
   - Type guards: `isAppError(e): e is AppError` and `isValidStatus(s): s is OrderStatus`.

   [Solution](./Assignment/code3/)

   **POSTMAN Test Cases.**

   ```
   # Setup: seed your DB first
   # psql -d week17_hard -c "INSERT INTO users (email, name) VALUES ('alice@example.com','Alice'),('bob@example.com','Bob');"
   # psql -d week17_hard -c "INSERT INTO products (name, price, category, stock) VALUES ('Laptop','999.99','electronics',10),('Phone','599.99','electronics',25),('T-Shirt','29.99','clothing',100);"

   # 1. Place a valid order
   POST http://localhost:3000/api/orders
   Body: { "userId": 1, "items": [{ "productId": 1, "quantity": 2 }, { "productId": 3, "quantity": 1 }] }
   → 201  {
       success: true,
       data: { id: 1, userId: 1, total: "2029.97", status: "PENDING",
               items: [{ name: "Laptop", price: "999.99", quantity: 2 }, { name: "T-Shirt", ... }] }
     }
     (Laptop stock: 10 → 8, T-Shirt stock: 100 → 99)

   # 2. Insufficient stock
   POST http://localhost:3000/api/orders
   Body: { "userId": 1, "items": [{ "productId": 1, "quantity": 9999 }] }
   → 400  { success: false, message: "Insufficient stock for Laptop. Available: 8" }

   # 3. Product not found
   POST http://localhost:3000/api/orders
   Body: { "userId": 1, "items": [{ "productId": 9999, "quantity": 1 }] }
   → 404  { success: false, message: "Product 9999 not found" }

   # 4. Zod validation — missing items array
   POST http://localhost:3000/api/orders
   Body: { "userId": 1 }
   → 400  { message: "Validation failed", errors: [{ field: "items", message: "Required" }] }

   # 5. Zod validation — negative quantity
   POST http://localhost:3000/api/orders
   Body: { "userId": 1, "items": [{ "productId": 1, "quantity": -1 }] }
   → 400  { errors: [{ field: "items.0.quantity", message: "Quantity must be a positive integer" }] }

   # 6. Dashboard — before any delivered orders
   GET http://localhost:3000/api/dashboard
   → 200  {
       success: true,
       data: {
         revenueByMonth: [],
         topProducts:    [],
         ordersByStatus: [{ status: "PENDING", count: 1 }]
       }
     }

   # 7. Update order to DELIVERED (via psql):
   #    UPDATE orders SET status = 'DELIVERED' WHERE id = 1;
   #    Then check dashboard:
   GET http://localhost:3000/api/dashboard
   → 200  {
       data: {
         revenueByMonth: [{ month: <current>, revenue: "2029.97", orders: 1 }],
         topProducts:    [{ name: "Laptop", total_sold: 2, total_revenue: "1999.98" }, ...],
         ordersByStatus: [{ status: "DELIVERED", count: 1 }]
       }
     }

   # 8. Place a second order
   POST http://localhost:3000/api/orders
   Body: { "userId": 2, "items": [{ "productId": 2, "quantity": 1 }] }
   → 201  { data: { total: "599.99", status: "PENDING", ... } }

   # 9. Dashboard with mixed statuses
   GET http://localhost:3000/api/dashboard
   → 200  {
       data: {
         ordersByStatus: [
           { status: "DELIVERED", count: 1 },
           { status: "PENDING",   count: 1 }
         ],
         revenueByMonth: [...] (only DELIVERED orders count — PENDING not included)
       }
     }
   ```
