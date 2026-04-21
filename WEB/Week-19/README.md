# List of things learned.

## 1. Component Architecture.

React applications are built from **components** i.e., independent, reusable pieces of UI that each manage their own logic and rendering.

Instead of one large HTML file, you compose your interface from many small, focused components, the same way you'd break a large function into smaller functions.

```
Traditional page                        React component tree
─────────────────────────              ─────────────────────────
One big HTML file with                  <App>
inline markup for header,                 <Navbar />
sidebar, product list,                    <Sidebar />
footer all mixed together                 <ProductList>
                                             <ProductCard />
                                             <ProductCard />
                                           </ProductList>
                                           <Footer />
                                         </App>
```

### Why Components.

```
Reusability     A <Button /> defined once can be used 50 times with different props.
Isolation       A bug in <ProductCard /> doesn't require understanding the whole app.
Testability     Each component can be tested independently of the rest of the UI.
Composability   Complex UIs are built by combining simple components, not by
                writing one increasingly tangled file.
```

### Creating a Project.

```bash
# Vite is the modern standard — much faster than create-react-app
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

```
my-app/
├── index.html          ← the single HTML page React mounts into
├── src/
│   ├── main.jsx         ← entry point — renders <App /> into the DOM
│   ├── App.jsx          ← root component
│   └── index.css
├── package.json
└── vite.config.js
```

### Your First Component.

```jsx
// A component is just a JavaScript function that returns JSX.
// Convention: PascalCase function name, one component per file.
function Welcome() {
  return <h1>Hello, world!</h1>;
}

// Components must start with a CAPITAL letter.
// React treats lowercase tags (<div>) as native HTML and
// capitalized tags (<Welcome />) as your own components.

export default Welcome;
```

```jsx
// main.jsx — mounting the root component
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Composing Components.

```jsx
// App.jsx
function Header() {
  return (
    <header>
      <h1>My Store</h1>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <p>© 2026 My Store</p>
    </footer>
  );
}

function App() {
  return (
    <div>
      <Header />
      <main>Page content goes here</main>
      <Footer />
    </div>
  );
}

export default App;
```

### Component File Organization.

```
A common pattern as an app grows:

src/
├── components/
│   ├── Button.jsx
│   ├── Card.jsx
│   └── Navbar.jsx
├── pages/
│   ├── HomePage.jsx
│   └── AboutPage.jsx
├── App.jsx
└── main.jsx

One component per file. Export it as the default export.
Name the file the same as the component for easy navigation.
```

---

## 2. JSX.

_JSX_ (JavaScript XML) is a syntax extension that lets you write HTML-like markup directly inside JavaScript.

It is not a string and not HTML. It compiles down to regular JavaScript function calls (`React.createElement`) that build a tree of objects describing your UI.

### JSX is JavaScript.

```jsx
// This JSX...
const element = <h1>Hello, world!</h1>;

// ...compiles to this JavaScript:
const element = React.createElement("h1", null, "Hello, world!");

// Because it's JavaScript, you can embed any expression inside { }
const name = "Alice";
const element = <h1>Hello, {name}!</h1>;

const element2 = <p>2 + 2 = {2 + 2}</p>;
```

### JSX Rules.

```jsx
// 1. Must return a SINGLE root element (or a Fragment)
// ❌ Invalid — two sibling elements with no wrapper
function Bad() {
  return (
    <h1>Title</h1>
    <p>Paragraph</p>
  );
}

// ✅ Wrapped in a div
function Good() {
  return (
    <div>
      <h1>Title</h1>
      <p>Paragraph</p>
    </div>
  );
}

// ✅ Or wrapped in a Fragment — renders no extra DOM element
function AlsoGood() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph</p>
    </>
  );
}

// 2. Use className instead of class (class is a reserved JS word)
<div className="container">...</div>

// 3. Use camelCase for most attributes
<button onClick={handleClick} tabIndex={0}>Click</button>
<label htmlFor="email">Email</label>

// 4. Self-close tags with no children
<img src="photo.jpg" alt="A photo" />
<input type="text" />
<br />

// 5. Every element in a list needs a unique 'key' prop (covered in section 6)
```

### Embedding Expressions.

```jsx
function Greeting({ user }) {
  return (
    <div>
      {/* Variables */}
      <h1>Welcome, {user.name}</h1>

      {/* Function calls */}
      <p>Joined {formatDate(user.createdAt)}</p>

      {/* Ternary for conditional content */}
      <span>{user.isOnline ? "Online" : "Offline"}</span>

      {/* Arithmetic */}
      <p>Total: ${(user.price * user.quantity).toFixed(2)}</p>

      {/* You CANNOT embed statements (if, for) directly — only expressions */}
      {/* ❌ {if (x) { return 'yes' }}  — invalid */}
      {/* ✅ {x ? 'yes' : 'no'}          — valid */}
    </div>
  );
}
```

### Inline Styles in JSX.

```jsx
// style takes a JS object, not a CSS string. Properties are camelCase.
function Box() {
  const boxStyle = {
    backgroundColor: "lightblue",
    padding: "16px",
    borderRadius: "8px",
    fontSize: 14, // numbers default to px
  };

  return <div style={boxStyle}>Styled box</div>;
}

// Inline for one-off cases
<div style={{ color: "red", fontWeight: "bold" }}>Warning</div>;
```

### Comments in JSX.

```jsx
function App() {
  return (
    <div>
      {/* This is a comment inside JSX — must be wrapped in { } */}
      <h1>Title</h1>
    </div>
  );
}
```

---

## 3. Props.

Props (short for "_properties_") are how data flows from a parent component into a child component.

They work like function arguments. Read-only from the receiving component's perspective.

### Passing and Receiving Props.

```jsx
// Parent passes props like HTML attributes
function App() {
  return <Greeting name="Alice" age={28} isAdmin={true} />;
}

// Child receives them as a single object, conventionally destructured
function Greeting({ name, age, isAdmin }) {
  return (
    <div>
      <p>
        Hello, {name}! You are {age} years old.
      </p>
      {isAdmin && <span>Admin</span>}
    </div>
  );
}

// Equivalent without destructuring (less common, more verbose)
function Greeting(props) {
  return <p>Hello, {props.name}!</p>;
}
```

### Props are Read-Only.

```jsx
function Greeting({ name }) {
  name = "Bob"; // ❌ NEVER mutate props — React treats this as a bug
  return <p>Hello, {name}</p>;
}

// Props flow ONE WAY: parent → child.
// A child can never directly change a prop it received.
// If a child needs to "change" data, the PARENT must own that state
// and pass a function down as a prop (covered in section 5).
```

### Default Props and Optional Props.

```jsx
// Default values via destructuring — cleaner than the old defaultProps API
function Button({ label, variant = 'primary', disabled = false }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled}>
      {label}
    </button>
  );
}

<Button label="Save" />                       // variant defaults to 'primary'
<Button label="Delete" variant="danger" />     // overrides default
```

### The `children` Prop.

```jsx
// Anything placed BETWEEN a component's opening and closing tags
// is automatically passed as the special 'children' prop.
function Card({ children }) {
  return <div className="card">{children}</div>;
}

// Usage — composition pattern
<Card>
  <h2>Title</h2>
  <p>Some content inside the card.</p>
</Card>;

// This is how generic wrapper components (Modal, Layout, Card) are built —
// they don't need to know WHAT content goes inside, only how to wrap it.
```

### Spreading Props.

```jsx
// Spread an object as individual props — useful for passing through many props
const userProps = { name: "Alice", age: 28, role: "admin" };
<UserCard {...userProps} />;
// equivalent to: <UserCard name="Alice" age={28} role="admin" />

// Common pattern: accept and forward extra props to the underlying element
function Input({ label, ...rest }) {
  return (
    <div>
      <label>{label}</label>
      <input {...rest} /> {/* forwards type, placeholder, onChange, etc. */}
    </div>
  );
}

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  onChange={handleChange}
/>;
```

### Prop Drilling (and Why It's a Problem).

```jsx
// Passing props through many layers of components that don't use
// the data themselves, just to get it to a deeply nested child.
function App() {
  const user = { name: "Alice" };
  return <Layout user={user} />;
}
function Layout({ user }) {
  return <Sidebar user={user} />; // Layout doesn't use 'user' itself
}
function Sidebar({ user }) {
  return <UserProfile user={user} />; // Sidebar doesn't use 'user' itself
}
function UserProfile({ user }) {
  return <p>{user.name}</p>; // Finally used here, 3 levels deep
}

// This works but becomes unmanageable as apps grow.
// The fix (Context API, state management libraries) is covered in Week-20.
```

---

## 4. useState.

`useState` is a React Hook that lets a component hold and update its own data over time.

When state changes, React automatically re-renders the component to reflect the new value.

### Basic Usage.

```jsx
import { useState } from "react";

function Counter() {
  // useState returns a pair: [currentValue, setterFunction]
  // The argument (0) is the INITIAL value, used only on the first render
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### State is Isolated Per Component Instance.

```jsx
function App() {
  return (
    <div>
      <Counter /> {/* Has its own independent count */}
      <Counter />{" "}
      {/* Has its own independent count — totally separate from the first */}
    </div>
  );
}
// Clicking +1 on the first Counter does NOT affect the second.
// Each rendered instance of a component gets its own state.
```

### Updating State Based on Previous State.

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ Risky with rapid clicks or batched updates — 'count' may be stale
  const incrementBad = () => setCount(count + 1);

  // ✅ Functional update — React guarantees 'prev' is the LATEST state value
  const incrementGood = () => setCount((prev) => prev + 1);

  // This matters a lot when calling the setter multiple times in a row:
  const incrementByThree = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    // Result: +3 total, because each call sees the previous call's result
  };

  const incrementByThreeBroken = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    // Result: +1 total! All three reference the SAME stale 'count' from this render.
  };

  return <button onClick={incrementByThree}>+3</button>;
}
```

### State with Objects and Arrays.

```jsx
// State updates REPLACE the value — they do not merge automatically like
// the old class-component setState did. You must spread the previous state.

function ProfileForm() {
  const [profile, setProfile] = useState({ name: '', email: '', bio: '' });

  const updateName = (newName) => {
    // ❌ Mutating state directly — React won't detect this as a change
    // profile.name = newName;

    // ✅ Create a NEW object, spreading the old fields, overriding just one
    setProfile(prev => ({ ...prev, name: newName }));
  };

  return (
    <input
      value={profile.name}
      onChange={(e) => updateName(e.target.value)}
    />
  );
}

// Arrays follow the same immutability rule
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    // ✅ Spread the old array, add the new item — never .push() directly
    setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
  };

  const removeTodo = (id) => {
    // ✅ Filter creates a new array
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id) => {
    // ✅ Map creates a new array, replacing just the matching item
    setTodos(prev =>
      prev.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo)
    );
  };

  return (/* render todos */);
}
```

### Lazy Initial State.

```jsx
// If computing the initial value is expensive, pass a FUNCTION instead of
// the value itself. React only calls it once, on the first render.

// ❌ This runs on EVERY render, even though the result is only used once
const [data, setData] = useState(expensiveComputation());

// ✅ This only runs ONCE
const [data, setData] = useState(() => expensiveComputation());
```

---

## 5. Event Handling.

React wraps native browser events in a cross-browser-consistent **SyntheticEvent** system.

The API closely mirrors standard DOM events but with camelCase naming.

### Basic Event Handlers.

```jsx
function Button() {
  const handleClick = () => {
    console.log("Button clicked!");
  };

  // Pass the FUNCTION REFERENCE, not the result of calling it
  return <button onClick={handleClick}>Click me</button>;

  // ❌ This calls handleClick immediately on every render, not on click
  // return <button onClick={handleClick()}>Click me</button>;
}
```

### Passing Arguments to Handlers.

```jsx
function ProductList({ products, onDelete }) {
  return (
    <ul>
      {products.map((product) => (
        // Wrap in an arrow function to pass arguments
        <li key={product.id}>
          {product.name}
          <button onClick={() => onDelete(product.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

### Common Event Types.

```jsx
function Form() {
  const handleChange = (e) => console.log(e.target.value);
  const handleSubmit = (e) => {
    e.preventDefault(); // stops the default full-page form submission/reload
    console.log("submitted");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") console.log("Enter pressed");
  };
  const handleFocus = () => console.log("input focused");
  const handleBlur = () => console.log("input lost focus");
  const handleMouseEnter = () => console.log("mouse entered");

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <div onMouseEnter={handleMouseEnter}>Hover me</div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Controlled Form Inputs.

```jsx
// A "controlled" input means React state is the single source of truth
// for the input's value — the DOM never holds its own independent value.

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email} // value comes FROM state
        onChange={(e) => setEmail(e.target.value)} // changes flow BACK to state
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log in</button>
    </form>
  );
}

// Why "controlled"? Because every keystroke updates state, and the
// input's displayed value is always whatever state currently holds.
// This makes validation, formatting, and conditional logic trivial.
```

### Event Object Properties.

```jsx
function handleClick(e) {
  e.preventDefault(); // prevent default browser behavior
  e.stopPropagation(); // stop the event from bubbling to parent handlers
  console.log(e.target); // the DOM element that triggered the event
  console.log(e.type); // 'click', 'change', 'submit', etc.
}
```

---

## 6. Conditional Rendering.

JSX has no `if` statement built in (it only accepts expressions), so conditional rendering relies on JavaScript expressions that evaluate to either a renderable value or nothing.

### Ternary Operator.

```jsx
function Status({ isOnline }) {
  return <span>{isOnline ? "🟢 Online" : "⚫ Offline"}</span>;
}

function Greeting({ user }) {
  return (
    <div>
      {user ? <h1>Welcome back, {user.name}</h1> : <h1>Please log in</h1>}
    </div>
  );
}
```

### Logical AND (&&), Render Something or Nothing.

```jsx
function Notification({ count }) {
  return (
    <div>
      {/* Renders the badge ONLY if count > 0. Renders nothing otherwise. */}
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  );
}

// ⚠️ Common pitfall: if count is 0 (falsy but not boolean),
// React renders the literal number 0 on the page!
{
  count && <Badge count={count} />;
} // ❌ renders "0" if count is 0
{
  count > 0 && <Badge count={count} />;
} // ✅ always evaluates to a boolean
```

### If/Else with Early Returns.

```jsx
// For more complex conditional logic, return early from the component function
function UserProfile({ user, loading, error }) {
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!user) {
    return <p>No user found.</p>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Switch-Like Patterns.

```jsx
function StatusBadge({ status }) {
  const statusConfig = {
    pending: { label: "Pending", color: "yellow" },
    active: { label: "Active", color: "green" },
    cancelled: { label: "Cancelled", color: "red" },
  };

  // Object lookup is often cleaner than a long if/else or switch chain
  const config = statusConfig[status] ?? { label: "Unknown", color: "gray" };

  return <span style={{ color: config.color }}>{config.label}</span>;
}
```

### Rendering Lists Conditionally.

```jsx
function ProductList({ products }) {
  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

---

## 7. Lists & Keys.

Rendering a list of elements in React requires transforming an array of data into an array of JSX elements and each element needs a special `key` prop so React can track it across re-renders.

### Basic List Rendering with `.map()`.

```jsx
function ProductList({ products }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} — ${product.price}
        </li>
      ))}
    </ul>
  );
}

const products = [
  { id: 1, name: "Laptop", price: 999 },
  { id: 2, name: "Phone", price: 599 },
];
```

### Why Keys Matter.

```
React uses 'key' to match elements between renders — it's how React knows
"this is the SAME item, just possibly in a new position" versus
"this is a brand new item that needs to be created."

Without stable keys, React may:
  - Re-render more elements than necessary (performance cost)
  - Lose internal state of list items when their position changes
  - Mismatch which DOM node corresponds to which data item

Keys must be:
  Unique among siblings (not globally unique — only within that list)
  Stable across re-renders (don't generate a new key on every render)
```

### The Index-as-Key Anti-Pattern.

```jsx
// ❌ Using the array index as a key — works but breaks down when the
// list can be reordered, filtered, or items can be inserted/removed
{
  todos.map((todo, index) => <TodoItem key={index} todo={todo} />);
}

// Problem scenario: if you delete the FIRST item in the list,
// every remaining item's index shifts down by one. React thinks
// the item AT each index changed (rather than one being removed),
// which can cause stale form input values or animation glitches
// to appear attached to the wrong items.

// ✅ Use a stable, unique identifier from the data itself
{
  todos.map((todo) => <TodoItem key={todo.id} todo={todo} />);
}

// Index-as-key is acceptable ONLY when:
//   The list is static and never reordered, filtered, or modified
//   The items have no state and no input fields
```

### Filtering and Sorting Before Rendering.

```jsx
function TodoList({ todos, filter }) {
  const filteredTodos = todos
    .filter((todo) => filter === "all" || todo.status === filter)
    .sort((a, b) => a.createdAt - b.createdAt);

  return (
    <ul>
      {filteredTodos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### Rendering Nested Lists.

```jsx
function CategoryList({ categories }) {
  return (
    <div>
      {categories.map((category) => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          <ul>
            {category.products.map((product) => (
              // Keys only need to be unique among SIBLINGS — this inner
              // list's keys don't need to be globally unique across categories
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

---

## 8. Basic SPA Understanding.

A **Single Page Application (SPA)** loads one HTML page and then dynamically rewrites the content as the user interacts with it.

No full page reloads between "_pages_."

### Traditional Multi-Page App vs SPA.

```
Traditional Multi-Page App
  User clicks a link → browser requests a NEW HTML page from the server
  → entire page reloads → all JS/CSS re-downloaded and re-executed
  → state is LOST between pages unless persisted (cookies, localStorage)

Single Page Application
  User clicks a link → JavaScript intercepts the click → updates the URL
  via the History API → swaps out the rendered components → NO server
  round-trip for the page itself (only data is fetched via API calls)
  → state can persist seamlessly across "pages" → feels instant
```

### How React Enables This.

```
1. The browser loads ONE index.html containing a single empty <div id="root">.
2. React takes over rendering everything inside that div.
3. When "navigating," React swaps which COMPONENTS are rendered —
   no new HTML document is requested from the server.
4. The URL is updated using the browser's History API (pushState),
   making the back/forward buttons work correctly without a real navigation.
5. Data needed for each "page" is fetched asynchronously via fetch()/axios
   calls to a backend API — separate from the page navigation itself.
```

### A Minimal Hand-Rolled "Router" (Before Learning React Router).

This demonstrates the CONCEPT of SPA navigation using only `useState`, React Router (Week-20) automates and improves on this pattern.

```jsx
import { useState } from "react";

function HomePage() {
  return <h1>Home</h1>;
}
function AboutPage() {
  return <h1>About</h1>;
}
function ContactPage() {
  return <h1>Contact</h1>;
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div>
      <nav>
        <button onClick={() => setCurrentPage("home")}>Home</button>
        <button onClick={() => setCurrentPage("about")}>About</button>
        <button onClick={() => setCurrentPage("contact")}>Contact</button>
      </nav>
      <main>{renderPage()}</main>
    </div>
  );
}

// Limitations of this approach (which React Router solves):
//   The URL never changes — refreshing always lands on 'home'
//   No browser back/forward button support
//   No deep-linking (can't share a URL to a specific "page")
//   No nested routes or URL parameters
```

### Why the API Layer Matters in an SPA.

```jsx
// In an SPA, your React app and your backend API are two SEPARATE applications
// communicating over HTTP — typically as JSON. This is different from
// traditional server-rendered apps where the server returns full HTML pages.

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}

// useEffect (data fetching, side effects) and React Router (real navigation)
// are both covered in depth in Week-20 — ReactJS (Advanced).
```

---

## Assignment.

1. **Interactive Profile Card with Props and State.**

   **What you practice:**
   - Component composition
   - passing and destructuring props
   - `useState` for toggling UI state
   - conditional rendering with ternary and `&&`
   - controlled form inputs
   - the `children` prop for a reusable wrapper component.

   **Requirements:**
   - Build a `ProfileCard` component that receives `name`, `role`, `avatarEmoji`, and `bio` as props.
   - The card has a "Follow" button that toggles between "Follow" and "Following" when clicked, and changes color accordingly (gray when not following, blue when following).
   - Display a follower count that starts at a given number and increments by 1 when "Follow" is clicked, decrements by 1 when un-followed (clicking "Following" again).
   - Add an expandable "Show more" / "Show less" toggle that reveals or hides the `bio` text.
   - Build a generic `Card` wrapper component (using the `children` prop) that `ProfileCard` is rendered inside of, giving it a consistent border, padding, and shadow.
   - Render 3 different `ProfileCard` instances in `App.jsx` with different props, proving state is isolated per instance (following one card must not affect the others).

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   # 1. Initial load
   npm run dev → open http://localhost:5173
   → 3 profile cards render with the correct name, role, avatar emoji, and follower counts
   (Alice: 128, Bob: 94, Carol: 210).
   → All 3 "Follow" buttons are gray and say "Follow".
   → Alice and Bob's bios are truncated with a "Show more" link (bios > 60 chars).
   → Carol's bio is short — no "Show more" link appears (bio ≤ 60 chars).

   # 2. Follow button toggle
   Click "Follow" on Alice's card.
   → Button turns blue, text changes to "Following".
   → Alice's follower count increases from 128 to 129.
   Click "Following" on Alice's card again.
   → Button turns gray, text changes back to "Follow".
   → Follower count decreases back to 128.

   # 3. State isolation between cards
   Click "Follow" on Alice's card only.
   → Bob's and Carol's buttons remain unaffected — still gray, still "Follow",
   their follower counts unchanged. Proves each ProfileCard instance has
   fully independent state.

   # 4. Bio expand/collapse
   Click "Show more" on Alice's bio.
   → Full bio text is now displayed, link changes to "Show less".
   Click "Show less".
   → Bio truncates back to the first 60 characters + "...".

   # 5. Multiple simultaneous interactions
   Follow Alice, follow Bob, expand Alice's bio, expand Bob's bio.
   → All 4 changes apply independently and correctly — Alice following+expanded,
   Bob following+expanded, Carol untouched.
   ```

2. **Todo List with Filtering, Local Storage and Inline Editing.**

   **What you practice:**
   - `useState` with arrays of objects
   - immutable array updates (map/filter/spread, never mutate)
   - controlled inputs for adding and editing
   - conditional rendering for filter views
   - list rendering with stable keys
   - `useEffect` for syncing state to `localStorage` (a light preview of Week-20, but simple enough to use here)
   - event handling including Enter-key submission
   - computing derived values (counts) from state without storing them separately.

   **Requirements:**
   - Build a Todo app with: an input + "Add" button to create todos (also submit on Enter key), a checkbox to mark each todo done/not done, a delete button per todo, and inline editing (double-click a todo's text to turn it into an editable input; save on blur or Enter, cancel on Escape).
   - Add filter buttons: "All", "Active", "Completed" — clicking filters the visible list without losing the underlying data.
   - Show a live count of remaining active todos (e.g. "3 items left") that updates automatically — do NOT store this count in its own state; derive it from the todos array on every render.
   - Persist todos to `localStorage` so they survive a page refresh. Load any existing todos on initial mount.
   - Add a "Clear completed" button that removes all completed todos at once.
   - Prevent adding an empty or whitespace-only todo.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   # 1. Adding a todo
   Type "Buy groceries" and press Enter (or click Add).
   → New todo appears in the list, unchecked.
   → Input clears itself.
   → "1 item left" shown at the bottom.

   # 2. Rejecting empty todos
   Leave the input empty (or type only spaces) and click Add.
   → Nothing is added — no empty/whitespace todo appears in the list.

   # 3. Toggling completion
   Click the checkbox next to "Buy groceries".
   → Text gets a strikethrough, turns gray.
   → "0 items left" now shown.
   → "Clear completed (1)" button appears at the bottom.

   # 4. Filtering
   Add 2 more todos ("Walk the dog", "Read a book"). Mark "Buy groceries" done.
   Click "Active" filter.
   → Only "Walk the dog" and "Read a book" are visible (done items hidden).
   Click "Completed" filter.
   → Only "Buy groceries" is visible.
   Click "All" filter.
   → All 3 todos visible again.

   # 5. Inline editing
   Double-click on "Walk the dog" text.
   → It turns into an editable input field, focused automatically.
   Change the text to "Walk the dog twice" and press Enter.
   → Input reverts to text display showing the updated text.
   Double-click again, change the text, then press Escape instead of Enter.
   → Edit is cancelled — original text "Walk the dog twice" remains unchanged.
   Double-click again, change the text, then click elsewhere (blur).
   → Edit is saved (blur also triggers save, same as Enter).

   # 6. Deleting a todo
   Click the × button next to "Read a book".
   → It's immediately removed from the list. Item count updates accordingly.

   # 7. Clear completed
   With at least one completed todo present, click "Clear completed (N)".
   → All completed todos disappear at once. Active todos remain untouched.
   → The "Clear completed" button itself disappears once there are 0 completed todos.

   # 8. Persistence across refresh
   Add a few todos, mark some done, refresh the browser page (F5).
   → All todos and their done/not-done state are restored exactly as they were
   before the refresh — proving localStorage persistence works.

   # 9. Derived count correctness
   With 3 todos, mark 2 done.
   → "1 item left" is shown — this count was never stored as its own state,
   it was recalculated fresh from the todos array on this render.
   ```

3. **Multi-Step Checkout Wizard with Validation and Derived Cart State.**

   **What you practice:**
   - Complex multi-component state lifted to a single parent (a preview of "lifting state up," covered fully in Week-20)
   - controlled multi-field forms with per-field validation and error messages
   - conditional step rendering (a wizard/stepper UI) without a router
   - derived totals computed from cart state on every render
   - array immutability with nested updates (updating quantity inside an array of cart items)
   - disabling navigation until the current step is valid
   - a confirmation screen assembled entirely from previously collected state.

   **Requirements:**
   - Build a 3-step checkout wizard: **Step 1 — Cart Review**, **Step 2 — Shipping Info**, **Step 3 — Payment & Confirm**. Only one step is visible at a time; a progress indicator at the top shows which step is active.
   - **Step 1 (Cart):** Show a list of cart items (predefine 3–4 products in a starter array with `id`, `name`, `price`, `quantity`). Each item has +/- buttons to adjust quantity (minimum 1, no upper limit) and a remove button. Show a running subtotal, a flat shipping fee of $5.99 (waived if subtotal ≥ $50), and a total — all computed as derived values, never stored as separate state. Disable "Next" if the cart is empty.
   - **Step 2 (Shipping):** A form with fields: full name, address, city, postal code, phone. Validate on blur (not on every keystroke) — required, postal code must be exactly 5 digits, phone must be exactly 10 digits. Show inline error messages under invalid fields. Disable "Next" until all fields are valid. Include a "Back" button that returns to Step 1 without losing cart state.
   - **Step 3 (Payment & Confirm):** A simplified card form (card number, expiry, CVV — formatting/validation can be simple: card number 16 digits, expiry as `MM/YY` pattern, CVV 3 digits). Show an order summary recapping the cart items, shipping address, and total from the previous steps. A "Place Order" button that, once clicked, replaces the entire wizard with a final "Order Confirmed" screen showing an order number (generate with `Date.now()`) and the total paid.
   - State for the cart, shipping info, and payment info must all live in the top-level `App` component and be passed down as props — demonstrating why "lifting state up" becomes necessary once multiple steps/components need to share and update the same data.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   # 1. Initial load — Cart step
   npm run dev → open http://localhost:5173
   → Stepper shows step 1 (Cart) highlighted in blue.
   → 3 cart items render: Wireless Headphones (qty 1), Mechanical Keyboard (qty 1),
   USB-C Hub (qty 2).
   → Subtotal = 89.99 + 129.99 + (34.99 × 2) = 289.96
   → Subtotal ≥ $50 → Shipping shows $0.00 ("Free over $50").
   → Total = $289.96.

   # 2. Quantity controls
   Click "+" on Wireless Headphones.
   → Quantity becomes 2, cart item total updates to $179.98, subtotal and
   total recalculate automatically (derived, not separately stored).
   Click "−" on USB-C Hub twice (quantity 2 → 1 → can't go below 1, button
   effectively has no further effect at quantity 1 since Math.max(1, ...) caps it).
   → Quantity stays at 1 minimum, never goes to 0 or negative.

   # 3. Removing items / empty cart
   Remove all 3 items one by one using "Remove".
   → After the last removal, "Your cart is empty." message appears.
   → "Next: Shipping" button is disabled (grayed out, not clickable).
   Refresh the page to reset to the initial cart for the next tests.

   # 4. Moving to Shipping step
   With items still in the cart, click "Next: Shipping".
   → Stepper updates: step 1 circle shows a checkmark (completed),
   step 2 circle is now blue (active).
   → Shipping form renders with 5 empty fields, no errors visible yet.

   # 5. Validation — required fields
   Click into the "Full Name" field, then click out without typing anything (blur).
   → "This field is required" appears under Full Name in red, input gets a red border.
   → "Next: Payment" remains disabled.

   # 6. Validation — postal code format
   Type "abc" in Postal Code, then blur.
   → Error: "Postal code must be exactly 5 digits".
   Correct it to "10001", blur again.
   → Error disappears, field border returns to normal.

   # 7. Validation — phone format
   Type "12345" in Phone, blur.
   → Error: "Phone must be exactly 10 digits".
   Correct it to "5551234567".
   → Error clears.

   # 8. Completing Shipping step
   Fill all 5 fields with valid values (Full Name: "Alice Johnson",
   Address: "123 Main St", City: "New York", Postal Code: "10001",
   Phone: "5551234567").
   → Once the LAST field becomes valid, "Next: Payment" becomes enabled.
   Click "Back".
   → Returns to Cart step. Cart items and quantities are exactly as left —
   nothing was lost by navigating backward (state lives in App, not the step).
   Click "Next: Shipping" again.
   → All previously entered shipping values are still filled in
   (shippingInfo state persisted in App, not reset by re-rendering the step).
   Click "Next: Payment".

   # 9. Payment step — order summary accuracy
   → Order Summary section shows the EXACT cart items/quantities from step 1
   and the EXACT shipping address from step 2, including the correct total.

   # 10. Validation — card fields
   Type "1234" in Card Number, blur.
   → Error: "Card number must be exactly 16 digits".
   Correct to "1234567890123456".
   Type "13/99" in Expiry, blur.
   → Error: "Expiry must be in MM/YY format" (month 13 is invalid).
   Correct to "12/27".
   Type "12" in CVV, blur.
   → Error: "CVV must be exactly 3 digits".
   Correct to "123".
   → "Place Order" button becomes enabled only once all 3 fields are valid.

   # 11. Placing the order
   Click "Place Order".
   → The entire wizard (stepper + steps) is replaced by the Confirmation screen.
   → A unique order number is shown (a large timestamp-based number).
   → The total charged matches exactly what was shown in the Payment step summary.

   # 12. State isolation sanity check
   Throughout the whole flow, confirm cart quantities adjusted in Step 1 are
   correctly reflected in the Step 3 order summary, and shipping info entered
   in Step 2 is correctly reflected in both the Step 3 summary AND nowhere
   duplicated or recreated — proving the lifted state in App is the single
   source of truth for the entire wizard.
   ```
