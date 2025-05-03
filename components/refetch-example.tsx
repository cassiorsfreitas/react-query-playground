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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const fetchRandomNumber = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return Math.floor(Math.random() * 100);
};

export default function RefetchExample() {
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["randomNumber"],
    queryFn: fetchRandomNumber,
    refetchInterval,
  });

  const toggleAutoRefetch = () => {
    setRefetchInterval((current) => (current ? false : 2000));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Refetch Example
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
          Demonstrates different ways to trigger refetching
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-20 mx-auto rounded-full" />
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || "Failed to fetch random number"}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">{data}</div>
            <div className="text-sm text-gray-500 mb-4">
              Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => refetch()}>Manual Refetch</Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={refetchInterval ? "destructive" : "outline"}
                    onClick={toggleAutoRefetch}
                  >
                    {refetchInterval
                      ? "Stop Auto Refetch (2s)"
                      : "Start Auto Refetch (2s)"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <pre className="text-xs">
                    <code>
                      {`useQuery({
  queryKey: ["randomNumber"],
  queryFn: fetchRandomNumber,
  refetchInterval,
})`}
                    </code>
                  </pre>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm text-left">
              <p className="font-medium mb-2">Try these refetch triggers:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Manual Refetch:</strong> Click the Manual Refetch
                  button
                </li>
                <li>
                  <strong>Auto Refetch:</strong> Enable background updates
                </li>
                <li>
                  <strong>Window Focus:</strong> Switch tabs and come back
                  <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
                    <code>refetchOnWindowFocus: true</code>
                  </div>
                </li>
                <li>
                  <strong>Stale Timeout:</strong> Wait for{" "}
                  <code>staleTime</code> to pass
                  <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
                    <code>staleTime: 10000</code> (10 seconds)
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
