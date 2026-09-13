import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memoriesApi, MemoryItem, CreateMemoryRequest } from "../api/memories.api";
import { useAuth } from "./use-auth";

export function useMemories(customPatientId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const patientId = customPatientId || user?.id;

  const memoriesQuery = useQuery({
    queryKey: ["memories", patientId],
    queryFn: () => {
      if (customPatientId) {
        return memoriesApi.getPatientMemories(customPatientId);
      }
      return memoriesApi.getMyMemories();
    },
    enabled: !!patientId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMemoryRequest) => {
      if (customPatientId) {
        return memoriesApi.createPatientMemory(customPatientId, data);
      }
      return memoriesApi.createMemory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (memoryId: string) => memoriesApi.deleteMemory(memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  return {
    memories: memoriesQuery.data || [],
    isLoading: memoriesQuery.isLoading,
    isError: memoriesQuery.isError,
    error: memoriesQuery.error,
    refetch: memoriesQuery.refetch,
    createMemory: createMutation.mutateAsync,
    deleteMemory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
