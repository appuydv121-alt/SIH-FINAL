/**
 * Local patient store — persists caregiver-entered patient data to localStorage.
 * Falls back to a built-in mock patient when nothing is stored.
 */

export interface PatientMemory {
  id: string;
  title: string;
  relationship: string;
  category: string;
  description: string;
  photoUrl?: string; // data-URL or blob-URL for family photos
}

export interface PatientMedication {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  status: string;
}

export interface PatientPrescription {
  id: string;
  medicineName: string;
  dosage: string;
  instructions: string;
  startDate: string;
  endDate: string;
  doctorName: string;
}

export interface PatientTask {
  id: string;
  title: string;
  description: string;
  time: string;
  status: string;
}

export interface PatientProgress {
  overallScore: number;
  medicationAdherence: number;
  taskCompletion: number;
  gamePerformance: number;
  trend: string;
  confidence: number;
}

export interface PatientData {
  id: string;
  name: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContact: string;
  doctorName: string;
  preferredLanguage: string;
  prescriptions: PatientPrescription[];
  medications: PatientMedication[];
  tasks: PatientTask[];
  memories: PatientMemory[];
  joinedAt: string;
  status: string;
  progress: PatientProgress;
  dailyScores: number[];
}

const KEY = "nermemorycare_patient";

/** Default demo patient used when nothing has been saved by the caregiver. */
const MOCK_PATIENT: PatientData = {
  id: "p_demo_lalita",
  name: "Lalita Devi",
  age: "72",
  gender: "Female",
  phone: "+91 98765 43210",
  address: "B-14, Laxmi Nagar, New Delhi",
  emergencyContactName: "Rahul Verma (Son)",
  emergencyContact: "+91 98765 43211",
  doctorName: "Dr. Ananya Sharma",
  preferredLanguage: "Hindi",
  prescriptions: [
    {
      id: "rx_1",
      medicineName: "Donepezil",
      dosage: "5 mg",
      instructions: "Take after breakfast",
      startDate: "2025-01-10",
      endDate: "",
      doctorName: "Dr. Ananya Sharma",
    },
    {
      id: "rx_2",
      medicineName: "Memantine",
      dosage: "10 mg",
      instructions: "Take at bedtime",
      startDate: "2025-03-01",
      endDate: "",
      doctorName: "Dr. Ananya Sharma",
    },
  ],
  medications: [
    { id: "ms_1", medicineName: "Donepezil", dosage: "5 mg", time: "08:00", status: "pending" },
    { id: "ms_2", medicineName: "Memantine", dosage: "10 mg", time: "21:00", status: "pending" },
  ],
  tasks: [
    { id: "t_1", title: "Morning Walk", description: "30 min walk in the park", time: "07:00", status: "pending" },
    { id: "t_2", title: "Memory Games", description: "Play CuCove brain games", time: "10:00", status: "pending" },
    { id: "t_3", title: "Evening Prayer", description: "Temple visit or home prayer", time: "18:00", status: "pending" },
  ],
  memories: [
    {
      id: "mem_1",
      title: "Grandchildren Arjun & Mira",
      relationship: "Grandchildren",
      category: "family",
      description: "Arjun loves cricket, Mira loves painting. They visit every Sunday.",
    },
    {
      id: "mem_2",
      title: "Shimla Garden House",
      relationship: "",
      category: "places",
      description: "The old hill house with marigolds and pine trees.",
    },
  ],
  joinedAt: "2025-01-10",
  status: "active",
  progress: {
    overallScore: 72,
    medicationAdherence: 85,
    taskCompletion: 60,
    gamePerformance: 68,
    trend: "improving",
    confidence: 0.78,
  },
  dailyScores: [65, 68, 70, 72, 69, 74, 72],
};

export function getPatient(): PatientData {
  if (typeof window === "undefined") return MOCK_PATIENT;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as PatientData;
  } catch {
    // corrupted data — fall back
  }
  return MOCK_PATIENT;
}

export function savePatient(patient: PatientData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(patient));
}

export function clearPatient(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function hasCustomPatient(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(KEY);
}
