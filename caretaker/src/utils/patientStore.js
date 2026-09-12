import { patientData as mockPatientData } from '../mockData/patientData'

const KEY = 'nermemorycare_patient'

export function getPatient() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return mockPatientData
}

export function savePatient(patient) {
  localStorage.setItem(KEY, JSON.stringify(patient))
}

export function clearPatient() {
  localStorage.removeItem(KEY)
}

export function hasCustomPatient() {
  return !!localStorage.getItem(KEY)
}
