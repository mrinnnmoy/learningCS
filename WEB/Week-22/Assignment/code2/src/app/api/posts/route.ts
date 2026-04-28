import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      content: true,
    },
  });
  return NextResponse.json(posts);
}

const CreatePostBodySchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  content: z.string().min(10),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreatePostBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  try {
    const post = await prisma.post.create({
      data: { ...parsed.data, published: true },
    });
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Slug already exists" },
      { status: 409 },
    );
  }
}
