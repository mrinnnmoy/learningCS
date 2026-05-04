import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Collaborative Whiteboard
        </h1>
        <p className="text-slate-400 mb-6">
          Draw together in real time using native WebSockets
        </p>
        <Link
          href="/whiteboard"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Open Whiteboard
        </Link>
      </div>
    </div>
  );
}
