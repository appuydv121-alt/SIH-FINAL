import { apiClient } from "./client";
import type { GameTypeInfo, GameSession, GameSessionCreate, GameSummary } from "../types/api";

export const gamesApi = {
  getGameTypes: () => apiClient.get<GameTypeInfo[]>("/games/types"),

  submitGameSession: (data: GameSessionCreate) =>
    apiClient.post<GameSession>("/games/sessions", data),

  getPatientGameSessions: (
    patientId: string,
    gameType?: string,
    limit: number = 20,
    offset: number = 0,
  ) => {
    let url = `/games/sessions/patient/${patientId}?limit=${limit}&offset=${offset}`;
    if (gameType) url += `&game_type=${encodeURIComponent(gameType)}`;
    return apiClient.get<GameSession[]>(url);
  },

  getGameSummary: (patientId: string) =>
    apiClient.get<GameSummary>(`/games/sessions/patient/${patientId}/summary`),
};
