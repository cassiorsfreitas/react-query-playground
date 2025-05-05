"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
}

const fetchProducts = async (
  category: string,
  delay = 2000,
  shouldError = false
): Promise<Product[]> => {
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (shouldError) {
    throw new Error("Failed to fetch products");
  }

  const products: Record<string, Product[]> = {
    electronics: [
      {
        id: 1,
        name: "Smartphone",
        price: 699,
        description: "Latest model with advanced features",
        category: "electronics",
      },
      {
        id: 2,
        name: "Laptop",
        price: 1299,
        description: "Powerful laptop for work and gaming",
        category: "electronics",
      },
      {
        id: 3,
        name: "Headphones",
        price: 199,
        description: "Noise-cancelling wireless headphones",
        category: "electronics",
      },
    ],
    clothing: [
      {
        id: 4,
        name: "T-Shirt",
        price: 29,
        description: "Comfortable cotton t-shirt",
        category: "clothing",
      },
      {
        id: 5,
        name: "Jeans",
        price: 79,
        description: "Classic blue jeans",
        category: "clothing",
      },
      {
        id: 6,
        name: "Jacket",
        price: 129,
        description: "Waterproof jacket for all seasons",
        category: "clothing",
      },
    ],
    books: [
      {
        id: 7,
        name: "Novel",
        price: 19,
        description: "Bestselling fiction novel",
        category: "books",
      },
      {
        id: 8,
        name: "Cookbook",
        price: 24,
        description: "Collection of gourmet recipes",
        category: "books",
      },
      {
        id: 9,
        name: "Biography",
        price: 22,
        description: "Life story of a famous person",
        category: "books",
      },
    ],
  };

  return products[category] || [];
};

function TraditionalProducts({
  category,
  shouldError,
}: {
  category: string;
  shouldError: boolean;
}) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", category, shouldError],
    queryFn: () => fetchProducts(category, 2000, shouldError),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {(error as Error)?.message || "Failed to fetch products"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {data?.map((product) => (
        <Card key={product.id}>
          <CardHeader className="py-3">
            <CardTitle className="text-base">{product.name}</CardTitle>
            <CardDescription>${product.price}</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SuspenseProducts({
  category,
  shouldError,
}: {
  category: string;
  shouldError: boolean;
}) {
  const { data } = useSuspenseQuery({
    queryKey: ["products", category, shouldError],
    queryFn: () => fetchProducts(category, 2000, shouldError),
  });

  return (
    <div className="space-y-4">
      {data?.map((product) => (
        <Card key={product.id}>
          <CardHeader className="py-3">
            <CardTitle className="text-base">{product.name}</CardTitle>
            <CardDescription>${product.price}</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error.message}</p>
        <Button size="sm" variant="outline" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export default function SuspenseExample() {
  const [category, setCategory] = useState("electronics");
  const [shouldError, setShouldError] = useState(false);
  const [queryType, setQueryType] = useState<"traditional" | "suspense">(
    "traditional"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Suspense Mode Example
          <Badge variant="outline" className="bg-primary/10 text-primary">
            React 18+
          </Badge>
        </CardTitle>
        <CardDescription>
          Demonstrates React Query with React Suspense and Error Boundaries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Tabs
            value={queryType}
            onValueChange={(v) => setQueryType(v as "traditional" | "suspense")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="traditional">Traditional Query</TabsTrigger>
              <TabsTrigger value="suspense">Suspense Mode</TabsTrigger>
            </TabsList>
            <TabsContent value="traditional" className="mt-2 space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">Traditional Query</h3>
                <p className="text-sm text-muted-foreground">
                  Uses isLoading and isError flags to handle loading and error
                  states within the component.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="suspense" className="mt-2 space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">Suspense Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Uses React Suspense and Error Boundaries to handle loading and
                  error states outside the component.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category:
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-md border border-input bg-muted px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="error-toggle" className="text-sm font-medium">
                Simulate error:
              </label>
              <input
                id="error-toggle"
                type="checkbox"
                checked={shouldError}
                onChange={() => setShouldError(!shouldError)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {queryType === "traditional" ? (
          <TraditionalProducts category={category} shouldError={shouldError} />
        ) : (
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => setShouldError(false)}
            resetKeys={[category, shouldError]}
          >
            <Suspense fallback={<LoadingFallback />}>
              <SuspenseProducts category={category} shouldError={shouldError} />
            </Suspense>
          </ErrorBoundary>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">How Suspense Mode Works</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Suspense mode leverages React&apos;s Suspense feature to handle
            loading states and Error Boundaries for error handling.
          </p>
          <CodeBlock
            code={`// Suspense mode
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<LoadingSpinner />}>
    <SuspenseProducts />
  </Suspense>
</ErrorBoundary>

// Inside the component
const { data } = useSuspenseQuery({
  queryKey: ["products"],
  queryFn: fetchProducts
})`}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
