import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="border rounded-lg p-4 md:p-6">
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

        <div className="border rounded-lg p-4 md:p-6">
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

      <Alert className="rounded-lg md:rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-3 md:p-4">
        <Lightbulb className="h-6 w-6 md:h-8 md:w-8" />
        <AlertDescription className="text-sm md:text-base">
          It is highly recommended to explore the examples with the TanStack
          DevTools enabled. This will give you deeper insights into what&apos;s
          happening under the hood, such as query states, cache updates, and
          background refetching, making it easier to understand how React Query
          works in practice.
        </AlertDescription>
      </Alert>

      <div className="p-4 md:p-6 border rounded-lg bg-muted/30">
        <h2 className="text-xl font-semibold mb-3 md:mb-4">Getting Started</h2>
        <p className="mb-4 text-sm md:text-base">
          Navigate through the examples using the sidebar. Each example
          demonstrates a specific feature of React Query with practical use
          cases.
        </p>
        <Link href="/basic">
          <Button variant="outline">Explore Examples</Button>
        </Link>
      </div>
    </div>
  );
}
