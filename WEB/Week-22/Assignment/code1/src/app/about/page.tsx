import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — NextShop",
  description: "Learn about NextShop, a Next.js 14 demo application.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">About NextShop</h1>
      <div className="prose prose-slate space-y-4 text-slate-600">
        <p>
          NextShop is a demo e-commerce storefront built to showcase the
          capabilities of Next.js 14 with the App Router, Server Components, and
          Tailwind CSS.
        </p>
        <p>
          Products are fetched from the DummyJSON public API and rendered using
          Next.js Server Components — which means the data fetching happens on
          the server, the HTML is pre-rendered, and no JavaScript is sent to the
          browser for the static parts of the page.
        </p>
        <h2 className="text-xl font-semibold text-slate-900 mt-6">
          Tech Stack
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Next.js 14 (App Router)</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>next/image for optimised images</li>
          <li>next/font for self-hosted fonts</li>
        </ul>
      </div>
    </div>
  );
}
