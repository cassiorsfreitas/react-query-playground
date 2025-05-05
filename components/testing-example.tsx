"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "./code-block";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Code,
  Play,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

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

// Sample implementation files
const USER_PROFILE_CODE = `// UserProfile.tsx
import { useQuery } from '@tanstack/react-query'

interface User {
  id: number
  name: string
  email?: string
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`)
  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }
  return response.json()
}

export default function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  if (isLoading) return <div>Loading user data...</div>
  if (error) return <div>Error loading user: {error.message}</div>
  
  return (
    <div className="user-profile">
      <h2>{data?.name}</h2>
      {data?.email && <p>{data.email}</p>}
    </div>
  )
}`;

const USE_USER_HOOK_CODE = `// useUser.ts
import { useQuery } from '@tanstack/react-query'

interface User {
  id: number
  name: string
  email?: string
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`)
  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }
  return response.json()
}

export function useUser(userId: number) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })
}`;

type TestStatus = "idle" | "running" | "passed" | "failed";

interface TestStep {
  description: string;
  status: TestStatus;
  output?: string;
  error?: string;
}

interface TestCase {
  name: string;
  status: TestStatus;
  steps: TestStep[];
  duration?: number;
}

export default function TestRunner() {
  const [activeTab, setActiveTab] = useState("component");
  const [testCases, setTestCases] = useState<Record<string, TestCase>>({
    component: {
      name: "displays user data when fetch succeeds",
      status: "idle",
      steps: [
        { description: "Mock fetch function", status: "idle" },
        { description: "Render component with test client", status: "idle" },
        { description: "Verify loading state is shown", status: "idle" },
        { description: "Wait for user data to be displayed", status: "idle" },
      ],
    },
    hooks: {
      name: "successful query hook",
      status: "idle",
      steps: [
        { description: "Mock fetch function", status: "idle" },
        { description: "Render hook with wrapper", status: "idle" },
        { description: "Check initial loading state", status: "idle" },
        { description: "Wait for query to finish", status: "idle" },
        { description: "Verify returned data", status: "idle" },
      ],
    },
    mocking: {
      name: "renders user profile with mocked data",
      status: "idle",
      steps: [
        { description: "Create mocked QueryClient", status: "idle" },
        { description: "Prefill cache with test data", status: "idle" },
        { description: "Render component with mocked client", status: "idle" },
        { description: "Verify data is displayed from cache", status: "idle" },
      ],
    },
  });

  const componentResultRef = useRef<HTMLDivElement>(null);
  const hooksResultRef = useRef<HTMLDivElement>(null);
  const mockingResultRef = useRef<HTMLDivElement>(null);

  const getActiveResultRef = () => {
    switch (activeTab) {
      case "component":
        return componentResultRef;
      case "hooks":
        return hooksResultRef;
      case "mocking":
        return mockingResultRef;
      default:
        return componentResultRef;
    }
  };

  const runTest = async (testType: string) => {
    setTestCases((prev) => ({
      ...prev,
      [testType]: {
        ...prev[testType],
        status: "running",
        duration: undefined,
        steps: prev[testType].steps.map((step) => ({
          ...step,
          status: "idle",
        })),
      },
    }));

    const startTime = Date.now();

    const resultRef = getActiveResultRef();
    if (resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    for (let i = 0; i < testCases[testType].steps.length; i++) {
      setTestCases((prev) => ({
        ...prev,
        [testType]: {
          ...prev[testType],
          steps: prev[testType].steps.map((step, idx) =>
            idx === i ? { ...step, status: "running" } : step
          ),
        },
      }));

      await new Promise((resolve) => setTimeout(resolve, 600));

      let stepStatus: TestStatus = "passed";
      const output = "";
      let error = "";

      if (testType === "hooks" && i === 3 && Math.random() > 0.7) {
        stepStatus = "failed";
        error =
          "Timed out waiting for condition to be met: expect(result.current.isSuccess).toBe(true)";
      }

      setTestCases((prev) => ({
        ...prev,
        [testType]: {
          ...prev[testType],
          steps: prev[testType].steps.map((step, idx) =>
            idx === i ? { ...step, status: stepStatus, output, error } : step
          ),
        },
      }));
    }

    const duration = Date.now() - startTime;
    const hasFailedSteps = testCases[testType].steps.some(
      (step) => step.status === "failed"
    );

    setTestCases((prev) => ({
      ...prev,
      [testType]: {
        ...prev[testType],
        status: hasFailedSteps ? "failed" : "passed",
        duration,
      },
    }));
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case "passed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          >
            Failed
          </Badge>
        );
      case "running":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 animate-pulse"
          >
            Running
          </Badge>
        );
      default:
        return <Badge variant="outline">Not Run</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          React Query Test Runner
          <Button
            variant="outline"
            size="sm"
            onClick={() => runTest(activeTab)}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Test
          </Button>
        </CardTitle>
        <CardDescription>
          Interactive simulation of running React Query tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="component">Component Tests</TabsTrigger>
            <TabsTrigger value="hooks">Hook Tests</TabsTrigger>
            <TabsTrigger value="mocking">Mocking QueryClient</TabsTrigger>
          </TabsList>

          <TabsContent value="component" className="space-y-4">
            <Tabs defaultValue="test" className="mb-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="test">Test Case</TabsTrigger>
              </TabsList>
              <TabsContent value="implementation" className="mt-2">
                <h3 className="text-lg font-medium mb-2">
                  Component Under Test
                </h3>
                <CodeBlock code={USER_PROFILE_CODE} />
              </TabsContent>
              <TabsContent value="test" className="mt-2">
                <h3 className="text-lg font-medium mb-2">Test Case</h3>
                <CodeBlock code={COMPONENT_TEST_CODE} />
              </TabsContent>
            </Tabs>

            <Card ref={componentResultRef}>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testCases.component.status)}
                    <span>Test: {testCases.component.name}</span>
                  </div>
                  {getStatusBadge(testCases.component.status)}
                </CardTitle>
                {testCases.component.duration && (
                  <CardDescription>
                    Duration: {testCases.component.duration}ms
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  {testCases.component.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 rounded border"
                    >
                      {getStatusIcon(step.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {step.description}
                        </p>
                        {step.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {step.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hooks" className="space-y-4">
            <Tabs defaultValue="test" className="mb-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="test">Test Case</TabsTrigger>
              </TabsList>
              <TabsContent value="implementation" className="mt-2">
                <h3 className="text-lg font-medium mb-2">Hook Under Test</h3>
                <CodeBlock code={USE_USER_HOOK_CODE} />
              </TabsContent>
              <TabsContent value="test" className="mt-2">
                <h3 className="text-lg font-medium mb-2">Test Case</h3>
                <CodeBlock code={HOOK_TEST_CODE} />
              </TabsContent>
            </Tabs>

            <Card ref={hooksResultRef}>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testCases.hooks.status)}
                    <span>Test: {testCases.hooks.name}</span>
                  </div>
                  {getStatusBadge(testCases.hooks.status)}
                </CardTitle>
                {testCases.hooks.duration && (
                  <CardDescription>
                    Duration: {testCases.hooks.duration}ms
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  {testCases.hooks.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 rounded border"
                    >
                      {getStatusIcon(step.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {step.description}
                        </p>
                        {step.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {step.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mocking" className="space-y-4">
            <Tabs defaultValue="test" className="mb-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="test">Test Utilities & Case</TabsTrigger>
              </TabsList>
              <TabsContent value="implementation" className="mt-2">
                <h3 className="text-lg font-medium mb-2">
                  Component Under Test
                </h3>
                <CodeBlock code={USER_PROFILE_CODE} />
              </TabsContent>
              <TabsContent value="test" className="mt-2">
                <h3 className="text-lg font-medium mb-2">
                  Test Utilities & Case
                </h3>
                <CodeBlock code={MOCKING_CODE} />
              </TabsContent>
            </Tabs>

            <Card ref={mockingResultRef}>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testCases.mocking.status)}
                    <span>Test: {testCases.mocking.name}</span>
                  </div>
                  {getStatusBadge(testCases.mocking.status)}
                </CardTitle>
                {testCases.mocking.duration && (
                  <CardDescription>
                    Duration: {testCases.mocking.duration}ms
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  {testCases.mocking.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 rounded border"
                    >
                      {getStatusIcon(step.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {step.description}
                        </p>
                        {step.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {step.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
