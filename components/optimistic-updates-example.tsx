"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: number;
  title: string;
  likes: number;
}

const fetchPosts = async (): Promise<Post[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const stored = localStorage.getItem("react-query-posts");
  return stored
    ? JSON.parse(stored)
    : [
        { id: 1, title: "Understanding React Query", likes: 5 },
        { id: 2, title: "Optimistic Updates in React", likes: 3 },
        { id: 3, title: "Mastering Query Invalidation", likes: 7 },
      ];
};

const likePost = async (postId: number, shouldFail: boolean): Promise<Post> => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (shouldFail) {
    throw new Error("Network error! Like operation failed.");
  }

  const posts = await fetchPosts();

  const updatedPosts = posts.map((post) =>
    post.id === postId ? { ...post, likes: post.likes + 1 } : post
  );

  localStorage.setItem("react-query-posts", JSON.stringify(updatedPosts));

  return updatedPosts.find((post) => post.id === postId)!;
};

const resetPosts = () => {
  const defaultPosts = [
    { id: 1, title: "Understanding React Query", likes: 5 },
    { id: 2, title: "Optimistic Updates in React", likes: 3 },
    { id: 3, title: "Mastering Query Invalidation", likes: 7 },
  ];
  localStorage.setItem("react-query-posts", JSON.stringify(defaultPosts));
  return defaultPosts;
};

export default function OptimisticUpdatesExample() {
  const queryClient = useQueryClient();
  const [simulateError, setSimulateError] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const {
    data: posts,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["posts-with-likes"],
    queryFn: fetchPosts,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: number) => likePost(postId, simulateError),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts-with-likes"] });

      const previousPosts = queryClient.getQueryData<Post[]>([
        "posts-with-likes",
      ]);

      queryClient.setQueryData<Post[]>(["posts-with-likes"], (old) => {
        return old?.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        );
      });

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts-with-likes"], context?.previousPosts);

      toast({
        variant: "destructive",
        title: "Error liking post",
        description: "The like operation failed and was rolled back.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-with-likes"] });
    },
    onSuccess: () => {
      if (!simulateError) {
        toast({
          title: "Post liked",
          description: "Your like was successfully recorded.",
        });
      }
    },
  });

  const handleReset = async () => {
    setIsResetting(true);
    resetPosts();
    await refetch();
    setIsResetting(false);
    toast({
      title: "Posts reset",
      description: "All posts have been reset to their initial state.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Optimistic Updates Example
          {isFetching && !isLoading && (
            <Badge
              variant="outline"
              className="animate-pulse bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            >
              Refetching...
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Demonstrates optimistic updates with rollback on error
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="simulate-error"
              checked={simulateError}
              onCheckedChange={setSimulateError}
            />
            <Label htmlFor="simulate-error">Simulate error on like</Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset All Posts"}
          </Button>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
          <p>
            This example has a <strong>3-second delay</strong> in the API call
            to demonstrate optimistic updates. When you click &quot;Like&quot;,
            the UI updates immediately while the request is processing.
          </p>
          <p className="mt-2">
            <strong>Toggle &quot;Simulate error&quot;</strong> to see how React
            Query handles rollback when a mutation fails.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || "Failed to fetch posts"}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {posts?.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div>
                  <h3 className="font-medium">{post.title}</h3>
                  <div className="text-sm text-gray-500">
                    {post.likes} likes
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => likeMutation.mutate(post.id)}
                    disabled={
                      likeMutation.isPending &&
                      likeMutation.variables === post.id
                    }
                    className={`flex items-center gap-1 ${
                      simulateError
                        ? "hover:bg-red-100 dark:hover:bg-red-900/20"
                        : ""
                    }`}
                  >
                    {simulateError ? (
                      <ThumbsDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <ThumbsUp className="h-4 w-4" />
                    )}
                    {likeMutation.isPending &&
                    likeMutation.variables === post.id ? (
                      <span className="ml-1">Processing...</span>
                    ) : (
                      <span className="ml-1">Like</span>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-100 dark:bg-muted rounded text-sm">
          <p className="font-medium mb-2">How optimistic updates work:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              When you click &quot;Like&quot;, the <code>onMutate</code>{" "}
              callback runs immediately
            </li>
            <li>
              It updates the UI optimistically (before the API call completes)
            </li>
            <li>
              If the API call succeeds, the optimistic update is confirmed
            </li>
            <li>
              If the API call fails, we roll back to the previous state using
              the snapshot
            </li>
            <li>Finally, we invalidate the query to ensure data consistency</li>
          </ol>

          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            <p className="font-medium text-red-700 dark:text-red-400">
              To see rollback in action:
            </p>
            <ol className="list-decimal list-inside text-red-600 dark:text-red-300">
              <li>Toggle &quot;Simulate error&quot; on</li>
              <li>Click &quot;Like&quot; on any post</li>
              <li>Watch the count increase immediately (optimistic update)</li>
              <li>After 3 seconds, see it roll back when the error occurs</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
