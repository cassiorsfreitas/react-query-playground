"use client";

import type React from "react";

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
import { AlertCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface BasicTodo {
  id: number;
  title: string;
  completed: boolean;
}

interface AdvancedTodo {
  id: number;
  title: string;
  completed: boolean;
  list: "A" | "B";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

const fetchBasicTodos = async (): Promise<BasicTodo[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const stored = localStorage.getItem("react-query-basic-todos");
  return stored
    ? JSON.parse(stored)
    : [
        { id: 1, title: "Learn React Query", completed: false },
        { id: 2, title: "Master invalidation", completed: false },
      ];
};

const addBasicTodo = async (title: string): Promise<BasicTodo> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const current = await fetchBasicTodos();

  const newTodo = {
    id: Date.now(),
    title,
    completed: false,
  };

  const updated = [...current, newTodo];
  localStorage.setItem("react-query-basic-todos", JSON.stringify(updated));

  return newTodo;
};

const deleteBasicTodo = async (id: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const current = await fetchBasicTodos();

  const updated = current.filter((todo) => todo.id !== id);
  localStorage.setItem("react-query-basic-todos", JSON.stringify(updated));
};

const fetchAdvancedTodos = async (list: "A" | "B"): Promise<AdvancedTodo[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const key = `react-query-advanced-todos-${list}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    return JSON.parse(stored);
  }

  const defaults: Record<"A" | "B", AdvancedTodo[]> = {
    A: [
      {
        id: 1,
        title: "Learn React Query",
        completed: false,
        list: "A",
        priority: "high",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Master invalidation",
        completed: false,
        list: "A",
        priority: "medium",
        createdAt: new Date().toISOString(),
      },
    ],
    B: [
      {
        id: 101,
        title: "Study predicates",
        completed: false,
        list: "B",
        priority: "high",
        createdAt: new Date().toISOString(),
      },
      {
        id: 102,
        title: "Practice refetching",
        completed: false,
        list: "B",
        priority: "medium",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  localStorage.setItem(key, JSON.stringify(defaults[list]));
  return defaults[list];
};

const addAdvancedTodo = async (
  todo: Omit<AdvancedTodo, "id" | "createdAt">
): Promise<AdvancedTodo> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const current = await fetchAdvancedTodos(todo.list);

  const newTodo = {
    ...todo,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };

  const updated = [...current, newTodo];
  localStorage.setItem(
    `react-query-advanced-todos-${todo.list}`,
    JSON.stringify(updated)
  );

  return newTodo;
};

const deleteAdvancedTodo = async (
  id: number,
  list: "A" | "B"
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const current = await fetchAdvancedTodos(list);

  const updated = current.filter((todo) => todo.id !== id);
  localStorage.setItem(
    `react-query-advanced-todos-${list}`,
    JSON.stringify(updated)
  );
};

const toggleAdvancedTodo = async (
  id: number,
  list: "A" | "B"
): Promise<AdvancedTodo> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const current = await fetchAdvancedTodos(list);

  const todoIndex = current.findIndex((todo) => todo.id === id);
  if (todoIndex === -1) throw new Error("Todo not found");

  const updatedTodo = {
    ...current[todoIndex],
    completed: !current[todoIndex].completed,
  };

  const updated = [...current];
  updated[todoIndex] = updatedTodo;

  localStorage.setItem(
    `react-query-advanced-todos-${list}`,
    JSON.stringify(updated)
  );

  return updatedTodo;
};

export default function InvalidationExample() {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Query Invalidation Example
        </CardTitle>
        <CardDescription>
          Demonstrates how to invalidate and refetch queries after mutations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="basic"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Invalidation</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Predicates</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInvalidationExample />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedInvalidationExample />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Basic invalidation example component
function BasicInvalidationExample() {
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const queryClient = useQueryClient();

  const {
    data: todos,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["todos-list"],
    queryFn: fetchBasicTodos,
  });

  const addMutation = useMutation({
    mutationFn: addBasicTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-list"] });
      setNewTodoTitle("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBasicTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-list"] });
    },
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      addMutation.mutate(newTodoTitle);
    }
  };

  return (
    <div>
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
        <Input
          placeholder="Add a new todo"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          disabled={addMutation.isPending}
        />
        <Button
          type="submit"
          disabled={addMutation.isPending || !newTodoTitle.trim()}
        >
          {addMutation.isPending ? "Adding..." : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message || "Failed to fetch todos"}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2">
          {todos?.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No todos yet. Add one above!
            </p>
          ) : (
            todos?.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <span>{todo.title}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(todo.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="mt-2">
          <Badge
            variant="outline"
            className="animate-pulse bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            Refetching after invalidation...
          </Badge>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
        <p className="font-medium mb-2">How invalidation works:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>When you add or delete a todo, a mutation is triggered</li>
          <li>
            After the mutation succeeds, we call{" "}
            <code>invalidateQueries()</code>
          </li>
          <li>This marks the [&quot;todos-list&quot;] query as stale</li>
          <li>React Query automatically refetches stale queries</li>
          <li>The UI updates with the fresh data</li>
        </ol>
      </div>
    </div>
  );
}

function AdvancedInvalidationExample() {
  const [newTodoATitle, setNewTodoATitle] = useState("");
  const [newTodoBTitle, setNewTodoBTitle] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const queryClient = useQueryClient();

  const listAQuery = useQuery({
    queryKey: ["todos", "list-A"],
    queryFn: () => fetchAdvancedTodos("A"),
  });

  const listBQuery = useQuery({
    queryKey: ["todos", "list-B"],
    queryFn: () => fetchAdvancedTodos("B"),
  });

  const addTodoListA = useMutation({
    mutationFn: (title: string) =>
      addAdvancedTodo({
        title,
        completed: false,
        list: "A",
        priority: newTodoPriority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", "list-A"] });
      setNewTodoATitle("");
      toast({
        title: "Todo added to List A",
        description: "Using direct invalidation",
      });
    },
  });

  const deleteTodoListA = useMutation({
    mutationFn: (id: number) => deleteAdvancedTodo(id, "A"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", "list-A"] });
      toast({
        title: "Todo deleted from List A",
        description: "Using direct invalidation",
      });
    },
  });

  const toggleTodoListA = useMutation({
    mutationFn: (id: number) => toggleAdvancedTodo(id, "A"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", "list-A"] });
      toast({
        title: "Todo toggled in List A",
        description: "Using direct invalidation",
      });
    },
  });

  const addTodoListB = useMutation({
    mutationFn: (title: string) =>
      addAdvancedTodo({
        title,
        completed: false,
        list: "B",
        priority: newTodoPriority,
      }),
    onSuccess: () => {
      setNewTodoBTitle("");
      toast({
        title: "Todo added to List B",
        description:
          "No automatic invalidation - use the predicate buttons below",
      });
    },
  });

  const deleteTodoListB = useMutation({
    mutationFn: (id: number) => deleteAdvancedTodo(id, "B"),
    onSuccess: () => {
      toast({
        title: "Todo deleted from List B",
        description:
          "No automatic invalidation - use the predicate buttons below",
      });
    },
  });

  const toggleTodoListB = useMutation({
    mutationFn: (id: number) => toggleAdvancedTodo(id, "B"),
    onSuccess: () => {
      toast({
        title: "Todo toggled in List B",
        description:
          "No automatic invalidation - use the predicate buttons below",
      });
    },
  });

  const invalidateExactListB = () => {
    queryClient.invalidateQueries({ queryKey: ["todos", "list-B"] });
    toast({
      title: "List B invalidated",
      description: "Using exact query key match",
    });
  };

  const invalidateAllTodos = () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] });
    toast({
      title: "All todo lists invalidated",
      description: "Using partial query key match",
    });
  };

  const invalidateHighPriorityTodos = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey as string[];
        if (queryKey[0] !== "todos") return false;

        const data = query.state.data as AdvancedTodo[] | undefined;
        return data?.some((todo) => todo.priority === "high") ?? false;
      },
    });
    toast({
      title: "Lists with high priority todos invalidated",
      description: "Using data-based predicate",
    });
  };

  const invalidateRecentTodos = () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey as string[];
        if (queryKey[0] !== "todos") return false;

        const data = query.state.data as AdvancedTodo[] | undefined;
        return data?.some((todo) => todo.createdAt > fiveMinutesAgo) ?? false;
      },
    });
    toast({
      title: "Lists with recent todos invalidated",
      description: "Using timestamp-based predicate",
    });
  };

  const handleAddTodo = (e: React.FormEvent, list: "A" | "B") => {
    e.preventDefault();
    if (list === "A" && newTodoATitle.trim()) {
      addTodoListA.mutate(newTodoATitle);
    }
    if (list === "B" && newTodoBTitle.trim()) {
      addTodoListB.mutate(newTodoBTitle);
    }
  };

  const renderTodoList = (
    list: "A" | "B",
    query: typeof listAQuery,
    deleteMutation: typeof deleteTodoListA,
    toggleMutation: typeof toggleTodoListA
  ) => {
    return (
      <div className="space-y-2">
        {query.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : query.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(query.error as Error)?.message || "Failed to fetch todos"}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {query.data?.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No todos yet. Add one above!
              </p>
            ) : (
              query.data?.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleMutation.mutate(todo.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span
                      className={`${
                        todo.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {todo.title}
                    </span>
                    <Badge
                      variant={
                        todo.priority === "high"
                          ? "destructive"
                          : todo.priority === "medium"
                          ? "default"
                          : "outline"
                      }
                      className="ml-2"
                    >
                      {todo.priority}
                    </Badge>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(todo.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Priority for new todos:
        </label>
        <Select
          value={newTodoPriority}
          onValueChange={(value: "low" | "medium" | "high") =>
            setNewTodoPriority(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">List A - Direct Invalidation</h3>
          <form
            onSubmit={(e) => handleAddTodo(e, "A")}
            className="flex gap-2 mb-4"
          >
            <Input
              placeholder="Add a new todo"
              value={newTodoATitle}
              onChange={(e) => setNewTodoATitle(e.target.value)}
              disabled={addTodoListA.isPending}
            />
            <Button
              type="submit"
              disabled={addTodoListA.isPending || !newTodoATitle.trim()}
            >
              {addTodoListA.isPending ? (
                "Adding..."
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </form>
          {renderTodoList("A", listAQuery, deleteTodoListA, toggleTodoListA)}
          <div className="mt-2 text-xs text-gray-500">
            <p>✓ Automatically invalidates and refetches after mutations</p>
          </div>
          {listAQuery.isFetching && !listAQuery.isLoading && (
            <Badge
              variant="outline"
              className="mt-2 animate-pulse bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            >
              Refetching...
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">
            List B - Manual/Predicate Invalidation
          </h3>
          <form
            onSubmit={(e) => handleAddTodo(e, "B")}
            className="flex gap-2 mb-4"
          >
            <Input
              placeholder="Add a new todo"
              value={newTodoBTitle}
              onChange={(e) => setNewTodoBTitle(e.target.value)}
              disabled={addTodoListB.isPending}
            />
            <Button
              type="submit"
              disabled={addTodoListB.isPending || !newTodoBTitle.trim()}
            >
              {addTodoListB.isPending ? (
                "Adding..."
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </form>
          {renderTodoList("B", listBQuery, deleteTodoListB, toggleTodoListB)}
          <div className="mt-2 text-xs text-gray-500">
            <p>✗ No automatic invalidation - use the buttons below</p>
          </div>
          {listBQuery.isFetching && !listBQuery.isLoading && (
            <Badge
              variant="outline"
              className="mt-2 animate-pulse bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            >
              Refetching...
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        <h3 className="font-medium mb-3">Invalidation Controls</h3>
        <div className="flex flex-wrap gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => listBQuery.refetch()}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Manual Refetch List B
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <pre className="text-xs">
                <code>
                  {`useQuery({
  queryKey: ["todos", "list-B"],
  queryFn: () => fetchAdvancedTodos("B")
})`}
                </code>
              </pre>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={invalidateExactListB}
                variant="default"
                size="sm"
              >
                Invalidate List B
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{`invalidateQueries({ queryKey: ["todos", "list-B"] })`}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={invalidateAllTodos} variant="default" size="sm">
                Invalidate All Lists (Partial)
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{`invalidateQueries({ queryKey: ["todos"] })`}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={invalidateHighPriorityTodos}
                variant="secondary"
                size="sm"
              >
                Invalidate Lists with High Priority Todos
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <pre className="text-xs">
                <code>
                  {`invalidateQueries({
  predicate: (query) => {
    const queryKey = query.queryKey as string[];
    if (queryKey[0] !== "todos") return false;

    const data = query.state.data as AdvancedTodo[] | undefined;
    return data?.some((todo) => todo.priority === "high") ?? false;
  }
})`}
                </code>
              </pre>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={invalidateRecentTodos}
                variant="secondary"
                size="sm"
              >
                Invalidate Lists with Recent Todos
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <pre className="text-xs">
                <code>
                  {`invalidateQueries({
predicate: (query) => {
    const queryKey = query.queryKey as string[];
    if (queryKey[0] !== "todos") return false;

    const data = query.state.data as AdvancedTodo[] | undefined;
    return data?.some((todo) => todo.createdAt > fiveMinutesAgo) ?? false;
  }
})`}
                </code>
              </pre>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
        <p className="font-medium mb-2">How Predicate Invalidation Works:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>
            <strong>Direct Invalidation:</strong> Automatically refetches after
            mutations using exact query keys
            <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
              <code>{`queryClient.invalidateQueries({ queryKey: ["todos", "list-A"] })`}</code>
            </div>
          </li>
          <li>
            <strong>Partial Key Invalidation:</strong> Invalidates all queries
            that start with the specified key
            <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
              <code>{`queryClient.invalidateQueries({ queryKey: ["todos"] })`}</code>
            </div>
          </li>
          <li>
            <strong>Predicate-Based Invalidation:</strong> Uses custom logic to
            determine which queries to invalidate
            <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
              <code>{`queryClient.invalidateQueries({ predicate: (query) => { /* custom logic */ } })`}</code>
            </div>
          </li>
          <li>
            <strong>Data-Based Predicates:</strong> Examines the actual query
            data to make invalidation decisions
            <div className="ml-6 text-xs text-gray-600 dark:text-gray-400">
              <code>{`predicate: (query) => query.state.data?.some(todo => todo.priority === "high")`}</code>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
