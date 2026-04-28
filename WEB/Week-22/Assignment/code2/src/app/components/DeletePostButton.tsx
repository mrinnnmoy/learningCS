"use client";

import { useTransition } from "react";
import { deletePost } from "@/app/actions/blogActions";

export default function DeletePostButton({ postId }: { postId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (): void => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    startTransition(() => deletePost(postId));
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
