"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { CheckCircle, Code, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCodeTheme } from "./theme-code-provider";

// Code examples
const QUERY_KEYS_FACTORY = `export const queryKeys = {
  todos: ["todos"] as const,
  todoList: (list: "A" | "B") => [...queryKeys.todos, \`list-\${list}\`] as const,
  todoItem: (id: number) => [...queryKeys.todos, id] as const,
  todoSearch: (filters: { status?: string; query?: string }) => 
    [...queryKeys.todos, "search", filters] as const,
  todoStats: () => [...queryKeys.todos, "stats"] as const
};

// Usage examples:
// queryClient.invalidateQueries({ queryKey: queryKeys.todos })
// useQuery({ queryKey: queryKeys.todoItem(5), ... })
// useQuery({ queryKey: queryKeys.todoSearch({ status: "completed" }), ... })`;

const QUERY_FUNCTION_ABSTRACTION = `// api.ts
export const api = {
  getTodos: async ({ signal }: { signal?: AbortSignal }) => {
    const response = await fetch("/api/todos", { signal })
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    return response.json()
  },
  
  getTodoById: async (id: number, { signal }: { signal?: AbortSignal }) => {
    const response = await fetch(\`/api/todos/\${id}\`, { signal })
    if (!response.ok) {
      throw new Error(\`Failed to fetch todo \${id}\`)
    }
    return response.json()
  }
}

// hooks/useTodos.ts
import { useQuery } from "@tanstack/react-query"
import { api } from "../api"
import { queryKeys } from "../queryKeys"

export function useTodos() {
  return useQuery({
    queryKey: queryKeys.todos,
    queryFn: api.getTodos
  })
}

export function useTodo(id: number) {
  return useQuery({
    queryKey: queryKeys.todoItem(id),
    queryFn: ({ signal }) => api.getTodoById(id, { signal })
  })
}`;

const CUSTOM_HOOKS = `// hooks/useTodos.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../api"
import { queryKeys } from "../queryKeys"
import type { Todo } from "../types"

export function useTodos(filters?: { status?: string; query?: string }) {
  return useQuery({
    queryKey: queryKeys.todoSearch(filters || {}),
    queryFn: ({ signal }) => api.getTodos(filters, { signal })
  })
}

export function useAddTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (newTodo: Omit<Todo, "id">) => api.addTodo(newTodo),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.todos })
    }
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (updatedTodo: Todo) => api.updateTodo(updatedTodo),
    onSuccess: (data, variables) => {
      // Update the cache for this specific todo
      queryClient.setQueryData(
        queryKeys.todoItem(variables.id), 
        data
      )
      
      // Invalidate the lists that might include this todo
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.todos,
        exact: false,
        refetchType: 'none'
      })
    }
  })
}`;

const ERROR_HANDLING = `// Global error handler
import { QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "./toast"

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show error toasts if we haven't already custom handled it
      if (query.meta?.skipErrorToast) {
        return
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    }
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if (error instanceof Error && error.message.includes("404")) {
          return false
        }
        // Otherwise retry 3 times
        return failureCount < 3
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  }
})

// Component with custom error handling
function TodoDetails({ id }) {
  const { data, error, isError } = useQuery({
    queryKey: queryKeys.todoItem(id),
    queryFn: ({ signal }) => api.getTodoById(id, { signal }),
    meta: {
      skipErrorToast: true // Skip the global error toast
    }
  })
  
  if (isError) {
    return (
      <div className="error-container">
        <h2>Could not load todo</h2>
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        <button onClick={() => refetch()}>Try again</button>
      </div>
    )
  }
  
  // Render todo...
}`;

const OPTIMISTIC_UPDATES = `// hooks/useTodos.ts
export function useUpdateTodoOptimistic() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (updatedTodo: Todo) => api.updateTodo(updatedTodo),
    
    // Optimistically update the cache
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.todoItem(newTodo.id) })
      
      // Snapshot the previous value
      const previousTodo = queryClient.getQueryData(queryKeys.todoItem(newTodo.id))
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.todoItem(newTodo.id), newTodo)
      
      // Return a context object with the snapshot
      return { previousTodo, newTodo }
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      if (context) {
        queryClient.setQueryData(
          queryKeys.todoItem(newTodo.id),
          context.previousTodo
        )
      }
    },
    
    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todoItem(variables.id) })
    }
  })
}

// Component usage
function TodoItem({ todo }) {
  const updateTodo = useUpdateTodoOptimistic()
  
  const handleToggleComplete = () => {
    updateTodo.mutate({
      ...todo,
      completed: !todo.completed
    })
  }
  
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggleComplete}
        disabled={updateTodo.isPending}
      />
      <span style={{ opacity: updateTodo.isPending ? 0.5 : 1 }}>
        {todo.title}
      </span>
    </div>
  )
}`;

const PREFETCHING_STRATEGIES = `// Prefetch on page load
useEffect(() => {
  // Prefetch the most common data
  queryClient.prefetchQuery({
    queryKey: queryKeys.todoList("A"),
    queryFn: () => api.getTodos({ list: "A" })
  })
}, [queryClient])

// Prefetch on hover
function TodoListItem({ todo }) {
  const queryClient = useQueryClient()
  
  const prefetchTodoDetails = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.todoItem(todo.id),
      queryFn: () => api.getTodoById(todo.id),
      staleTime: 1000 * 60 * 5 // 5 minutes
    })
  }
  
  return (
    <Link 
      to={\`/todos/\${todo.id}\`}
      onMouseEnter={prefetchTodoDetails}
      onFocus={prefetchTodoDetails}
    >
      {todo.title}
    </Link>
  )
}

// Prefetch next page of data
function TodoPagination({ currentPage, totalPages }) {
  const queryClient = useQueryClient()
  
  // Prefetch the next page when the component renders
  useEffect(() => {
    if (currentPage < totalPages) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.todoSearch({ page: currentPage + 1 }),
        queryFn: () => api.getTodos({ page: currentPage + 1 })
      })
    }
  }, [currentPage, totalPages, queryClient])
  
  return (
    <div className="pagination">
      {/* Pagination controls */}
    </div>
  )
}`;

export default function BestPracticesExample() {
  const [activeTab, setActiveTab] = useState("query-keys");
  const { codeTheme } = useCodeTheme();

  // Reusable section components for consistent layout
  const BenefitsList = ({
    title,
    items,
  }: {
    title: string;
    items: string[];
  }) => (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">{title}</h3>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );

  const RecommendedPattern = ({
    title,
    description,
    code,
  }: {
    title: string;
    description: string;
    code: string;
  }) => (
    <div className="rounded-md bg-muted p-4">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <CodeBlock code={code} theme={codeTheme} />
    </div>
  );

  const KeyBenefits = ({
    items,
  }: {
    items: Array<{ title: string; description: string }>;
  }) => (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-muted rounded text-sm">
      <p className="font-medium mb-2">Key benefits:</p>
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, index) => (
          <li key={index}>
            <strong>{item.title}:</strong> {item.description}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <AlertTitle>Best Practices</AlertTitle>
        <AlertDescription>
          Following these patterns will help you build maintainable applications
          with React Query.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          <TabsTrigger value="query-keys">Query Keys</TabsTrigger>
          <TabsTrigger value="query-functions">Query Functions</TabsTrigger>
          <TabsTrigger value="custom-hooks">Custom Hooks</TabsTrigger>
          <TabsTrigger value="error-handling">Error Handling</TabsTrigger>
          <TabsTrigger value="optimistic">Optimistic Updates</TabsTrigger>
          <TabsTrigger value="prefetching">Prefetching</TabsTrigger>
        </TabsList>

        <TabsContent value="query-keys" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Query Key Factories
              </CardTitle>
              <CardDescription>
                Create a centralized query key factory to maintain consistent
                keys across your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <BenefitsList
                title="Why use query key factories?"
                items={[
                  "Prevents typos and inconsistencies in query keys",
                  "Makes refactoring easier - change keys in one place",
                  "Improves type safety with TypeScript",
                  "Makes query invalidation more reliable",
                ]}
              />

              <RecommendedPattern
                title="Recommended Pattern"
                description="Create a dedicated file for query keys that exports a factory object with methods for generating keys."
                code={QUERY_KEYS_FACTORY}
              />

              <KeyBenefits
                items={[
                  {
                    title: "Better Type Safety",
                    description:
                      'Using "as const" with array keys ensures proper TypeScript typing and prevents accidental key modifications.',
                  },
                  {
                    title: "Improved Invalidation Hierarchy",
                    description:
                      'Nesting keys like "todoItem" extending "todos" creates a hierarchy that makes targeted invalidation easier.',
                  },
                  {
                    title: "Colocate",
                    description:
                      "Query keys are used for deduplication, caching, and invalidation. Consider keeping the keys next to their respective queries, co-located in a feature directory.",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query-functions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Query Function Abstraction
              </CardTitle>
              <CardDescription>
                Separate API logic from React components for better
                maintainability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <BenefitsList
                title="Why abstract query functions?"
                items={[
                  "Separates concerns - API logic stays out of components",
                  "Makes testing easier - mock API functions independently",
                  "Enables reuse across multiple components",
                  "Simplifies error handling and request cancellation",
                ]}
              />

              <RecommendedPattern
                title="Recommended Pattern"
                description="Create a dedicated API module that handles all data fetching logic, then use it in your query functions."
                code={QUERY_FUNCTION_ABSTRACTION}
              />

              <KeyBenefits
                items={[
                  {
                    title: "Automatic Cancellation",
                    description:
                      "Passing the signal parameter enables query cancellation when components unmount or queries are invalidated.",
                  },
                  {
                    title: "Centralized Error Handling",
                    description:
                      "Ensures consistent error responses across your app.",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-hooks" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Custom Query Hooks
              </CardTitle>
              <CardDescription>
                Create domain-specific hooks that encapsulate query logic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <BenefitsList
                title="Why use custom hooks?"
                items={[
                  "Encapsulates query and mutation logic in one place",
                  "Makes components cleaner and more focused on UI",
                  "Enables reuse of complex query patterns",
                  "Simplifies testing of data fetching logic",
                ]}
              />

              <RecommendedPattern
                title="Recommended Pattern"
                description="Create custom hooks for each entity or feature in your application, combining queries and mutations."
                code={CUSTOM_HOOKS}
              />

              <KeyBenefits
                items={[
                  {
                    title: "Clean API",
                    description:
                      "Custom hooks let components interact with your data layer cleanly.",
                  },
                  {
                    title: "Scoped Logic",
                    description:
                      "Combining related queries and mutations in the same hook helps manage related state.",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-handling" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Error Handling Strategies
              </CardTitle>
              <CardDescription>
                Implement robust error handling for a better user experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <BenefitsList
                title="Why focus on error handling?"
                items={[
                  "Improves user experience by providing clear error messages",
                  "Prevents silent failures that can confuse users",
                  "Enables recovery strategies like retries or fallbacks",
                  "Helps with debugging and monitoring in production",
                ]}
              />

              <RecommendedPattern
                title="Recommended Pattern"
                description="Combine global error handling with component-specific error UI when needed."
                code={ERROR_HANDLING}
              />

              <KeyBenefits
                items={[
                  {
                    title: "Global Safety",
                    description:
                      "Global error handling ensures all unexpected errors are caught and displayed.",
                  },
                  {
                    title: "Contextual Feedback",
                    description:
                      "Component-specific error handling allows for contextual messages and recovery.",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimistic" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Optimistic Updates
              </CardTitle>
              <CardDescription>
                Update the UI immediately before the server confirms the change
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <BenefitsList
                title="Why use optimistic updates?"
                items={[
                  "Creates a more responsive user experience",
                  "Reduces perceived latency, especially on slower connections",
                  "Provides immediate feedback for user actions",
                  "Can automatically roll back on errors",
                ]}
              />

              <RecommendedPattern
                title="Recommended Pattern"
                description="Use the mutation lifecycle hooks to update the cache optimistically and roll back on errors."
                code={OPTIMISTIC_UPDATES}
              />

              <KeyBenefits
                items={[
                  {
                    title: "Immediate Feedback",
                    description:
                      "The onMutate callback lets you update the cache optimistically before the mutation completes.",
                  },
                  {
                    title: "Rollback Support",
                    description:
                      "The onError callback provides automatic rollback if the mutation fails.",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefetching" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Prefetching Strategies
              </CardTitle>
              <CardDescription>
                Load data before it&apos;s needed to improve perceived
                performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <BenefitsList
                title="Why prefetch data?"
                items={[
                  "Reduces loading times for predictable navigation paths",
                  "Creates a smoother user experience with less waiting",
                  "Can load data during idle periods",
                  "Makes applications feel faster and more responsive",
                ]}
              />

              <RecommendedPattern
                title="Recommended Patterns"
                description="Implement different prefetching strategies based on user behavior and application needs."
                code={PREFETCHING_STRATEGIES}
              />

              <KeyBenefits
                items={[
                  {
                    title: "Fast Initial Load",
                    description:
                      "Prefetching on page load ensures common data is ready immediately.",
                  },
                  {
                    title: "Instant Navigation",
                    description:
                      "Prefetching on hover improves perceived speed during link interaction.",
                  },
                  {
                    title: "Smooth Pagination",
                    description:
                      "Prefetching the next page creates seamless user experiences.",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
