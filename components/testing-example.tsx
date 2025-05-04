"use client";

import { useState } from "react";
import { Code } from "lucide-react";
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

const COMPONENT_TEST_CODE = `// UserProfile.test.tsx
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserProfile from './UserProfile'

// Create a fresh QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't retry failed queries in tests
    },
  },
})

// Wrapper component with QueryClientProvider
const renderWithClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  )
}

test('displays user data when fetch succeeds', async () => {
  // Mock the fetch function
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, name: 'John Doe' }),
  })

  // Render the component with the test client
  renderWithClient(<UserProfile userId={1} />)
  
  // Verify loading state is shown
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
  
  // Wait for the user data to be displayed
  expect(await screen.findByText('John Doe')).toBeInTheDocument()
})`;

const HOOK_TEST_CODE = `// useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUser } from './useUser'

// Create a wrapper with the QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useUser hook', () => {
  test('successful query hook', async () => {
    // Mock the fetch function
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: 'John Doe' }),
    })

    // Render the hook with the wrapper
    const { result } = renderHook(() => useUser(1), {
      wrapper: createWrapper(),
    })
    
    // Initially in loading state
    expect(result.current.isLoading).toBe(true)
    
    // Wait for the query to finish
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    // Verify the data
    expect(result.current.data).toEqual({ id: 1, name: 'John Doe' })
  })
})`;

const MOCKING_CODE = `// test-utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

// Create a client with predefined data
export function createMockedQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  // Prefill the cache with mock data
  queryClient.setQueryData(['user', 1], {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  })
  
  return queryClient
}

// Render with mocked data
export function renderWithMockedQuery(ui: React.ReactElement) {
  const queryClient = createMockedQueryClient()
  
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

// Usage in tests
test('renders user profile with mocked data', () => {
  const { getByText } = renderWithMockedQuery(<UserProfile userId={1} />)
  
  // Data is immediately available from the cache
  expect(getByText('John Doe')).toBeInTheDocument()
  expect(getByText('john@example.com')).toBeInTheDocument()
})`;

export default function TestingExample() {
  const [activeTab, setActiveTab] = useState("component");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Testing Example
        </CardTitle>
        <CardDescription>
          Demonstrates how to test components using React Query
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="component">Component Tests</TabsTrigger>
              <TabsTrigger value="hooks">Hook Tests</TabsTrigger>
              <TabsTrigger value="mocking">Mocking QueryClient</TabsTrigger>
            </TabsList>
            <TabsContent value="component" className="mt-2 space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">
                  Testing Components with React Query
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn how to test components that use React Query hooks with
                  proper mocking.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="hooks" className="mt-2 space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">Testing Custom Query Hooks</h3>
                <p className="text-sm text-muted-foreground">
                  Strategies for testing your custom React Query hooks in
                  isolation.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="mocking" className="mt-2 space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">Mocking the QueryClient</h3>
                <p className="text-sm text-muted-foreground">
                  How to create a test QueryClient with predefined cache data.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {activeTab === "component" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Component Testing Example</h3>
              <CodeBlock code={COMPONENT_TEST_CODE} />
            </div>
          )}

          {activeTab === "hooks" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hook Testing Example</h3>
              <CodeBlock code={HOOK_TEST_CODE} />
            </div>
          )}

          {activeTab === "mocking" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                QueryClient Mocking Example
              </h3>
              <CodeBlock code={MOCKING_CODE} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Testing Best Practices</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <Code className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Create a fresh QueryClient for each test to avoid cross-test
                pollution
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Code className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Disable retries in tests to make them more predictable
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Code className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Use setQueryData to prefill the cache for specific test
                scenarios
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Code className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Test both loading states and success/error outcomes</span>
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
}
