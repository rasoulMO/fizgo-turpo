export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex h-[calc(100vh-8rem)] animate-pulse flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 rounded-lg border p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-2"
              style={{
                justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end'
              }}
            >
              <div
                className={`${
                  i % 2 === 0 ? 'order-1' : 'order-2'
                } h-8 w-8 rounded-full bg-muted`}
              />
              <div
                className={`${i % 2 === 0 ? 'order-2' : 'order-1'} max-w-[80%]`}
              >
                <div className="h-24 w-64 rounded-lg bg-muted" />
                <div className="mt-1 h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 rounded-md bg-muted p-4" />
          <div className="h-10 w-10 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}
