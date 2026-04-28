export default function Loading() {
  return (
    <div>
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100"
          >
            <div className="aspect-square bg-slate-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
              <div className="h-5 bg-slate-200 rounded animate-pulse w-1/3 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
