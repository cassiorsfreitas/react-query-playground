"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CodeBlock } from "./code-block";

interface Post {
  id: number;
  title: string;
  body: string;
}

interface PostsResponse {
  posts: Post[];
  totalPages: number;
  nextCursor: number | null;
  prevCursor: number | null;
}

interface PaginationOptions {
  page: number;
  limit: number;
  signal?: AbortSignal;
  delay?: number;
}

const fetchPosts = async ({
  page,
  limit,
  delay = 1000,
}: PaginationOptions): Promise<PostsResponse> => {
  await new Promise((resolve) => setTimeout(resolve, delay));

  const allPosts: Post[] = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `Post ${i + 1}`,
    body: `This is the content of post ${
      i + 1
    }. It contains some sample text to demonstrate pagination.`,
  }));

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedPosts = allPosts.slice(start, end);
  const totalPages = Math.ceil(allPosts.length / limit);
  const nextCursor =
    end < allPosts.length ? paginatedPosts[paginatedPosts.length - 1].id : null;
  const prevCursor = start > 0 ? paginatedPosts[0].id - limit : null;

  return {
    posts: paginatedPosts,
    totalPages,
    nextCursor,
    prevCursor,
  };
};

function useOffsetPagination(options: {
  initialPage: number;
  limit: number;
  keepPreviousData: boolean;
}) {
  const { initialPage, limit, keepPreviousData } = options;
  const [page, setPage] = useState(initialPage);

  const query = useQuery<PostsResponse>({
    queryKey: ["posts", "offset", page, limit],
    queryFn: ({ signal }) => fetchPosts({ page, limit, signal }),
    placeholderData: keepPreviousData ? (oldData) => oldData : undefined,
  });

  const goToNextPage = () => {
    setPage((old) => Math.min(old + 1, query.data?.totalPages || old));
  };

  const goToPreviousPage = () => {
    setPage((old) => Math.max(old - 1, 1));
  };

  const canGoNext = page < (query.data?.totalPages || 1);
  const canGoPrevious = page > 1;

  return {
    query,
    page,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
    prefetchNextPage: (queryClient: ReturnType<typeof useQueryClient>) => {
      if (canGoNext) {
        queryClient.prefetchQuery({
          queryKey: ["posts", "offset", page + 1, limit],
          queryFn: ({ signal }) =>
            fetchPosts({ page: page + 1, limit, signal }),
        });
      }
    },
  };
}

function useCursorPagination(options: {
  limit: number;
  keepPreviousData: boolean;
}) {
  const { limit, keepPreviousData } = options;
  const [cursor, setCursor] = useState<number | null>(null);
  const [pageHistory, setPageHistory] = useState<number[]>([]);

  const cursorPage = cursor ? Math.ceil(cursor / limit) : 1;

  const query = useQuery<PostsResponse>({
    queryKey: ["posts", "cursor", cursor, limit],
    queryFn: ({ signal }) => fetchPosts({ page: cursorPage, limit, signal }),
    placeholderData: keepPreviousData ? (oldData) => oldData : undefined,
  });

  const goToNextPage = () => {
    if (query.data?.nextCursor) {
      setPageHistory((prev) => [...prev, cursor || 0]);
      setCursor(query.data.nextCursor);
    }
  };

  const goToPreviousPage = () => {
    if (pageHistory.length > 0) {
      const prevCursor = pageHistory[pageHistory.length - 1];
      setPageHistory((prev) => prev.slice(0, -1));
      setCursor(prevCursor === 0 ? null : prevCursor);
    } else {
      setCursor(null);
    }
  };

  const canGoNext = query.data?.nextCursor !== null;
  const canGoPrevious = cursor !== null;

  return {
    query,
    cursor,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
    prefetchNextPage: (queryClient: ReturnType<typeof useQueryClient>) => {
      if (canGoNext && query.data?.nextCursor) {
        const nextCursorPage = Math.ceil(query.data.nextCursor / limit);
        queryClient.prefetchQuery({
          queryKey: ["posts", "cursor", query.data.nextCursor, limit],
          queryFn: ({ signal }) =>
            fetchPosts({ page: nextCursorPage, limit, signal }),
        });
      }
    },
  };
}

function PostCard({ post }: { post: Post }) {
  return (
    <Card key={post.id}>
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{post.title}</span>
          <Badge variant="outline" className="ml-2">
            ID: {post.id}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm text-muted-foreground">{post.body}</p>
      </CardContent>
    </Card>
  );
}

function PostsLoading() {
  return (
    <div className="space-y-4" aria-label="Loading posts">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

function PostsError({ error }: { error: Error }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error loading posts</AlertTitle>
      <AlertDescription>
        {error?.message || "Failed to fetch posts. Please try again later."}
      </AlertDescription>
    </Alert>
  );
}

export default function PaginationExample() {
  const [paginationType, setPaginationType] = useState<"offset" | "cursor">(
    "offset"
  );
  const [keepPreviousData, setKeepPreviousData] = useState(true);
  const [prefetchEnabled, setPrefetchEnabled] = useState(true);
  const limit = 5;

  const queryClient = useQueryClient();

  const offsetPagination = useOffsetPagination({
    initialPage: 1,
    limit,
    keepPreviousData,
  });

  const cursorPagination = useCursorPagination({
    limit,
    keepPreviousData,
  });

  const pagination =
    paginationType === "offset" ? offsetPagination : cursorPagination;
  const { query } = pagination;

  const handlePrefetch = () => {
    if (prefetchEnabled) {
      pagination.prefetchNextPage(queryClient);
    }
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pagination Example</CardTitle>
            {query.isFetching && (
              <Badge
                variant="outline"
                className="animate-pulse bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              >
                <Loader2
                  className="mr-1 h-3 w-3 animate-spin"
                  aria-hidden="true"
                />
                <span>Fetching...</span>
              </Badge>
            )}
          </div>
          <CardDescription>
            Demonstrates offset and cursor-based pagination with React Query
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Tabs
              value={paginationType}
              onValueChange={(v) => setPaginationType(v as "offset" | "cursor")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="offset">Offset Pagination</TabsTrigger>
                <TabsTrigger value="cursor">Cursor Pagination</TabsTrigger>
              </TabsList>
              <TabsContent value="offset" className="mt-2 space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Offset-based Pagination</h3>
                  <p className="text-sm text-muted-foreground">
                    Uses page numbers to fetch data. Simple but can be
                    inefficient for large datasets.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="cursor" className="mt-2 space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Cursor-based Pagination</h3>
                  <p className="text-sm text-muted-foreground">
                    Uses a pointer (cursor) to fetch the next set of results.
                    More efficient for large, dynamic datasets.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="keep-previous"
                  checked={keepPreviousData}
                  onCheckedChange={setKeepPreviousData}
                  aria-label="Keep previous data while loading"
                />
                <Label htmlFor="keep-previous" className="flex items-center">
                  <span className="mr-1">Keep previous data</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full p-0"
                  >
                    <span className="sr-only">About keep previous data</span>
                  </Button>
                </Label>
              </div>
              <p className="text-sm mb-2">
                When enabled, the previous page data remains visible while the
                next page is loading, creating a smoother user experience.
              </p>

              <div className="flex items-center space-x-2">
                <Switch
                  id="prefetch"
                  checked={prefetchEnabled}
                  onCheckedChange={setPrefetchEnabled}
                  aria-label="Enable prefetching"
                />
                <Label htmlFor="prefetch" className="flex items-center">
                  <span className="mr-1">Enable prefetching</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full p-0"
                  >
                    <span className="sr-only">About prefetching</span>
                  </Button>
                </Label>
              </div>
              <p className="text-sm mb-2">
                When enabled, the next page is prefetched in the background when
                you hover over the &quot;Next&quot; button, making navigation
                feel instant.
              </p>
            </div>

            <div className="rounded-md bg-muted/50 p-3 border border-muted">
              <h3 className="text-sm font-medium mb-1">Code Example</h3>
              <CodeBlock
                code={`// ${
                  paginationType === "offset" ? "Offset" : "Cursor"
                } pagination with React Query
${
  paginationType === "offset"
    ? `const query = useQuery({
  queryKey: ["posts", "offset", page, limit],
  queryFn: () => fetchPosts({ page, limit }),
  placeholderData: ${
    keepPreviousData
      ? "keepPreviousData ? (oldData) => oldData : undefined"
      : "undefined"
  },
});`
    : `const query = useQuery({
  queryKey: ["posts", "cursor", cursor, limit],
  queryFn: () => fetchPosts({ page: cursorPage, limit }),
  placeholderData: ${
    keepPreviousData
      ? "keepPreviousData ? (oldData) => oldData : undefined"
      : "undefined"
  },
});`
}

${
  prefetchEnabled
    ? `// Prefetching next page
queryClient.prefetchQuery({
  queryKey: ["posts", "${paginationType}", ${
        paginationType === "offset" ? "page + 1" : "nextCursor"
      }, limit],
  queryFn: () => fetchPosts({ page: ${
    paginationType === "offset" ? "page + 1" : "nextCursorPage"
  }, limit }),
});`
    : "// Prefetching disabled"
}`}
              />
            </div>
          </div>

          <div aria-live="polite" className="min-h-[300px]">
            {query.isLoading ? (
              <PostsLoading />
            ) : query.isError ? (
              <PostsError error={query.error as Error} />
            ) : (
              <div className="space-y-4">
                {query.data?.posts.length === 0 ? (
                  <Alert>
                    <AlertTitle>No posts found</AlertTitle>
                    <AlertDescription>
                      There are no posts available for this page.
                    </AlertDescription>
                  </Alert>
                ) : (
                  query.data?.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            {paginationType === "offset" ? (
              <span>
                Page {offsetPagination.page} of {query.data?.totalPages || 1}
              </span>
            ) : (
              <span>
                {cursorPagination.cursor === null
                  ? "First page"
                  : `Cursor: ${cursorPagination.cursor}`}
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.goToPreviousPage}
              disabled={!pagination.canGoPrevious || query.isLoading}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />{" "}
              Previous
            </Button>

            <Button
              size="sm"
              onClick={pagination.goToNextPage}
              disabled={!pagination.canGoNext || query.isLoading}
              onMouseEnter={handlePrefetch}
              onFocus={handlePrefetch}
              aria-label="Go to next page"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
