import { formatDate, formatCurrency, truncate, slugify } from "@acme/utils";

export default function WebHomePage() {
  const today = formatDate(new Date());
  const price = formatCurrency(1234.56);
  const longTitle = truncate(
    "This is a very long title that needs to be truncated for display",
    40,
  );
  const slug = slugify("Hello World — A Turborepo Demo!");

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
        <span className="w-2 h-2 bg-blue-500 rounded-full" />
        @acme/web — apps/web
      </div>

      <h1 className="text-4xl font-bold text-slate-900 mb-4">Acme Web App</h1>
      <p className="text-slate-500 mb-8">
        A Next.js 16 app consuming shared utilities from{" "}
        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">
          @acme/utils
        </code>
        .
      </p>

      <div className="grid grid-cols-1 gap-4">
        <div className="border border-slate-100 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            formatDate()
          </p>
          <p className="text-xl font-semibold">{today}</p>
        </div>
        <div className="border border-slate-100 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            formatCurrency(1234.56)
          </p>
          <p className="text-xl font-semibold">{price}</p>
        </div>
        <div className="border border-slate-100 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            truncate(longTitle, 40)
          </p>
          <p className="text-xl font-semibold">{longTitle}</p>
        </div>
        <div className="border border-slate-100 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            slugify()
          </p>
          <p className="text-xl font-semibold font-mono text-slate-600">
            {slug}
          </p>
        </div>
      </div>
    </main>
  );
}
