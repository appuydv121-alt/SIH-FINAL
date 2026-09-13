import { apiClient } from "./client";

export interface MemoryItem {
  id: string;
  patient_id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  emotion?: string;
  image_url?: string;
  audio_url?: string;
  tags?: string[];
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMemoryRequest {
  title: string;
  description: string;
  date?: string;
  location?: string;
  emotion?: string;
  image_url?: string;
  audio_url?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export const memoriesApi = {
  getMyMemories: async (): Promise<MemoryItem[]> => {
    return await apiClient.get<MemoryItem[]>("/memories");
  },

  getPatientMemories: async (patientId: string): Promise<MemoryItem[]> => {
    return await apiClient.get<MemoryItem[]>(`/memories/patient/${patientId}`);
  },

  createMemory: async (data: CreateMemoryRequest): Promise<MemoryItem> => {
    return await apiClient.post<MemoryItem>("/memories", data);
  },

  createPatientMemory: async (
    patientId: string,
    data: CreateMemoryRequest,
  ): Promise<MemoryItem> => {
    return await apiClient.post<MemoryItem>(`/memories/patient/${patientId}`, data);
  },

  deleteMemory: async (memoryId: string): Promise<void> => {
    await apiClient.delete(`/memories/${memoryId}`);
  },
};
