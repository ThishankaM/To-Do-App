import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/services/todo-api";
import { errorMessage } from "@/lib/error-message";
import type { TodoQueryParams, PaginatedResponse } from "@/types/api";
import type { CreateTodoRequest, Todo, UpdateTodoRequest } from "@/types/todo";

function enforceLocalInvariant(payload: Partial<CreateTodoRequest>): Partial<CreateTodoRequest> {
  const { status, completed, progress } = payload;
  if (completed === true || status === "done") {
    return { ...payload, status: "done", completed: true, progress: 100 };
  }
  if (status === "todo" && progress !== undefined && progress >= 100) {
    return { ...payload, completed: false, progress: 99 };
  }
  if (status === "in-progress") {
    let p = progress ?? 1;
    if (p <= 0) p = 1;
    if (p >= 100) p = 99;
    return { ...payload, completed: false, progress: p };
  }
  return payload;
}

export function useTodosQuery(enabled = true) {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<TodoQueryParams>({
    page: 1,
    limit: 100,
    sortBy: "created_at",
    sortOrder: "desc",
    filter: "all",
  });

  const query = useQuery<PaginatedResponse<Todo>>({
    queryKey: ["todos", params],
    queryFn: ({ signal }) => todoApi.getAll(params, signal),
    enabled,
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTodoRequest) => {
      const fixed = enforceLocalInvariant(payload) as CreateTodoRequest;
      return todoApi.create(fixed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTodoRequest }) => {
      const fixed = enforceLocalInvariant(payload) as UpdateTodoRequest;
      return todoApi.update(id, fixed);
    },
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previous = queryClient.getQueryData<PaginatedResponse<Todo>>(["todos", params]);
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<Todo>>(["todos", params], {
          ...previous,
          data: previous.data.map((t) => (t.id === id ? { ...t, ...payload } : t)),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todos", params], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => todoApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateParams = (newParams: Partial<TodoQueryParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: newParams.page ?? 1,
    }));
  };

  return {
    todos: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, limit: 100, total: 0, totalPages: 1 },
    params,
    updateParams,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    isEmpty: query.isSuccess && (query.data?.data.length ?? 0) === 0,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,

    createTodo: async (payload: CreateTodoRequest) => {
      try {
        const data = await createMutation.mutateAsync(payload);
        return { ok: true as const, data };
      } catch (e) {
        return { ok: false as const, error: errorMessage(e, "Failed to create") };
      }
    },
    updateTodo: async (id: string, payload: UpdateTodoRequest) => {
      try {
        const data = await updateMutation.mutateAsync({ id, payload });
        return { ok: true as const, data };
      } catch (e) {
        return { ok: false as const, error: errorMessage(e, "Failed to update") };
      }
    },
    deleteTodo: async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, error: errorMessage(e, "Failed to delete") };
      }
    },

    isSaving: createMutation.isPending || updateMutation.isPending,
    deletingId: deleteMutation.isPending ? (deleteMutation.variables as string) : null,
    mutationError:
      (createMutation.error as Error)?.message ||
      (updateMutation.error as Error)?.message ||
      (deleteMutation.error as Error)?.message ||
      null,
    clearMutationError: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
    },
  };
}
