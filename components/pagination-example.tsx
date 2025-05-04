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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface Post {
  id: number;
  title: string;
  body: string;
}

interface PostsResponse {
  posts: Post[];
  totalPages: number;
  nextCursor: number | null;
}

const fetchPosts = async ({
  page,
  limit,
  delay = 1000,
}: {
  page: number;
  limit: number;
  signal?: AbortSignal;
  delay?: number;
}): Promise<PostsResponse> => {
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

  return {
    posts: paginatedPosts,
    totalPages,
    nextCursor,
  };
};

export default function PaginationExample() {
  const [paginationType, setPaginationType] = useState<"offset" | "cursor">(
    "offset"
  );
  const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState<number | null>(null);
  const [keepPreviousData, setKeepPreviousData] = useState(true);
  const [prefetchEnabled, setPrefetchEnabled] = useState(true);
  const limit = 5;

  const queryClient = useQueryClient();

  const offsetQuery = useQuery<PostsResponse>({
    queryKey: ["posts", "offset", page, limit],
    queryFn: ({ signal }) => fetchPosts({ page, limit, signal }),
    placeholderData: keepPreviousData ? (oldData) => oldData : undefined,
  });

  const cursorQuery = useQuery<PostsResponse>({
    queryKey: ["posts", "cursor", cursor, limit],
    queryFn: ({ signal }) => {
      const cursorPage = cursor ? Math.ceil(cursor / limit) : 1;
      const result = fetchPosts({ page: cursorPage, limit, signal });
      return result;
    },
    placeholderData: keepPreviousData ? (oldData) => oldData : undefined,
  });

  const query = paginationType === "offset" ? offsetQuery : cursorQuery;

  const prefetchNextPage = () => {
    if (!prefetchEnabled) return;

    if (paginationType === "offset" && page < (query.data?.totalPages || 1)) {
      queryClient.prefetchQuery({
        queryKey: ["posts", "offset", page + 1, limit],
        queryFn: ({ signal }) => fetchPosts({ page: page + 1, limit, signal }),
      });
    } else if (paginationType === "cursor" && query.data?.nextCursor) {
      const nextCursorPage = Math.ceil(query.data.nextCursor / limit);
      queryClient.prefetchQuery({
        queryKey: ["posts", "cursor", query.data.nextCursor, limit],
        queryFn: ({ signal }) =>
          fetchPosts({ page: nextCursorPage, limit, signal }),
      });
    }
  };

  const goToNextPage = () => {
    if (paginationType === "offset") {
      setPage((old) => Math.min(old + 1, query.data?.totalPages || old));
    } else {
      setCursor(query.data?.nextCursor || null);
    }
  };

  const goToPreviousPage = () => {
    if (paginationType === "offset") {
      setPage((old) => Math.max(old - 1, 1));
    } else {
      const prevCursor = cursor ? cursor - limit : null;
      setCursor(prevCursor && prevCursor > 0 ? prevCursor : null);
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pagination Example
            {query.isFetching && (
              <Badge
                variant="outline"
                className="animate-pulse bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              >
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Fetching...
              </Badge>
            )}
          </CardTitle>
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

          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="keep-previous"
                checked={keepPreviousData}
                onCheckedChange={setKeepPreviousData}
              />
              <Label htmlFor="keep-previous">
                <span className="mr-1">Keep previous data</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-xs">
                      ?
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">
                      When enabled, the previous page data remains visible while
                      the next page is loading, creating a smoother user
                      experience. When disabled, you&apos;ll see a loading state
                      between page transitions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="prefetch"
                checked={prefetchEnabled}
                onCheckedChange={setPrefetchEnabled}
              />
              <Label htmlFor="prefetch">
                <span className="mr-1">Enable prefetching</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-xs">
                      ?
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">
                      When enabled, the next page is prefetched in the
                      background, making navigation feel instant when you click
                      &quot;Next&quot;.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
          </div>

          {query.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : query.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {(query.error as Error)?.message || "Failed to fetch posts"}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {query.data?.posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">
                      {post.title}{" "}
                      <Badge variant="outline">ID: {post.id}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-muted-foreground">{post.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            {paginationType === "offset" ? (
              <span>
                Page {page} of {query.data?.totalPages || 1}
              </span>
            ) : (
              <span>Cursor: {cursor === null ? "Start" : cursor}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={
                paginationType === "offset" ? page <= 1 : cursor === null
              }
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={goToNextPage}
                  disabled={
                    paginationType === "offset"
                      ? page >= (query.data?.totalPages || 1)
                      : query.data?.nextCursor === null
                  }
                  onMouseEnter={prefetchNextPage}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {prefetchEnabled
                    ? "Hovering prefetches the next page!"
                    : "Enable prefetching to load the next page on hover"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
