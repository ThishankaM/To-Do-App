import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, tagApi } from "@/services/taxonomy-api";
import { errorMessage } from "@/lib/error-message";

export function useTaxonomyQuery(enabled = true) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => categoryApi.getAll(signal),
    enabled,
  });

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: ({ signal }) => tagApi.getAll(signal),
    enabled,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["tags"] });
  };

  const createCategory = useMutation({
    mutationFn: (name: string) => categoryApi.create(name),
    onSuccess: invalidate,
  });
  const updateCategory = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => categoryApi.update(id, name),
    onSuccess: invalidate,
  });
  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoryApi.remove(id),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const createTag = useMutation({
    mutationFn: (name: string) => tagApi.create(name),
    onSuccess: invalidate,
  });
  const updateTag = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => tagApi.update(id, name),
    onSuccess: invalidate,
  });
  const deleteTag = useMutation({
    mutationFn: (id: string) => tagApi.remove(id),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    tags: tagsQuery.data ?? [],
    isLoading: categoriesQuery.isLoading || tagsQuery.isLoading,
    isSaving:
      createCategory.isPending ||
      updateCategory.isPending ||
      deleteCategory.isPending ||
      createTag.isPending ||
      updateTag.isPending ||
      deleteTag.isPending,
    error:
      (categoriesQuery.error as Error)?.message ||
      (tagsQuery.error as Error)?.message ||
      (createCategory.error as Error)?.message ||
      null,
    refetch: () => {
      categoriesQuery.refetch();
      tagsQuery.refetch();
    },

    createCategory: async (name: string) => {
      try {
        await createCategory.mutateAsync(name);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to create category"),
        };
      }
    },
    updateCategory: async (id: string, name: string) => {
      try {
        await updateCategory.mutateAsync({ id, name });
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to update category"),
        };
      }
    },
    deleteCategory: async (id: string) => {
      try {
        await deleteCategory.mutateAsync(id);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to delete category"),
        };
      }
    },
    createTag: async (name: string) => {
      try {
        await createTag.mutateAsync(name);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to create tag"),
        };
      }
    },
    updateTag: async (id: string, name: string) => {
      try {
        await updateTag.mutateAsync({ id, name });
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to update tag"),
        };
      }
    },
    deleteTag: async (id: string) => {
      try {
        await deleteTag.mutateAsync(id);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: errorMessage(e, "Failed to delete tag"),
        };
      }
    },
  };
}
