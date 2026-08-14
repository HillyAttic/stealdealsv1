interface SkeletonLoaderProps {
  type?: 'table' | 'cards' | 'stats' | 'form' | 'chart' | 'text';
  rows?: number;
  columns?: number;
  className?: string;
}

export default function SkeletonLoader({
  type = 'table',
  rows = 5,
  columns = 4,
  className = '',
}: SkeletonLoaderProps) {
  if (type === 'stats') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 bg-white border border-gray-100 shadow-sm animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="admin-skeleton h-3 w-20 mb-3" />
                <div className="admin-skeleton h-8 w-16 mb-2" />
                <div className="admin-skeleton h-2.5 w-24" />
              </div>
              <div className="admin-skeleton h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 bg-white border border-gray-100 shadow-sm animate-pulse">
            <div className="admin-skeleton h-4 w-3/4 mb-3" />
            <div className="admin-skeleton h-3 w-full mb-2" />
            <div className="admin-skeleton h-3 w-5/6 mb-2" />
            <div className="admin-skeleton h-3 w-2/3 mb-4" />
            <div className="flex gap-2">
              <div className="admin-skeleton h-8 w-16 rounded-lg" />
              <div className="admin-skeleton h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`rounded-xl p-6 bg-white border border-gray-100 shadow-sm animate-pulse ${className}`}>
        <div className="admin-skeleton h-5 w-40 mb-6" />
        <div className="admin-skeleton h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <div className="admin-skeleton h-3 w-24 mb-2" />
            <div className="admin-skeleton h-10 w-full rounded-lg" />
          </div>
        ))}
        <div className="admin-skeleton h-10 w-32 rounded-lg mt-6" />
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="admin-skeleton h-6 w-48" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="admin-skeleton h-4 w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    );
  }

  // Table (default)
  return (
    <div className={`rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="admin-skeleton h-3.5 w-full" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="px-4 py-3.5 border-b border-gray-50 last:border-0"
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="admin-skeleton h-4 w-full"
                style={{ width: colIdx === 0 ? '80%' : '65%' }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
