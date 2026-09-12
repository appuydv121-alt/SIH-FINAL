import { apiClient } from "./client";
import type { CaregiverDashboard, User } from "../types/api";

export const caretakersApi = {
  getPatients: () => apiClient.get<User[]>("/caretakers/patients"),
  getDashboard: () => apiClient.get<CaregiverDashboard>("/caretakers/dashboard"),
};
