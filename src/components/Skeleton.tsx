export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-2/5" />
        <div className="h-2.5 bg-gray-100 rounded-full w-1/4" />
      </div>
      <div className="h-6 w-14 bg-gray-100 rounded-full" />
      <div className="h-8 w-20 bg-gray-100 rounded-lg" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="border rounded-2xl p-5 bg-gray-50 animate-pulse space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-12" />
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}
