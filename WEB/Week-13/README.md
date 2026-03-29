# List of things learned.

## 1. NoSQL vs SQL.

Before we write a single line of MongoDB code, it is worth understanding the decision you are making when you choose it.

- **SQL (Relational Databases)** : Like PostgreSQL or MySQL store data in tables. (rows & columns)

  Every row in a table must conform to a fixed schema. Relationships between tables are enforced by the database itself through foreign keys.

- **NoSQL (Non-Relational Databases)** : Like MongoDB store data as documents — flexible, JSON-like objects that can have different shapes.

  There is no enforced schema at the database level. Each document can have different fields.

```
SQL — a Users table:

 id  | email              | age
-----|--------------------|-----
  1  | alice@example.com  |  28
  2  | bob@example.com    |  34

NoSQL — a users collection (MongoDB):

{ "_id": ObjectId("..."), "email": "alice@example.com", "age": 28, "preferences": { "theme": "dark" } }
{ "_id": ObjectId("..."), "email": "bob@example.com",   "age": 34, "verified": true }
// Two documents — completely different shapes — valid in MongoDB.
```

### Core Differences.

```
Aspect             SQL                              NoSQL (MongoDB)
---------          ----------------------------     ------------------------------------
Data model         Tables (rows & columns)          Documents (JSON/BSON)
Schema             Fixed, enforced by DB            Flexible, enforced by your app code
Relationships      JOINs between tables             Embedding or referencing documents
Scaling            Vertical (bigger machines)       Horizontal (more machines — sharding)
Transactions       Full ACID out of the box         Supported, but document design often avoids them
Best for           Complex relationships, finance   Flexible schemas, rapid iteration, nested data
```

### When to Choose MongoDB.

- Choose **MongoDB** when your data is naturally document-shaped (e.g. a blog post with nested comments and tags), when your schema is likely to evolve quickly, or when you are building a prototype.

- Choose **PostgreSQL** when relationships between entities are complex, when financial accuracy and ACID transactions are mandatory, or when your data is highly structured and unlikely to change.

> **The real answer:** Most modern applications use both. A relational DB for user accounts and financial records, MongoDB for product catalogues, user activity feeds, or anything with highly variable structure.

---

## 2. MongoDB Installation.

### What is MongoDB?

MongoDB is a document-oriented database. It stores data as **BSON** (Binary JSON). A binary-encoded format that extends JSON with additional types like `Date`, `ObjectId` and `Decimal128`.

The three levels of organisation in MongoDB:

```
Database    → a named container of collections. Like a PostgreSQL "database".
Collection  → a group of related documents. Like a SQL "table".
Document    → a single JSON-like record. Like a SQL "row".
```

### Local Installation.

**macOS (using Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu / Debian:**

```bash
# Import the public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add the repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt update
sudo apt install -y mongodb-org

# Start the service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**

Download the [MSI installer](https://www.mongodb.com/try/download/community) and run it.

MongoDB Compass (a GUI) is bundled with the installer.

Install it, it is useful.

### Verify the Installation.

```bash
mongosh
# You should see a prompt like:   test>
# Type:
db.runCommand({ connectionStatus: 1 })
# You should see:  { ok: 1 }
```

### MongoDB Atlas (Cloud, Recommended for Projects).

For any project you deploy, use **MongoDB Atlas**, MongoDB's managed cloud service.

The free tier (M0) is permanent and sufficient for learning and side projects.

```
1. Go to https://www.mongodb.com/atlas
2. Create a free account.
3. Create a free M0 cluster (512 MB storage, shared).
4. Under "Database Access", create a user with a username and password.
5. Under "Network Access", add your IP (or 0.0.0.0/0 for development).
6. Click "Connect" → "Connect your application" → copy the connection string.
   It looks like: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mydb
```

### Connecting with Mongoose (Node.js).

Mongoose is the most popular _Object Document Mapper_ (ODM) for MongoDB in Node.js.

It adds schema validation, middleware hooks and a cleaner query API on top of the raw MongoDB driver.

```bash
npm install mongoose
```

```javascript
// db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit the process — the app cannot run without a DB connection
  }
};

module.exports = connectDB;

// server.js
require("dotenv").config();
const connectDB = require("./db");

connectDB(); // Connect before starting the server
```

```
# .env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mydb
```

---

## 3. CRUD Operations.

CRUD stands for **Create, Read, Update, Delete**.

The four fundamental operations on any database.

First, we need a **schema** and a **model**.

- A Mongoose schema defines the shape of documents in a collection.

- A model is the class you use to interact with that collection.

```javascript
// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    age: { type: Number, min: 0, max: 120 },
    isActive: { type: Boolean, default: true },
    tags: [String], // an array of strings
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  },
);

const User = mongoose.model("User", userSchema);
// 'User' → Mongoose will use the collection 'users' (lowercase, pluralised)

module.exports = User;
```

### CREATE (Adding Documents).

```javascript
const User = require("./models/User");

// Method 1: create() — the most common approach
const newUser = await User.create({
  name: "Alice",
  email: "alice@example.com",
  age: 28,
  tags: ["developer", "designer"],
});
console.log(newUser._id); // MongoDB auto-generates a unique ObjectId

// Method 2: new + save() — useful when you need to modify before saving
const user = new User({ name: "Bob", email: "bob@example.com" });
user.age = 34; // modify before saving
await user.save();

// Inserting many documents at once
await User.insertMany([
  { name: "Carol", email: "carol@example.com" },
  { name: "Dave", email: "dave@example.com" },
]);
```

### READ (Querying Documents).

```javascript
// Find all documents in the collection
const allUsers = await User.find();

// Find with a filter — all active users
const activeUsers = await User.find({ isActive: true });

// Find with multiple conditions (implicit AND)
const youngActive = await User.find({ isActive: true, age: { $lt: 30 } });

// Find one document (returns null if not found)
const alice = await User.findOne({ email: "alice@example.com" });

// Find by MongoDB's ObjectId
const user = await User.findById("64a1b2c3d4e5f6a7b8c9d0e1");

// Select specific fields (projection)
const emails = await User.find({}, "name email -_id");
// 'name email' — include only these fields
// '-_id'        — exclude _id

// Query operators
const users = await User.find({
  age: { $gte: 18, $lte: 65 }, // greater than or equal, less than or equal
  name: { $ne: "Admin" }, // not equal
  tags: { $in: ["developer"] }, // array contains at least one of these
});

// Chaining methods — sorting, limiting, skipping (pagination)
const page = 2;
const limit = 10;
const paginatedUsers = await User.find({ isActive: true })
  .sort({ createdAt: -1 }) // -1 = descending (newest first), 1 = ascending
  .limit(limit)
  .skip((page - 1) * limit)
  .select("name email"); // only return these fields

// Count
const count = await User.countDocuments({ isActive: true });
```

### UPDATE (Modifying Documents).

```javascript
// findByIdAndUpdate — the most common approach
// Returns the OLD document by default. Pass { new: true } to return the updated one.
const updated = await User.findByIdAndUpdate(
  "64a1b2c3d4e5f6a7b8c9d0e1",
  { $set: { name: "Alice Smith", age: 29 } },
  { new: true, runValidators: true }, // runValidators: re-run schema validation on update
);

// Update operators
await User.findByIdAndUpdate(id, {
  $set: { name: "New Name" }, // set specific fields
  $unset: { age: "" }, // remove a field
  $inc: { loginCount: 1 }, // increment a number by 1
  $push: { tags: "mongodb" }, // add an item to an array
  $pull: { tags: "designer" }, // remove items from an array that match
  $addToSet: { tags: "backend" }, // add to array only if not already present
});

// Update many documents at once
const result = await User.updateMany(
  { isActive: false },
  { $set: { archivedAt: new Date() } },
);
console.log(result.modifiedCount); // how many documents were modified

// findOneAndUpdate — filter by any field, not just _id
await User.findOneAndUpdate(
  { email: "alice@example.com" },
  { $set: { isActive: false } },
  { new: true },
);
```

### DELETE (Removing Documents).

```javascript
// Delete one by ID
await User.findByIdAndDelete("64a1b2c3d4e5f6a7b8c9d0e1");

// Delete one by filter
await User.findOneAndDelete({ email: "alice@example.com" });

// Delete many
const result = await User.deleteMany({ isActive: false });
console.log(result.deletedCount); // how many were deleted

// ⚠️  Be careful with deleteMany({}) — this deletes ALL documents in the collection.
```

### The Mongoose Query Lifecycle.

```
await User.find({ isActive: true })
      │
      ├── Mongoose builds a query object
      ├── Mongoose converts JS types to BSON
      ├── Query is sent to MongoDB over the network
      ├── MongoDB executes the query (uses an index if one exists)
      ├── MongoDB returns BSON documents
      ├── Mongoose converts BSON back to JS objects
      └── Result returned to your await
```

---

## 4. Schema Design.

Schema design is arguably the most important skill in MongoDB.

Bad schema design causes slow queries, redundant data, complex application code and bugs.

Unlike SQL, MongoDB lets you embed related data inside a single document. The decision of when to embed vs when to reference is central to everything.

### Embedding vs Referencing.

**Embedding** : store related data inside the same document.

```javascript
// A blog post with its comments embedded
const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  author: String,
  comments: [
    {
      user: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Reading the post gives you all comments in one query — very fast.
const post = await Post.findById(postId);
const comments = post.comments; // already here — no second query
```

**Referencing** : store a foreign ID and make a second query (like a SQL JOIN).

```javascript
// Comment stored in a separate collection, referencing the post
const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

// Loading a post AND its comments requires populate()
const post = await Post.findById(postId).populate("comments"); // Mongoose makes a second query behind the scenes

// Or manually:
const comments = await Comment.find({ postId: postId });
```

### When to Embed, When to Reference.

```
Embed when:                              Reference when:
───────────────────────────────────      ────────────────────────────────────────
Data is always accessed together         Data is accessed independently
Sub-documents are few (<20–50)          Sub-documents can grow without bound
Sub-documents don't need to be          The same data is referenced by many
  queried independently                   documents (shared data)
The relationship is 1-to-few            The relationship is 1-to-many or many-to-many

Examples of embed:                       Examples of reference:
  Post → its tags (few, static)            Post → its author (shared User doc)
  Order → its line items                   Comment → the Post it belongs to
  User → their address                     Product → its Category

```

### Practical Schema Examples.

```javascript
// ❌ Unbounded embedding — DO NOT do this
const userSchema = new mongoose.Schema({
  name: String,
  posts: [postSchema], // a prolific user could have 10,000 posts → document grows to 16MB limit
});

// ✅ Reference for one-to-many where "many" can be large
const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  body: String,
});

// ✅ Embed for one-to-few where data is always read together
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered"],
    default: "pending",
  },
  lineItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String, // denormalised — copied from Product at order time
      price: Number, // snapshot of the price — if the product price changes later, order is unaffected
      quantity: Number,
    },
  ],
  total: Number,
});
```

### Mongoose Schema Options & Validators.

```javascript
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  category: {
    type: String,
    enum: {
      values: ["electronics", "clothing", "books", "food"],
      message: "{VALUE} is not a valid category",
    },
  },
  sku: {
    type: String,
    unique: true,
    sparse: true, // allows multiple documents to have no sku (null does not violate unique)
  },
  // Custom validator
  discountPrice: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price; // discount must be less than full price
      },
      message: "Discount price ({VALUE}) must be less than regular price",
    },
  },
});
```

### Virtual Fields.

Virtuals are properties that exist on a Mongoose document but are not stored in MongoDB. They are computed on the fly.

```javascript
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
});

// A virtual 'fullName' field — not stored in DB
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
  // Use a regular function (not arrow) — 'this' refers to the document
});

const user = await User.findById(id);
console.log(user.fullName); // "Alice Smith" — computed on access
```

---

## 5. Indexing Basics.

An index is a data structure that MongoDB maintains alongside your collection.

It allows MongoDB to find documents matching a query without scanning every single document in the collection.

**Without an index**: MongoDB performs a _collection scan_ (COLLSCAN). It reads every document.

**With an index**: MongoDB performs an _index scan_ (IXSCAN). It jumps directly to matching documents.

The difference matters enormously at scale:

```
Collection with 1,000,000 users.

Find by email WITHOUT an index:
  → MongoDB reads all 1,000,000 documents to find the one with email = 'alice@example.com'
  → ~500ms

Find by email WITH an index on 'email':
  → MongoDB looks up 'alice@example.com' in the B-tree index, jumps directly to the document
  → ~1ms

```

### Creating Indexes.

```javascript
// In the Mongoose schema (recommended — created when the app connects)
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true }, // unique: true implicitly creates an index
  username: { type: String, index: true }, // non-unique index
  age: Number,
});

// Compound index — index across multiple fields
// Useful when you query by multiple fields together
userSchema.index({ age: 1, isActive: 1 });
// 1 = ascending, -1 = descending

// Text index — for full-text search
userSchema.index({ name: "text", bio: "text" });

// TTL index — automatically delete documents after a time period
// Useful for sessions, OTP codes, temporary data
const sessionSchema = new mongoose.Schema({
  token: String,
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // delete 1 hour after createdAt
});

// Creating indexes via the MongoDB driver directly
await User.collection.createIndex({ email: 1 }, { unique: true });
```

### Checking if Your Indexes Are Being Used.

```javascript
// .explain() shows MongoDB's query plan — tells you if it used an index
const explanation = await User.find({ email: "alice@example.com" }).explain(
  "executionStats",
);

console.log(explanation.queryPlanner.winningPlan);
// IXSCAN = index scan (good ✓)
// COLLSCAN = collection scan (bad ✗ — add an index)

console.log(explanation.executionStats.totalDocsExamined); // want this close to 1
console.log(explanation.executionStats.totalDocsReturned); // should equal the above
```

### Index Trade-offs.

```
Indexes speed up READS.
Indexes slow down WRITES — MongoDB must update the index on every insert/update/delete.

Don't index every field. Index the fields you filter, sort, or look up by.
Good candidates: email (unique login), userId (foreign key), status (frequent filter), createdAt (sort).
Bad candidates: fields you never query on, boolean fields with low cardinality (only true/false — index barely helps).

```

---

## 6. Aggregation Basics.

**Aggregation** in MongoDB is the tool for transforming and computing over your data.

Where `find()` retrieves documents, aggregation lets you reshape them, group them, compute totals and filter through a pipeline of stages.

Think of it as an assembly line: each stage receives documents from the previous stage, transforms them and passes the result on.

```
[  $match  ] → [  $group  ] → [  $sort  ] → [  $project  ] → result
   filter         group &       sort the      reshape the
   early to       compute       results       output
   reduce data    totals

```

### The Aggregation Pipeline.

```javascript
// Example: total revenue per product category this month
const result = await Order.aggregate([
  // Stage 1: $match — filter documents (like .find())
  // Always put $match first — filters early, reduces data for subsequent stages
  {
    $match: {
      status: "delivered",
      createdAt: { $gte: new Date("2024-01-01") },
    },
  },

  // Stage 2: $unwind — deconstruct an array field into individual documents
  // Each lineItem becomes its own document for grouping
  { $unwind: "$lineItems" },

  // Stage 3: $group — group by a field and compute aggregates
  {
    $group: {
      _id: "$lineItems.category", // group by category
      totalRevenue: {
        $sum: { $multiply: ["$lineItems.price", "$lineItems.quantity"] },
      },
      orderCount: { $sum: 1 },
      avgOrderSize: { $avg: "$lineItems.quantity" },
    },
  },

  // Stage 4: $sort — sort the grouped results
  { $sort: { totalRevenue: -1 } }, // highest revenue first

  // Stage 5: $project — reshape the output, rename fields, exclude _id
  {
    $project: {
      _id: 0, // exclude _id
      category: "$_id", // rename _id to category
      totalRevenue: 1,
      orderCount: 1,
      avgOrderSize: { $round: ["$avgOrderSize", 2] }, // round to 2 decimal places
    },
  },
]);
```

### Common Aggregation Stages.

```javascript
// $count — count documents at this stage
{ $count: 'totalUsers' }

// $limit and $skip — pagination within a pipeline
{ $limit: 10 }
{ $skip: 20 }

// $lookup — the equivalent of a SQL JOIN
{
  $lookup: {
    from:         'users',    // the other collection
    localField:   'userId',   // field in current documents
    foreignField: '_id',      // field in the 'users' collection
    as:           'user',     // output array field name
  },
}

// $addFields — add computed fields without removing existing ones
{
  $addFields: {
    fullName: { $concat: ['$firstName', ' ', '$lastName'] },
    isAdult:  { $gte: ['$age', 18] },
  },
}

// $facet — run multiple pipelines in parallel and return combined results
// Useful for search results with faceted filters
{
  $facet: {
    paginatedResults: [{ $skip: 0 }, { $limit: 10 }],
    totalCount:       [{ $count: 'count' }],
  },
}
```

### Practical Example (User Statistics).

```javascript
// How many users registered per month this year
const monthlySignups = await User.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date("2024-01-01"), $lt: new Date("2025-01-01") },
    },
  },
  {
    $group: {
      _id: { $month: "$createdAt" }, // group by month number (1–12)
      count: { $sum: 1 },
    },
  },
  {
    $sort: { _id: 1 }, // sort by month
  },
  {
    $project: {
      _id: 0,
      month: "$_id",
      count: 1,
    },
  },
]);
// Result: [{ month: 1, count: 142 }, { month: 2, count: 98 }, ...]
```

---

## 7. Data Modeling Decisions.

Real-world data modeling requires thinking about how your application will query data, not just how to store it.

MongoDB's flexibility is a _double-edged_ sword: it makes experimentation fast, but bad decisions compound over time.

### The Three Relationship Patterns.

**One-to-One** : embed it.

```javascript
// A user has exactly one profile. Embed the profile in the user document.
const userSchema = new mongoose.Schema({
  email: String,
  profile: {
    bio: String,
    avatarUrl: String,
    location: String,
  },
});
// Reading a user gives you the profile automatically — no second query.
```

**One-to-Few** : embed it (unless the sub-documents change frequently and independently).

```javascript
// A user has a few addresses (home, work). Embed them.
const userSchema = new mongoose.Schema({
  email: String,
  addresses: [
    {
      label: String, // 'home', 'work'
      line1: String,
      city: String,
      country: String,
    },
  ],
});
```

**One-to-Many** : reference with the foreign key on the "many" side.

```javascript
// A user can have thousands of orders. Store userId on each order.
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  total: Number,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

// Querying all orders for a user
const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
```

**Many-to-Many** : reference both sides, or use an intermediary document.

```javascript
// Students and Courses — a student takes many courses, a course has many students.

// Option A: Store an array of references on one (or both) sides
const studentSchema = new mongoose.Schema({
  name: String,
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

// Option B: Intermediary "Enrollment" document (preferred for large or metadata-rich relationships)
const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    index: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    index: true,
  },
  enrolledAt: { type: Date, default: Date.now },
  grade: Number, // enrollment-specific metadata that belongs neither on Student nor Course
});
```

### Denormalization (Copying Data for Read Performance).

In SQL, you normalise data to avoid duplication. In MongoDB, controlled duplication (denormalization) is a common and intentional pattern for performance.

```javascript
// When saving an order, copy the product name and price into the order
// instead of referencing the product and doing a lookup on every read.

const order = await Order.create({
  userId: req.user.id,
  lineItems: cart.items.map((item) => ({
    productId: item.product._id,
    name: item.product.name, // ← denormalised copy
    price: item.product.price, // ← snapshot at time of purchase
    quantity: item.quantity,
  })),
  total: cartTotal,
});

// Why? If you reference the product and its price changes later,
// the old order's total becomes incorrect. The snapshot is correct by definition.
// Trade-off: if a product's name has a typo, old orders also have the typo.
// This is acceptable for financial records.
```

### Mongoose Middleware (Hooks).

Mongoose allows you to run functions before or after database operations. These are called middleware or hooks.

```javascript
const userSchema = new mongoose.Schema({ ... });

// Pre-save hook — runs before .save() or .create()
// Common use: hashing passwords
userSchema.pre('save', async function (next) {
  // 'this' is the document being saved
  if (!this.isModified('password')) return next(); // only hash if password changed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Post-save hook — runs after .save()
// Common use: sending a welcome email after registration
userSchema.post('save', function (doc, next) {
  console.log(`New user created: ${doc.email}`);
  // sendWelcomeEmail(doc.email); // async, but don't await here to avoid blocking
  next();
});

// Pre-find hook — modify all queries of this model before they run
// Common use: automatically filter out soft-deleted records
userSchema.pre(/^find/, function (next) {
  // 'this' is the Query object
  this.find({ deletedAt: { $exists: false } }); // never return deleted users
  next();
});

// Instance method — a method available on every document of this model
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const user = await User.findOne({ email });
const isMatch = await user.comparePassword(req.body.password);

// Static method — a method available on the Model itself (not the document)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

const user = await User.findByEmail('alice@example.com');
```

---

## Assignment.

1. **Build a Basic REST API with MongoDB CRUD.**

   **What you practice:**
   - Connecting Mongoose to MongoDB Atlas
   - defining a schema with validation
   - implementing all four CRUD operations as REST endpoints
   - proper HTTP status codes
   - error handling for missing documents and validation failures.

   **Requirements:**
   - Connect to MongoDB using Mongoose and a `.env` `MONGO_URI` variable.
   - Create a `Product` model with fields: `name` (String, required), `price` (Number, required, min 0), `category` (String, enum: `['electronics', 'clothing', 'food', 'books']`), `stock` (Number, default 0), `createdAt` (auto via timestamps).
   - Implement these endpoints:
     - `POST /api/products` — create a product, return `201` with the created document.
     - `GET /api/products` — return all products (sorted newest first).
     - `GET /api/products/:id` — return one product, `404` if not found.
     - `PUT /api/products/:id` — update a product, `404` if not found.
     - `DELETE /api/products/:id` — delete a product, return `{ message: 'Product deleted' }`.
   - Return a `400` with the Mongoose validation error message if required fields are missing or invalid.

   [Solution](./Assignment/code1)

   **Postman Test Cases:**

   ```
   # Create a product
   POST http://localhost:3000/api/products
   Body: { "name": "MacBook Pro", "price": 1999, "category": "electronics", "stock": 10 }
   → 201 { _id: "...", name: "MacBook Pro", price: 1999, ... }

   # Missing required field
   POST http://localhost:3000/api/products
   Body: { "price": 1999 }
   → 400 { message: "Product validation failed: name: Product name is required" }

   # Get all products
   GET http://localhost:3000/api/products
   → 200 [{ ... }, { ... }]

   # Get one — valid id
   GET http://localhost:3000/api/products/<id>
   → 200 { ... }

   # Get one — id not in DB
   GET http://localhost:3000/api/products/64a1b2c3d4e5f6a7b8c9d0e1
   → 404 { message: "Product not found" }

   # Update
   PUT http://localhost:3000/api/products/<id>
   Body: { "price": 1799, "stock": 8 }
   → 200 { updated document }

   # Delete
   DELETE http://localhost:3000/api/products/<id>
   → 200 { message: "Product deleted" }
   ```

2. **Paginated Blog API with Referencing and Populate.**

   **What you practice:**
   - Designing a multi-collection schema with referencing
   - `populate()` for cross-collection joins
   - query building with filters, sorting, and pagination
   - aggregation for counts
   - handling invalid ObjectIds gracefully.

   **Requirements:**
   - Create two models:
     - `User` : `{ name, email (unique, required), createdAt }`
     - `Post` : `{ title (required), body (required), authorId (ref: 'User', required), tags: [String], views (Number, default 0), createdAt }`
   - Endpoints:
     - `POST /api/users` : create a user.
     - `POST /api/posts` : create a post (body should contain `authorId`). Return the post with the author's `name` and `email` populated.
     - `GET /api/posts` : return all posts with author details populated. Support:
       - `?tag=mongodb` : filter by tag.
       - `?sort=views` or `?sort=createdAt` (default: `createdAt`).
       - `?page=1&limit=5` : pagination. Return `{ data, page, limit, total, totalPages }`.
     - `GET /api/posts/:id` : return one post with author populated. Increment `views` by 1 on every read.
     - `DELETE /api/posts/:id` : delete a post.

   [Solution](./Assignment/code2)

   **Postman Test Cases:**

   ```
   # Create users
   POST http://localhost:3000/api/users
   Body: { "name": "Alice", "email": "alice@example.com" }
   → 201 { _id: "...", name: "Alice", email: "alice@example.com" }

   # Create a post
   POST http://localhost:3000/api/posts
   Body: { "title": "Getting started with MongoDB", "body": "...", "authorId": "<alice_id>", "tags": ["mongodb", "database"] }
   → 201 { ..., author: { name: "Alice", email: "alice@example.com" } }

   # Get all posts — paginated, filtered by tag
   GET http://localhost:3000/api/posts?tag=mongodb&page=1&limit=5
   → 200 { data: [...], page: 1, limit: 5, total: 12, totalPages: 3 }

   # Get one post — views should increment each call
   GET http://localhost:3000/api/posts/<id>
   (call it twice)
   → first call:  { ..., views: 1 }
   → second call: { ..., views: 2 }

   # Invalid ObjectId format
   GET http://localhost:3000/api/posts/not-a-valid-id
   → 400 { message: "Invalid ID format" }
   ```

3. **E-Commerce Aggregation Dashboard.**

   **What you practice:**
   - Designing a production-like multi-collection schema
   - Mongoose middleware for pre-save logic
   - complex multi-stage aggregation pipelines
   - `$lookup`, `$unwind`, `$group`, `$facet`
   - TTL indexes for OTP expiry
   - atomic operations with `$inc` to prevent race conditions on stock.

   **Requirements:**

   **Part 1 (Schema & API):**
   - Create three models:
     - `User` : `{ name, email, passwordHash, role: enum ['user', 'admin'] }`
     - `Product` : `{ name, price, category, stock (Number) }`. Add an index on `category`.
     - `Order` : `{ userId (ref), lineItems: [{ productId (ref), name, price, quantity }], total, status: enum ['pending', 'shipped', 'delivered', 'cancelled'] }` with timestamps.
   - Endpoints:
     - `POST /api/orders` : create an order from a cart body. For each item, use a `findOneAndUpdate` with `$inc: { stock: -quantity }` and a `$gte` check to atomically decrement stock. If any item has insufficient stock, return `400 { message: 'Insufficient stock for <name>' }`. Snapshot the product `name` and `price` into the line item.
     - `PUT /api/orders/:id/status` : update order status.

   **Part 2 (Aggregation Dashboard):**
   - `GET /api/dashboard/revenue` : total revenue and order count grouped by month for the current year. Return `[{ month: 1, revenue: 9870, orders: 12 }, ...]`.
   - `GET /api/dashboard/top-products` : top 5 products by quantity sold (across all delivered orders). Return `[{ name, totalSold, totalRevenue }]`.
   - `GET /api/dashboard/users` : for each user, return their total orders and total spend. Sort by total spend descending.

   **Part 3 (OTP with TTL Index):**
   - Add a `PasswordResetToken` model : `{ email, token (String), createdAt (Date, expires: '10m') }`. The TTL index should automatically delete the document 10 minutes after creation.
   - `POST /api/auth/forgot-password` : generate a 6-digit OTP, save it, and return `{ message: 'OTP sent', otp: token }` (in production you would email it, here return it for testing).
   - `POST /api/auth/verify-otp` : verify the OTP. If the token document exists and matches, return `{ message: 'OTP verified' }`. If not found (expired or wrong), return `400 { message: 'Invalid or expired OTP' }`.

   [Solution](./Assignment/code3/)

   **Postman Test Cases:**

   ```
   # Place an order (use real product _ids from your DB)
   POST http://localhost:3000/api/orders
   Body: {
   "userId": "<user_id>",
   "items": [
       { "productId": "<product_id>", "quantity": 2 },
       { "productId": "<product_id_2>", "quantity": 1 }
   ]
   }
   → 201 { _id, userId, lineItems: [{ name, price, quantity }], total, status: "pending" }

   # Insufficient stock
   POST http://localhost:3000/api/orders
   Body: { "userId": "<user_id>", "items": [{ "productId": "<id>", "quantity": 9999 }] }
   → 400 { message: "Insufficient stock for MacBook Pro" }

   # Revenue dashboard
   GET http://localhost:3000/api/dashboard/revenue
   → 200 [{ month: 1, revenue: 9870, orders: 12 }, { month: 2, revenue: 4200, orders: 7 }]

   # Top products
   GET http://localhost:3000/api/dashboard/top-products
   → 200 [{ name: "Laptop", totalSold: 45, totalRevenue: 44955 }, ...]

   # OTP flow
   POST http://localhost:3000/api/auth/forgot-password
   Body: { "email": "alice@example.com" }
   → 200 { message: "OTP sent", otp: "482910" }

   POST http://localhost:3000/api/auth/verify-otp
   Body: { "email": "alice@example.com", "otp": "482910" }
   → 200 { message: "OTP verified" }

   # Wait 10+ minutes, try again
   POST http://localhost:3000/api/auth/verify-otp
   Body: { "email": "alice@example.com", "otp": "482910" }
   → 400 { message: "Invalid or expired OTP" }
   ```
