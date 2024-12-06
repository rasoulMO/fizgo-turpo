export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex animate-pulse flex-col gap-6">
        <div>
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="mt-2 h-4 w-64 rounded bg-muted" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="h-12 w-12 rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-6 w-20 rounded bg-muted" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted" />
                    <div className="h-4 w-24 rounded bg-muted" />
                  </div>
                  <div className="h-4 w-16 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
