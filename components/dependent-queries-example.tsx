"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { CodeBlock } from "./code-block";

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

const fetchUsers = async (): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Carol Williams" },
  ];
};

const fetchPostsByUser = async (userId: number): Promise<Post[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const allPosts = [
    {
      id: 1,
      userId: 1,
      title: "Alice's first post",
      body: "This is my first post content",
    },
    {
      id: 2,
      userId: 1,
      title: "Alice's second post",
      body: "This is another post by me",
    },
    {
      id: 3,
      userId: 2,
      title: "Bob's thoughts",
      body: "Here's what I think about React Query",
    },
    {
      id: 4,
      userId: 3,
      title: "Carol's guide",
      body: "A beginner's guide to query invalidation",
    },
    {
      id: 5,
      userId: 2,
      title: "More from Bob",
      body: "Additional thoughts on React",
    },
    {
      id: 6,
      userId: 3,
      title: "Carol's tips",
      body: "Tips for effective state management",
    },
  ];

  return allPosts.filter((post) => post.userId === userId);
};

export default function DependentQueriesExample() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: errorUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
    error: errorPosts,
    isFetching: isFetchingPosts,
  } = useQuery({
    queryKey: ["posts", selectedUserId],
    queryFn: () => fetchPostsByUser(selectedUserId!),
    enabled: !!selectedUserId, // Only run this query if we have a selectedUserId
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dependent Queries Example</CardTitle>
        <CardDescription>
          Demonstrates how to make one query depend on the result of another
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select a user:
            </label>
            {isLoadingUsers ? (
              <Skeleton className="h-10 w-full" />
            ) : isErrorUsers ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorUsers?.message || "Failed to fetch users"}
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={selectedUserId?.toString() || ""}
                onValueChange={(value) => setSelectedUserId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">{`User's Posts:`}</h3>
              {isFetchingPosts && (
                <Badge
                  variant="outline"
                  className="animate-pulse bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                >
                  Fetching Posts...
                </Badge>
              )}
            </div>

            {!selectedUserId ? (
              <p className="text-center text-gray-500 py-4">
                Select a user to see their posts
              </p>
            ) : isLoadingPosts ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : isErrorPosts ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorPosts?.message || "Failed to fetch posts"}
                </AlertDescription>
              </Alert>
            ) : posts?.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No posts found for this user
              </p>
            ) : (
              <div className="space-y-3">
                {posts?.map((post) => (
                  <Card key={post.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {post.body}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <CodeBlock
          className="mt-4"
          code={`  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
    error: errorPosts,
    isFetching: isFetchingPosts,
  } = useQuery({
    queryKey: ["posts", selectedUserId],
    queryFn: () => fetchPostsByUser(selectedUserId!),
    enabled: !!selectedUserId, // Only run this query if we have a selectedUserId
  });`}
        />

        <div className="mt-4 p-3 bg-gray-100 dark:bg-muted rounded text-sm text-left">
          <p className="font-medium mb-2">How dependent queries work:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              <strong>Initial Query:</strong> Fetches the list of users
            </li>
            <li>
              <strong>User Selection:</strong> When a user is selected, their ID
              is stored in state
            </li>
            <li>
              <strong>Dependent Query:</strong> Posts query includes the user ID
              in its query key
              <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
                <code>{`queryKey: ["posts", userId]`}</code>
              </div>
            </li>
            <li>
              <strong>Query Control:</strong> The <code>enabled</code> option
              prevents the query from running until a user is selected
              <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
                <code>{`enabled: !!userId`}</code>
              </div>
            </li>
            <li>
              <strong>Automatic Refetch:</strong> When the user selection
              changes, React Query automatically refetches the dependent query
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
