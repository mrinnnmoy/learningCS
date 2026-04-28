# **How to Build.**

```
Step 1 — Create and configure the project
  npx create-next-app@latest code2 --typescript --tailwind --eslint --app --src-dir
  cd code2
  npm install prisma @prisma/client zod
  npx prisma init --datasource-provider sqlite

Step 2 — Write prisma/schema.prisma
  model Post { id, title, content, slug (unique), published, createdAt, comments }
  model Comment { id, postId, authorName, body, createdAt, post }
  Run: npx prisma migrate dev --name init

Step 3 — Create src/lib/prisma.ts
  Singleton PrismaClient using globalThis pattern.

Step 4 — Write src/app/actions/blogActions.ts
  'use server' at the top.
  createPost(formData): validate with Zod, db.post.create, revalidatePath, redirect.
  addComment(formData): validate, db.comment.create, revalidatePath.
  deletePost(id): db.post.delete, revalidatePath.

Step 5 — Write API routes
  GET /api/posts: prisma.post.findMany({ where: { published: true } })
  POST /api/posts: parse body, validate, prisma.post.create
  GET /api/posts/[slug]: prisma.post.findUnique with comments included

Step 6 — Write src/app/blog/page.tsx
  Server Component. prisma.post.findMany. Render post cards + DeletePostButton.

Step 7 — Write src/app/blog/[slug]/page.tsx
  Server Component. prisma.post.findUnique with comments.
  Render post content and AddCommentForm.

Step 8 — Write src/app/blog/new/page.tsx
  Client Component with a form that uses the createPost action.
  Use useFormStatus inside a SubmitButton for pending state.

Step 9 — Write AddCommentForm and DeletePostButton Client Components.
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
