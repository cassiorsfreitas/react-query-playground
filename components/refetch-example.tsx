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
              <Button
                variant={refetchInterval ? "destructive" : "outline"}
                onClick={toggleAutoRefetch}
              >
                {refetchInterval
                  ? "Stop Auto Refetch (2s)"
                  : "Start Auto Refetch (2s)"}
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Try these refetch triggers:</p>
              <ul className="list-disc list-inside text-left mt-2">
                <li>Click the Manual Refetch button</li>
                <li>Enable Auto Refetch</li>
                <li>Switch tabs and come back (refetchOnWindowFocus)</li>
                <li>Wait for staleTime to pass (10 seconds)</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
