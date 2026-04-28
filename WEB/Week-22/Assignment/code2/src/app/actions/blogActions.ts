"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ─── Create Post ───────────────────────────────────────────────────────────

const CreatePostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

export async function createPost(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const parsed = CreatePostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    await prisma.post.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        content: parsed.data.content,
        published: true,
      },
    });
  } catch {
    return { error: "A post with this slug already exists." };
  }

  revalidatePath("/blog");
  redirect("/blog");
}

// ─── Add Comment ───────────────────────────────────────────────────────────

const AddCommentSchema = z.object({
  postId: z.number().int().positive(),
  authorName: z.string().min(1, "Name is required"),
  body: z.string().min(1, "Comment cannot be empty"),
});

export async function addComment(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const parsed = AddCommentSchema.safeParse({
    postId: parseInt(formData.get("postId") as string, 10),
    authorName: formData.get("authorName"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const post = await prisma.post.findUnique({
    where: { id: parsed.data.postId },
  });
  if (!post) return { error: "Post not found." };

  await prisma.comment.create({ data: parsed.data });

  revalidatePath(`/blog/${post.slug}`);
  return null; // success
}

// ─── Delete Post ───────────────────────────────────────────────────────────

export async function deletePost(id: number): Promise<void> {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/blog");
}
