# How to Build.

```
Step 1 — Initialise
  mkdir code2 && cd code2
  npm init -y
  npm install express prisma @prisma/client dotenv
  npm install --save-dev nodemon
  npx prisma init

Step 2 — Write schema.prisma
  Define all 5 models. Use @db.Decimal(10,2) for price and total.
  Enum OrderStatus. Explicit many-to-many between Product and Tag (Prisma manages join table).
  Composite @@id([orderId, productId]) on OrderItem.
  Add indexes on Order(userId), Order(status), OrderItem(productId).

Step 3 — Migrate and seed
  npx prisma migrate dev --name init
  Write seed.js: create 2 users, 4 products with tags, 0 orders (orders come from API).
  npx prisma db seed

Step 4 — Write lib/prisma.js (singleton pattern)

Step 5 — Write models/product.js
  createProduct({ name, price, stock, category, tags })
    → prisma.product.create with tags: { connectOrCreate: tags.map(...) }
  getProducts({ category })
    → findMany with where: { category }, include: { tags, _count: { select: { orderItems: true } } }

Step 6 — Write models/order.js
  placeOrder(userId, items)
    → prisma.$transaction(async tx => {
        for each item: tx.product.findUnique FOR checking stock
        if insufficient: throw error with product name
        tx.product.update with stock: { decrement }
        tx.order.create with items: { create: [...] }
      })
  updateStatus(id, status)
    → prisma.order.update

Step 7 — Write models/dashboard.js (three aggregation queries)

Step 8 — Wire up routes and server.js
```