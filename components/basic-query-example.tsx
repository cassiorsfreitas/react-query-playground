"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const fetchTodos = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    { id: 1, title: "Learn React Query", completed: true },
    { id: 2, title: "Build a demo", completed: true },
    { id: 3, title: "Share with team", completed: false },
  ];
};

export default function BasicQueryExample() {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Basic Query Example
          {isFetching && !isLoading && (
            <Badge
              variant="outline"
              className="animate-pulse bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            >
              Background Refetching...
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Simple demonstration of a basic query with loading and error states
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || "Failed to fetch todos"}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <ul className="space-y-2">
              {data?.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span>{todo.title}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button onClick={() => refetch()}>Manual Refetch</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
