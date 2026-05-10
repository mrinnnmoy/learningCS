import { formatDate, slugify, truncate } from "@acme/utils";

const docs = [
  { title: "Getting Started with Turborepo", date: "2025-01-15" },
  { title: "Sharing Packages Across Apps in a Monorepo", date: "2025-02-03" },
  { title: "Remote Caching and CI/CD Integration", date: "2025-03-22" },
];

export default function DocsHomePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1 rounded-full mb-6">
        <span className="w-2 h-2 bg-slate-400 rounded-full" />
        @acme/docs — apps/docs
      </div>

      <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
      <p className="text-slate-400 mb-8">
        A second Next.js app in the same monorepo, also consuming{" "}
        <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm">
          @acme/utils
        </code>
        .
      </p>

      <div className="flex flex-col gap-3">
        {docs.map((doc) => (
          <a
            key={doc.title}
            href={`/docs/${slugify(doc.title)}`}
            className="block border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors"
          >
            <p className="font-medium text-white">{truncate(doc.title, 50)}</p>
            <p className="text-sm text-slate-500 mt-1">
              {formatDate(doc.date)}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
