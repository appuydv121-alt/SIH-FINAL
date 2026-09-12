import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, UserPlus, ImagePlus } from "lucide-react";
import { NavigationHeader } from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  savePatient,
  hasCustomPatient,
  getPatient,
  type PatientData,
  type PatientMemory,
  type PatientMedication,
  type PatientPrescription,
  type PatientTask,
} from "@/utils/patientStore";

export const Route = createFileRoute("/caregiver_/add-patient")({
  head: () => ({
    meta: [
      { title: "Add Patient | CuCove" },
      {
        name: "description",
        content: "Caregiver patient onboarding — personal info, language, medicines, tasks, and memories.",
      },
    ],
  }),
  component: AddPatientPage,
});

/* ─── Constants ─── */

const STEPS = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Language" },
  { id: 3, label: "Medicines" },
  { id: 4, label: "Tasks" },
  { id: 5, label: "Memories" },
] as const;

const LANGUAGES = [
  { code: "Hindi", label: "हिन्दी (Hindi)" },
  { code: "Assamese", label: "অসমীয়া (Assamese)" },
  { code: "Bengali", label: "বাংলা (Bengali)" },
  { code: "Manipuri", label: "মৈতৈলোন্ (Manipuri)" },
  { code: "Bodo", label: "बड़ो (Bodo)" },
  { code: "Nepali", label: "नेपाली (Nepali)" },
  { code: "English", label: "English" },
] as const;

function emptyPatient(): PatientData {
  return {
    id: "p_" + Date.now(),
    name: "",
    age: "",
    gender: "Female",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContact: "",
    doctorName: "",
    preferredLanguage: "Hindi",
    prescriptions: [],
    medications: [],
    tasks: [],
    memories: [],
    joinedAt: new Date().toISOString().slice(0, 10),
    status: "active",
    progress: {
      overallScore: 0,
      medicationAdherence: 0,
      taskCompletion: 0,
      gamePerformance: 0,
      trend: "stable",
      confidence: 0,
    },
    dailyScores: [],
  };
}

/* ─── Page ─── */

function AddPatientPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [patient, setPatient] = useState<PatientData>(emptyPatient());
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (hasCustomPatient()) {
      setPatient(getPatient());
      setIsEditMode(true);
    }
  }, []);

  const update = (patch: Partial<PatientData>) => setPatient((prev) => ({ ...prev, ...patch }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    if (!patient.name.trim() || !patient.age.trim()) {
      toast.error("Please enter the patient's name and age (Step 1).");
      setStep(1);
      return;
    }
    savePatient(patient);
    toast.success(isEditMode ? "Patient updated successfully!" : "Patient saved successfully!");
    navigate({ to: "/caregiver" });
  };

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavigationHeader />

      <main className="flex-1 mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12 w-full">
        {/* Back button */}
        <div className="mb-6">
          <Button asChild variant="cream" size="touch">
            <Link to="/caregiver">
              <ArrowLeft size={20} className="mr-2" /> Back to Caregiver Hub
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="rounded-2xl border border-clay bg-surface p-6 shadow-card mb-8">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-sun text-ink shadow-sm">
              <UserPlus size={32} />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold text-cream">
                {isEditMode ? "Edit Patient" : "Add New Patient"}
              </h1>
              <p className="text-cream/80 mt-1">
                {isEditMode
                  ? "Update the patient's information below."
                  : "Enter patient details step by step."}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-cream/70">
              Step {step} of {STEPS.length}: {STEPS[step - 1]!.label}
            </span>
            <span className="text-sm font-extrabold text-fire">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-clay/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-fire rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                  step === s.id
                    ? "bg-sun text-ink"
                    : s.id < step
                      ? "bg-tea-confirm/30 text-tea-confirm"
                      : "text-cream/50 hover:text-cream/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-clay bg-surface p-6 sm:p-8 shadow-card mb-6">
          {step === 1 && <Step1Personal patient={patient} update={update} />}
          {step === 2 && <Step2Language patient={patient} update={update} />}
          {step === 3 && <Step3Medicines patient={patient} update={update} />}
          {step === 4 && <Step4Tasks patient={patient} update={update} />}
          {step === 5 && <Step5Memories patient={patient} update={update} />}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="cream"
            size="touch"
            className="flex-1"
            onClick={step === 1 ? () => navigate({ to: "/caregiver" }) : back}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </Button>
          {step < STEPS.length ? (
            <Button variant="sun" size="touch" className="flex-1" onClick={next}>
              Next →
            </Button>
          ) : (
            <Button variant="sun" size="touch" className="flex-1" onClick={handleFinish}>
              {isEditMode ? "✓ Update Patient" : "✓ Save Patient"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 1 — Personal Info + Emergency Contacts
   ═══════════════════════════════════════════════════════════ */

function Step1Personal({
  patient,
  update,
}: {
  patient: PatientData;
  update: (p: Partial<PatientData>) => void;
}) {
  const fieldClass =
    "bg-ink border-clay text-cream mt-1 h-12 rounded-xl px-4 text-base focus-visible:ring-sun";
  return (
    <div className="space-y-5">
      <h3 className="font-display text-2xl font-bold text-cream">Personal Information</h3>

      <div>
        <Label className="text-sm font-bold text-cream">Full Name *</Label>
        <Input
          value={patient.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g., Savitri Devi"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-bold text-cream">Age *</Label>
          <Input
            type="number"
            value={patient.age}
            onChange={(e) => update({ age: e.target.value })}
            placeholder="72"
            className={fieldClass}
          />
        </div>
        <div>
          <Label className="text-sm font-bold text-cream">Gender</Label>
          <select
            value={patient.gender}
            onChange={(e) => update({ gender: e.target.value })}
            className="flex w-full h-12 rounded-xl border border-clay bg-ink text-cream px-4 text-base mt-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sun"
          >
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-bold text-cream">Phone</Label>
        <Input
          type="tel"
          value={patient.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="+91 98765 43210"
          className={fieldClass}
        />
      </div>

      <div>
        <Label className="text-sm font-bold text-cream">Address</Label>
        <Input
          value={patient.address}
          onChange={(e) => update({ address: e.target.value })}
          placeholder="Village Rampur, Assam"
          className={fieldClass}
        />
      </div>

      {/* Emergency Contact Section */}
      <div className="border-t border-clay/40 pt-5 mt-2">
        <h4 className="text-lg font-bold text-sun mb-4">Emergency Contact</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-bold text-cream">Contact Name</Label>
            <Input
              value={patient.emergencyContactName}
              onChange={(e) => update({ emergencyContactName: e.target.value })}
              placeholder="Priya Devi (Daughter)"
              className={fieldClass}
            />
          </div>
          <div>
            <Label className="text-sm font-bold text-cream">Contact Number</Label>
            <Input
              type="tel"
              value={patient.emergencyContact}
              onChange={(e) => update({ emergencyContact: e.target.value })}
              placeholder="+91 98765 43211"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-bold text-cream">Assigned Doctor</Label>
        <Input
          value={patient.doctorName}
          onChange={(e) => update({ doctorName: e.target.value })}
          placeholder="Dr. Anil Baruah"
          className={fieldClass}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 2 — Preferred Language
   ═══════════════════════════════════════════════════════════ */

function Step2Language({
  patient,
  update,
}: {
  patient: PatientData;
  update: (p: Partial<PatientData>) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-2xl font-bold text-cream">Preferred Language</h3>
      <p className="text-cream/70">This is the language the patient will see and hear in their app.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => {
          const selected = patient.preferredLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => update({ preferredLanguage: lang.code })}
              className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                selected
                  ? "border-sun bg-sun/15 shadow-sm"
                  : "border-clay bg-ink hover:border-cream/40"
              }`}
            >
              <p className={`text-lg font-bold ${selected ? "text-sun" : "text-cream"}`}>
                {lang.label}
              </p>
              {selected && (
                <span className="text-xs font-bold text-tea-confirm mt-1 block">✓ Selected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 3 — Medicines & Schedule
   ═══════════════════════════════════════════════════════════ */

function Step3Medicines({
  patient,
  update,
}: {
  patient: PatientData;
  update: (p: Partial<PatientData>) => void;
}) {
  const [draft, setDraft] = useState({ medicineName: "", dosage: "", time: "08:00" });

  const add = () => {
    if (!draft.medicineName.trim()) return;
    const now = Date.now();
    const newPrescription: PatientPrescription = {
      id: "rx_" + now,
      medicineName: draft.medicineName,
      dosage: draft.dosage,
      instructions: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      doctorName: patient.doctorName || "",
    };
    const newMedication: PatientMedication = {
      id: "ms_" + now,
      medicineName: draft.medicineName,
      dosage: draft.dosage,
      time: draft.time,
      status: "pending",
    };
    update({
      prescriptions: [...patient.prescriptions, newPrescription],
      medications: [...patient.medications, newMedication],
    });
    setDraft({ medicineName: "", dosage: "", time: "08:00" });
    toast.success(`Added ${draft.medicineName}`);
  };

  const remove = (medId: string) => {
    const rxId = medId.replace("ms_", "rx_");
    update({
      prescriptions: patient.prescriptions.filter((p) => p.id !== rxId),
      medications: patient.medications.filter((m) => m.id !== medId),
    });
  };

  const fieldClass =
    "bg-surface border-clay text-cream h-11 rounded-lg px-3 text-sm focus-visible:ring-sun";

  return (
    <div className="space-y-5">
      <h3 className="font-display text-2xl font-bold text-cream">Medicines & Schedule</h3>
      <p className="text-cream/70">Add medicines the patient needs to take daily.</p>

      <div className="rounded-xl border border-clay bg-ink p-5 space-y-3">
        <Input
          value={draft.medicineName}
          onChange={(e) => setDraft({ ...draft, medicineName: e.target.value })}
          placeholder="Medicine name (e.g., Donepezil)"
          className={fieldClass}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={draft.dosage}
            onChange={(e) => setDraft({ ...draft, dosage: e.target.value })}
            placeholder="Dosage (e.g., 5 mg)"
            className={fieldClass}
          />
          <Input
            type="time"
            value={draft.time}
            onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            className={fieldClass}
          />
        </div>
        <Button variant="cream" size="touch" onClick={add} className="w-full">
          <Plus size={18} className="mr-2" /> Add Medicine
        </Button>
      </div>

      {patient.medications.length === 0 ? (
        <p className="text-center text-cream/50 py-6">No medicines added yet.</p>
      ) : (
        <div className="space-y-2">
          {patient.medications.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-4 rounded-xl border border-clay bg-ink"
            >
              <div>
                <p className="text-base font-bold text-cream">{m.medicineName}</p>
                <p className="text-sm text-cream/60">
                  {m.dosage} · {m.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(m.id)}
                className="p-2.5 rounded-lg text-destructive hover:bg-destructive/15 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 4 — Daily Tasks
   ═══════════════════════════════════════════════════════════ */

function Step4Tasks({
  patient,
  update,
}: {
  patient: PatientData;
  update: (p: Partial<PatientData>) => void;
}) {
  const [draft, setDraft] = useState({ title: "", time: "09:00" });

  const add = () => {
    if (!draft.title.trim()) return;
    const newTask: PatientTask = {
      id: "t_" + Date.now(),
      title: draft.title,
      description: "",
      time: draft.time,
      status: "pending",
    };
    update({ tasks: [...patient.tasks, newTask] });
    setDraft({ title: "", time: "09:00" });
    toast.success(`Added task: ${draft.title}`);
  };

  const remove = (id: string) => {
    update({ tasks: patient.tasks.filter((t) => t.id !== id) });
  };

  const fieldClass =
    "bg-surface border-clay text-cream h-11 rounded-lg px-3 text-sm focus-visible:ring-sun";

  return (
    <div className="space-y-5">
      <h3 className="font-display text-2xl font-bold text-cream">Daily Tasks</h3>
      <p className="text-cream/70">Add daily activities the patient should complete.</p>

      <div className="rounded-xl border border-clay bg-ink p-5 space-y-3">
        <Input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Task (e.g., Morning Walk)"
          className={fieldClass}
        />
        <Input
          type="time"
          value={draft.time}
          onChange={(e) => setDraft({ ...draft, time: e.target.value })}
          className={fieldClass}
        />
        <Button variant="cream" size="touch" onClick={add} className="w-full">
          <Plus size={18} className="mr-2" /> Add Task
        </Button>
      </div>

      {patient.tasks.length === 0 ? (
        <p className="text-center text-cream/50 py-6">No tasks added yet.</p>
      ) : (
        <div className="space-y-2">
          {patient.tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 rounded-xl border border-clay bg-ink"
            >
              <div>
                <p className="text-base font-bold text-cream">{t.title}</p>
                <p className="text-sm text-cream/60">{t.time}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="p-2.5 rounded-lg text-destructive hover:bg-destructive/15 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 5 — Important People & Memories (with PHOTOS)
   ═══════════════════════════════════════════════════════════ */

function Step5Memories({
  patient,
  update,
}: {
  patient: PatientData;
  update: (p: Partial<PatientData>) => void;
}) {
  const [draft, setDraft] = useState({
    title: "",
    relationship: "",
    category: "family",
    description: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    // Read as data URL for localStorage persistence
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const add = () => {
    if (!draft.title.trim()) return;
    const newMemory: PatientMemory = {
      id: "mem_" + Date.now(),
      ...draft,
      photoUrl: photoPreview ?? "",
    };
    update({ memories: [...patient.memories, newMemory] });
    setDraft({ title: "", relationship: "", category: "family", description: "" });
    setPhotoPreview(undefined);
    toast.success(`Added memory: ${draft.title}`);
  };

  const remove = (id: string) => {
    update({ memories: patient.memories.filter((m) => m.id !== id) });
  };

  const fieldClass =
    "bg-surface border-clay text-cream h-11 rounded-lg px-3 text-sm focus-visible:ring-sun";

  return (
    <div className="space-y-5">
      <h3 className="font-display text-2xl font-bold text-cream">Important People & Memories</h3>
      <p className="text-cream/70">
        Add family members, familiar places, or things the patient loves. Upload photos for the
        patient's memory gallery.
      </p>

      <div className="rounded-xl border border-clay bg-ink p-5 space-y-3">
        {/* Photo upload */}
        <div>
          <Label className="text-sm font-bold text-cream mb-1 block">Photo (optional)</Label>
          <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-clay bg-surface/50 cursor-pointer hover:border-sun/60 transition-colors overflow-hidden">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-cream/50">
                <ImagePlus size={32} />
                <span className="text-xs mt-1 font-bold">Click to upload a photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
        </div>

        <Input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Name (e.g., Anita)"
          className={fieldClass}
        />
        <Input
          value={draft.relationship}
          onChange={(e) => setDraft({ ...draft, relationship: e.target.value })}
          placeholder="Relationship (e.g., Daughter)"
          className={fieldClass}
        />
        <select
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          className="flex w-full h-11 rounded-lg border border-clay bg-surface text-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sun"
        >
          <option value="family">Family</option>
          <option value="places">Places</option>
          <option value="food">Food</option>
          <option value="hobbies">Hobbies</option>
          <option value="events">Events</option>
        </select>
        <Textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Description (optional)"
          rows={2}
          className="bg-surface border-clay text-cream rounded-lg px-3 py-2 text-sm focus-visible:ring-sun resize-none"
        />
        <Button variant="cream" size="touch" onClick={add} className="w-full">
          <Plus size={18} className="mr-2" /> Add Memory
        </Button>
      </div>

      {patient.memories.length === 0 ? (
        <p className="text-center text-cream/50 py-6">No memories added yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {patient.memories.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-clay bg-ink overflow-hidden"
            >
              {m.photoUrl && (
                <img
                  src={m.photoUrl}
                  alt={m.title}
                  className="w-full h-36 object-cover border-b border-clay/60"
                />
              )}
              <div className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-base font-bold text-cream">{m.title}</p>
                  {m.relationship && (
                    <p className="text-sm text-sun">{m.relationship}</p>
                  )}
                  <p className="text-xs text-cream/50 uppercase mt-1">{m.category}</p>
                  {m.description && (
                    <p className="text-sm text-cream/70 mt-1">{m.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="p-2 rounded-lg text-destructive hover:bg-destructive/15 transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
