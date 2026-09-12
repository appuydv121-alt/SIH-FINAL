from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.core.dependencies import DBSession, require_caretaker
from app.models.assessment import CognitiveAssessment
from app.models.medication import MedicationLog, MedicationLogStatus
from app.models.relationship import CaretakerPatient
from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/caretakers",
    tags=["Caregivers"],
)


@router.get("/patients", response_model=list[UserResponse])
def get_caretaker_patients(
    db: DBSession,
    current_user: User = Depends(require_caretaker),
):
    """List all patients assigned to the current caretaker."""
    patients = db.scalars(
        select(User)
        .join(CaretakerPatient, CaretakerPatient.patient_id == User.id)
        .where(
            CaretakerPatient.caretaker_id == current_user.id,
            CaretakerPatient.active.is_(True),
            User.role == UserRole.PATIENT,
            User.is_active.is_(True),
        )
    ).all()

    return list(patients)


@router.get("/dashboard")
def get_caretaker_dashboard(
    db: DBSession,
    current_user: User = Depends(require_caretaker),
):
    """Caregiver dashboard showing assigned patients, cognitive summaries, and pending tasks/meds."""
    patients = db.scalars(
        select(User)
        .join(CaretakerPatient, CaretakerPatient.patient_id == User.id)
        .where(
            CaretakerPatient.caretaker_id == current_user.id,
            CaretakerPatient.active.is_(True),
            User.role == UserRole.PATIENT,
            User.is_active.is_(True),
        )
    ).all()

    patient_reports = []

    for patient in patients:
        latest_assessment = db.scalar(
            select(CognitiveAssessment)
            .where(CognitiveAssessment.patient_id == patient.id)
            .order_by(CognitiveAssessment.assessment_date.desc())
        )

        pending_meds = db.scalars(
            select(MedicationLog)
            .where(
                MedicationLog.patient_id == patient.id,
                MedicationLog.status == MedicationLogStatus.SCHEDULED,
            )
        ).all()

        pending_tasks = db.scalars(
            select(Task)
            .where(
                Task.patient_id == patient.id,
                Task.status == TaskStatus.PENDING,
            )
        ).all()

        patient_reports.append(
            {
                "patient": UserResponse.model_validate(patient),
                "latest_cognitive_score": latest_assessment.overall_score if latest_assessment else None,
                "risk_level": latest_assessment.risk_level if latest_assessment else "unassessed",
                "pending_medication_count": len(pending_meds),
                "pending_task_count": len(pending_tasks),
            }
        )

    return {
        "caretaker_id": current_user.id,
        "caretaker_name": current_user.name,
        "total_patients": len(patients),
        "patients": patient_reports,
    }
