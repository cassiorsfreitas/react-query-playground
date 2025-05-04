export default function Home() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Core Features</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Explore the fundamental capabilities of React Query
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Basic Queries</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Refetching Strategies</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Query Invalidation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Dependent Queries</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Optimistic Updates</span>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Advanced Features</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Dive deeper into React Query&apos;s advanced capabilities
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Pagination</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Infinite Queries</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Prefetching</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Query Cancellation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Suspense Mode</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>WebSocket/Realtime Updates</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Testing</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 p-6 border rounded-lg bg-muted/30">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">
          Navigate through the examples using the sidebar. Each example
          demonstrates a specific feature of React Query with practical use
          cases.
        </p>
        <p>
          It is highly recommended to explore the examples with the{" "}
          <strong>TanStack DevTools</strong> enabled. This will give you deeper
          insights into what&apos;s happening under the hood, such as query
          states, cache updates, and background refetching, making it easier to
          understand how React Query works in practice.
        </p>
      </div>
    </div>
  );
}
