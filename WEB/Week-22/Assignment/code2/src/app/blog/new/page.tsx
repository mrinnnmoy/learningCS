"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPost } from "@/app/actions/blogActions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Publishing..." : "Publish Post"}
    </button>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400";

export default function NewPostPage() {
  const [state, formAction] = useActionState(createPost, null);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">New Post</h1>

      <form
        action={formAction}
        className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5"
      >
        {state?.error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="My first post"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="slug" className="text-sm font-medium text-slate-700">
            Slug{" "}
            <span className="text-slate-400 font-normal">
              (URL-friendly, e.g. my-first-post)
            </span>
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="my-first-post"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="content"
            className="text-sm font-medium text-slate-700"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={8}
            placeholder="Write your post here..."
            required
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
