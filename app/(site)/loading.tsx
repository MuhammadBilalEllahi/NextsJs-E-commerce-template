export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-56 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
