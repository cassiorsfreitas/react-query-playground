export const queryKeys = {
  todos: ["todos"] as const,
  todoList: (list: "A" | "B") => [...queryKeys.todos, `list-${list}`] as const,
  // TODO: Add more query keys
};
