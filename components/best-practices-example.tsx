"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { AlertCircle, CheckCircle, Code, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCodeTheme } from "./theme-code-provider";

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

  return (
    <div className="space-y-6">
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Best Practices</AlertTitle>
        <AlertDescription>
          Following these patterns will help you build maintainable applications
          with React Query.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="query-keys">Query Keys</TabsTrigger>
          <TabsTrigger value="query-functions">Query Functions</TabsTrigger>
          <TabsTrigger value="custom-hooks">Custom Hooks</TabsTrigger>
          <TabsTrigger value="error-handling">Error Handling</TabsTrigger>
          <TabsTrigger value="optimistic">Optimistic Updates</TabsTrigger>
          <TabsTrigger value="prefetching">Prefetching</TabsTrigger>
        </TabsList>

        <TabsContent value="query-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Query Key Factories
              </CardTitle>
              <CardDescription>
                Create a centralized query key factory to maintain consistent
                keys across your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Why use query key factories?
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Prevents typos and inconsistencies in query keys</li>
                  <li>Makes refactoring easier - change keys in one place</li>
                  <li>Improves type safety with TypeScript</li>
                  <li>Makes query invalidation more reliable</li>
                </ul>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recommended Pattern
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a dedicated file for query keys that exports a factory
                  object with methods for generating keys.
                </p>
                <CodeBlock code={QUERY_KEYS_FACTORY} theme={codeTheme} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Key benefits:</h3>
                <p className="text-muted-foreground">
                  Using{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    as const
                  </code>{" "}
                  with array keys ensures proper TypeScript typing and prevents
                  accidental key modifications.
                </p>
                <p className="text-muted-foreground">
                  Nesting keys (like{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    todoItem
                  </code>{" "}
                  extending{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    todos
                  </code>
                  ) creates a hierarchy that makes targeted invalidation easier.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Query keys are used for deduplication, caching, and
                  invalidation. Consistent key structure is crucial for proper
                  cache management.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="query-functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Query Function Abstraction
              </CardTitle>
              <CardDescription>
                Separate API logic from React components for better
                maintainability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Why abstract query functions?
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>
                    Separates concerns - API logic stays out of components
                  </li>
                  <li>
                    Makes testing easier - mock API functions independently
                  </li>
                  <li>Enables reuse across multiple components</li>
                  <li>Simplifies error handling and request cancellation</li>
                </ul>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recommended Pattern
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a dedicated API module that handles all data fetching
                  logic, then use it in your query functions.
                </p>
                <CodeBlock
                  code={QUERY_FUNCTION_ABSTRACTION}
                  theme={codeTheme}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Key benefits:</h3>
                <p className="text-muted-foreground">
                  Passing the{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    signal
                  </code>{" "}
                  parameter enables automatic query cancellation when components
                  unmount or queries are invalidated.
                </p>
                <p className="text-muted-foreground">
                  Centralizing error handling in the API layer ensures
                  consistent error responses across your application.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Custom Query Hooks
              </CardTitle>
              <CardDescription>
                Create domain-specific hooks that encapsulate query logic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Why use custom hooks?</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Encapsulates query and mutation logic in one place</li>
                  <li>Makes components cleaner and more focused on UI</li>
                  <li>Enables reuse of complex query patterns</li>
                  <li>Simplifies testing of data fetching logic</li>
                </ul>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recommended Pattern
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create custom hooks for each entity or feature in your
                  application, combining queries and mutations.
                </p>
                <CodeBlock code={CUSTOM_HOOKS} theme={codeTheme} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Key benefits:</h3>
                <p className="text-muted-foreground">
                  Custom hooks create a clean API for components to interact
                  with your data layer.
                </p>
                <p className="text-muted-foreground">
                  Combining related queries and mutations in the same hook makes
                  it easier to manage related state.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-handling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Error Handling Strategies
              </CardTitle>
              <CardDescription>
                Implement robust error handling for a better user experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Why focus on error handling?
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>
                    Improves user experience by providing clear error messages
                  </li>
                  <li>Prevents silent failures that can confuse users</li>
                  <li>Enables recovery strategies like retries or fallbacks</li>
                  <li>Helps with debugging and monitoring in production</li>
                </ul>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recommended Pattern
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Combine global error handling with component-specific error UI
                  when needed.
                </p>
                <CodeBlock code={ERROR_HANDLING} theme={codeTheme} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Key benefits:</h3>
                <p className="text-muted-foreground">
                  Global error handling ensures all unexpected errors are caught
                  and displayed.
                </p>
                <p className="text-muted-foreground">
                  Component-specific error handling allows for contextual error
                  messages and recovery options.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimistic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Optimistic Updates
              </CardTitle>
              <CardDescription>
                Update the UI immediately before the server confirms the change
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Why use optimistic updates?
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Creates a more responsive user experience</li>
                  <li>
                    Reduces perceived latency, especially on slower connections
                  </li>
                  <li>Provides immediate feedback for user actions</li>
                  <li>Can automatically roll back on errors</li>
                </ul>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recommended Pattern
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use the mutation lifecycle hooks to update the cache
                  optimistically and roll back on errors.
                </p>
                <CodeBlock code={OPTIMISTIC_UPDATES} theme={codeTheme} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Key benefits:</h3>
                <p className="text-muted-foreground">
                  The{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    onMutate
                  </code>{" "}
                  callback lets you update the cache before the mutation
                  completes.
                </p>
                <p className="text-muted-foreground">
                  The{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    onError
                  </code>{" "}
                  callback provides automatic rollback if the mutation fails.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefetching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Prefetching Strategies
              </CardTitle>
              <CardDescription>
                Load data before it&apos;s needed to improve perceived
                performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Why prefetch data?</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>
                    Reduces loading times for predictable navigation paths
                  </li>
                  <li>Creates a smoother user experience with less waiting</li>
                  <li>Can load data during idle periods</li>
                  <li>Makes applications feel faster and more responsive</li>
                </ul>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recommended Patterns
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Implement different prefetching strategies based on user
                  behavior and application needs.
                </p>
                <CodeBlock code={PREFETCHING_STRATEGIES} theme={codeTheme} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Key benefits:</h3>
                <p className="text-muted-foreground">
                  Prefetching on page load ensures common data is available
                  immediately.
                </p>
                <p className="text-muted-foreground">
                  Prefetching on hover makes navigation feel instant when users
                  interact with links.
                </p>
                <p className="text-muted-foreground">
                  Prefetching the next page of data creates seamless pagination
                  experiences.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
