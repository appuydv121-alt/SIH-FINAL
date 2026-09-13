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
  gender?: string | null;
  address?: string | null;
  doctor_name?: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface PatientProfileUpdate {
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_language?: string;
  gender?: string;
  address?: string;
  doctor_name?: string;
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
  next_level_unlocked?: number;
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

export interface SingleGameProgress {
  game_id: string;
  highest_level_won: number;
  current_unlocked_level: number;
  best_score: number;
  total_played: number;
  last_played: string | null;
}

export interface GameProgressResponse {
  patient_id: string;
  games: Record<string, SingleGameProgress>;
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
  profile?: PatientProfile | null;
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

export interface CaretakerPatientDetail {
  patient: User;
  profile: PatientProfile | null;
  relationship_type: string | null;
  active: boolean;
  connected_since: string;
}

export interface InitialTaskInput {
  title: string;
  description?: string;
  scheduled_time?: string;
  priority?: TaskPriority;
  recurrence?: TaskRecurrence;
}

export interface InitialMedicationInput {
  medicine_name: string;
  dosage: string;
  scheduled_time?: string;
  instructions?: string;
}

export interface CaretakerAddPatientRequest {
  email: string;
  password?: string;
  name?: string;
  age?: number | string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  doctor_name?: string;
  preferred_language?: string;
  relationship_type?: string;
  initial_tasks?: InitialTaskInput[];
  initial_medications?: InitialMedicationInput[];
}

export interface CaretakerAddPatientResponse {
  success: boolean;
  is_new_patient: boolean;
  message: string;
  patient: User;
  profile: PatientProfile | null;
  relationship_id: string;
}

export interface CaretakerCreateMedicationRequest {
  medicine_name: string;
  dosage: string;
  scheduled_time?: string;
  instructions?: string;
  frequency?: MedicationFrequency;
}

export interface CaretakerCreateTaskRequest {
  title: string;
  description?: string;
  scheduled_time?: string;
  priority?: TaskPriority;
  recurrence?: TaskRecurrence;
}

export interface CaretakerTaskItem {
  id: string;
  title: string;
  description: string | null;
  scheduled_time: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
}

export interface CaretakerMedicationItem {
  id: string;
  medicine_name: string;
  dosage: string;
  scheduled_time: string;
  status: string;
  taken_at: string | null;
  instructions?: string | null;
}

export interface CaretakerGameSessionItem {
  id: string;
  game_name: string;
  game_id: string;
  score: number;
  accuracy: number;
  duration_seconds: number;
  level_achieved: number;
  difficulty: string;
  completed_at: string;
}

export interface CaretakerPatientAnalytics {
  patient_id: string;
  overall_score: number;
  risk_level: string;
  trend: string;
  cognitive_scores: {
    memory: number;
    attention: number;
    executive: number;
    language: number;
  };
  insights: string[];
  recommendations: string[];
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  missed_tasks: number;
  task_completion_rate: number;
  total_medications_scheduled: number;
  medications_taken: number;
  medications_pending: number;
  medications_missed: number;
  medication_adherence_rate: number;
  total_games_played: number;
  average_game_score: number;
  average_game_accuracy: number;
  best_game_score: number;
  total_game_duration_seconds: number;
  games_played: string[];
  recent_game_sessions: CaretakerGameSessionItem[];
  daily_scores: Array<{ date: string; overallScore: number }>;
}

export interface ApiError {
  success: boolean;
  message: string;
  errorCode?: string;
  details?: Array<{ field: string; message: string; type: string }>;
}

// ─── Offline Synchronization Types ──────────────────────────────────────────

export interface SyncGameEvent {
  client_event_id: string;
  game_type: string;
  game_id?: string;
  score: number;
  accuracy: number;
  duration_seconds: number;
  difficulty?: string;
  metrics?: Record<string, any>;
  completed_at?: string;
}

export interface SyncMedicationEvent {
  client_event_id: string;
  schedule_id: string;
  taken_at?: string;
  status?: string;
  notes?: string;
}

export interface SyncTaskEvent {
  client_event_id: string;
  task_id: string;
  completed_at?: string;
}

export interface SyncMemoryEvent {
  client_event_id: string;
  memory_id?: string;
  title: string;
  category?: string;
  description: string;
  date_or_era?: string;
  image_url?: string;
  created_at?: string;
}

export interface SyncVoiceEvent {
  client_event_id: string;
  transcript: string;
  action_taken?: string;
  timestamp?: string;
}

export interface SyncBatchRequest {
  patient_id?: string;
  last_synced_at?: string;
  game_events?: SyncGameEvent[];
  medication_events?: SyncMedicationEvent[];
  task_events?: SyncTaskEvent[];
  memory_events?: SyncMemoryEvent[];
  voice_events?: SyncVoiceEvent[];
}

export interface SyncBatchResponse {
  success: boolean;
  synced_games: number;
  synced_medications: number;
  synced_tasks: number;
  synced_memories: number;
  synced_voice_logs: number;
  conflicts: string[];
  server_timestamp: string;
}

