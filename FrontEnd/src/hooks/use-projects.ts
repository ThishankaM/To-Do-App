import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "@/services/project-api";
import { errorMessage } from "@/lib/error-message";
import type { CreateProjectRequest, UpdateProjectRequest } from "@/types/project";

export function useProjects(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["projects"],
    queryFn: ({ signal }) => projectApi.getAll(signal),
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectRequest) => projectApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectRequest }) =>
      projectApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,

    createProject: async (payload: CreateProjectRequest) => {
      try {
        const data = await createMutation.mutateAsync(payload);
        return { ok: true as const, data };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to create project"),
        };
      }
    },
    updateProject: async (id: string, payload: UpdateProjectRequest) => {
      try {
        const data = await updateMutation.mutateAsync({ id, payload });
        return { ok: true as const, data };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to update project"),
        };
      }
    },
    deleteProject: async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to delete project"),
        };
      }
    },

    isSaving: createMutation.isPending || updateMutation.isPending,
    deletingId: deleteMutation.isPending ? (deleteMutation.variables as string) : null,
  };
}

export function useProject(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: ({ signal }) => projectApi.getById(id!, signal),
    enabled: enabled && !!id,
  });
}
