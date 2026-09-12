export type UserRole = "patient" | "doctor" | "caretaker" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  token: TokenResponse;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  preferred_language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface PatientProfileUpdate {
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_language?: string;
  timezone?: string;
}

export type PrescriptionStatus = "active" | "completed" | "cancelled";

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medicine_name: string;
  dosage: string;
  route: string | null;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  status: PrescriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionCreate {
  patient_id: string;
  medicine_name: string;
  dosage: string;
  route?: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export type MedicationFrequency = "daily" | "weekly" | "custom";
export type MedicationLogStatus = "scheduled" | "taken" | "missed" | "skipped";

export interface MedicationSchedule {
  id: string;
  prescription_id: string;
  patient_id: string;
  medicine_name: string;
  dosage: string;
  scheduled_time: string;
  frequency: MedicationFrequency;
  days_of_week: string | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationScheduleCreate {
  prescription_id: string;
  medicine_name: string;
  dosage: string;
  scheduled_time: string;
  frequency?: MedicationFrequency;
  days_of_week?: string;
  start_date?: string;
  end_date?: string;
  reminder_enabled?: boolean;
}

export interface MedicationLog {
  id: string;
  schedule_id: string;
  patient_id: string;
  scheduled_at: string;
  taken_at: string | null;
  status: MedicationLogStatus;
  notes: string | null;
  created_at: string;
}

export type TaskPriority = "low" | "normal" | "high";
export type TaskRecurrence = "daily" | "weekly" | "custom";
export type TaskStatus = "pending" | "completed" | "missed";

export interface Task {
  id: string;
  patient_id: string;
  created_by: string;
  title: string;
  description: string | null;
  scheduled_time: string;
  priority: TaskPriority;
  recurrence: TaskRecurrence;
  days_of_week: string | null;
  start_date: string;
  end_date: string | null;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  patient_id: string;
  title: string;
  description?: string;
  scheduled_time: string;
  priority?: TaskPriority;
  recurrence?: TaskRecurrence;
  days_of_week?: string;
  start_date?: string;
  end_date?: string;
}

export interface GameTypeInfo {
  id: string;
  name: string;
  description: string;
  cognitive_domain: string;
  icon_name: string;
  difficulty_levels: string[];
}

export interface GameSession {
  id: string;
  patient_id: string;
  game_type: string;
  game_id: string;
  score: number;
  accuracy: number;
  duration_seconds: number;
  difficulty: string;
  level_achieved: number;
  metrics: string | null;
  completed_at: string;
  created_at: string;
}

export interface GameSessionCreate {
  patient_id?: string;
  game_type: string;
  game_id: string;
  score: number;
  accuracy: number;
  duration_seconds: number;
  difficulty?: string;
  level_achieved?: number;
  metrics?: string;
}

export interface GameSummary {
  total_sessions: number;
  average_score: number;
  average_accuracy: number;
  favorite_game: string | null;
  recent_improvement_percentage: number;
}

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface CognitiveAssessment {
  id: string;
  patient_id: string;
  overall_score: number;
  risk_level: RiskLevel;
  memory_score: number;
  attention_score: number;
  executive_function_score: number;
  language_score: number;
  insights: string | null;
  recommendations: string | null;
  model_version: string;
  assessment_date: string;
  created_at: string;
}

export interface CognitiveTrendItem {
  date: string;
  overall_score: number;
  memory_score: number;
  attention_score: number;
}

export interface CognitiveTrend {
  patient_id: string;
  data_points: CognitiveTrendItem[];
  trend_direction: "improving" | "stable" | "declining";
}

export interface Notification {
  id: string;
  patient_id: string;
  type: "medication" | "task" | "general";
  title: string;
  message: string;
  scheduled_for: string;
  sent_at: string | null;
  status: "pending" | "sent" | "read" | "failed";
  related_entity_id: string | null;
  created_at: string;
}

export interface VoiceLanguage {
  code: string;
  name: string;
  native_name: string;
}

export interface TranslationLanguage {
  code: string;
  name: string;
  native_name: string;
}

export interface DoctorDashboardPatient {
  patient: User;
  latest_score: number | null;
  latest_score_date: string | null;
  risk_level: RiskLevel | "unassessed";
}

export interface CaregiverDashboardPatient {
  patient: User;
  latest_cognitive_score: number | null;
  risk_level: RiskLevel | "unassessed";
  pending_medication_count: number;
  pending_task_count: number;
}

export interface CaregiverDashboard {
  caretaker_id: string;
  caretaker_name: string;
  total_patients: number;
  patients: CaregiverDashboardPatient[];
}

export interface ApiError {
  success: boolean;
  message: string;
  errorCode?: string;
  details?: Array<{ field: string; message: string; type: string }>;
}
