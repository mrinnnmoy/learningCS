"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addComment } from "@/app/actions/blogActions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Posting..." : "Post Comment"}
    </button>
  );
}

export default function AddCommentForm({ postId }: { postId: number }) {
  const [state, formAction] = useActionState(addComment, null);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Leave a Comment
      </h3>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="postId" value={postId} />

        {state?.error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <input
          name="authorName"
          type="text"
          placeholder="Your name"
          required
          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="body"
          placeholder="Write your comment..."
          required
          rows={4}
          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
