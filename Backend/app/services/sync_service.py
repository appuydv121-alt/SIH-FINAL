import json
import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.game import GameSession
from app.models.medication import MedicationLog, MedicationSchedule
from app.models.task import Task
from app.schemas.sync import SyncBatchRequest, SyncBatchResponse

logger = logging.getLogger("sync_service")


def process_offline_sync(
    db: Session,
    patient_id: UUID,
    data: SyncBatchRequest,
) -> SyncBatchResponse:
    now = datetime.now(timezone.utc)
    synced_games = 0
    synced_meds = 0
    synced_tasks = 0
    conflicts = []

    try:
        # 1. Process Game Events
        for ge in data.game_events:
            # Check for duplicate session by matching time, patient, and game
            existing = db.scalar(
                select(GameSession).where(
                    GameSession.patient_id == patient_id,
                    GameSession.completed_at == ge.completed_at,
                    GameSession.game_id == ge.game_id,
                )
            )
            if not existing:
                session = GameSession(
                    patient_id=patient_id,
                    game_type=ge.game_type,
                    game_id=ge.game_id,
                    score=ge.score,
                    accuracy=ge.accuracy,
                    duration_seconds=ge.duration_seconds,
                    difficulty=ge.difficulty,
                    metrics=json.dumps({"client_event_id": ge.client_event_id}),
                    completed_at=ge.completed_at,
                )
                db.add(session)
                synced_games += 1

        # 2. Process Medication Events
        for me in data.medication_events:
            if me.log_id:
                log = db.get(MedicationLog, me.log_id)
                if log and log.patient_id == patient_id:
                    log.status = me.status
                    log.taken_at = me.taken_at or now
                    synced_meds += 1
                else:
                    conflicts.append(f"Medication log {me.log_id} not found for patient")
            elif me.schedule_id:
                sched = db.get(MedicationSchedule, me.schedule_id)
                if sched and sched.patient_id == patient_id:
                    log = MedicationLog(
                        patient_id=patient_id,
                        schedule_id=sched.id,
                        scheduled_at=me.taken_at or now,
                        status=me.status,
                        taken_at=me.taken_at or now,
                    )
                    db.add(log)
                    synced_meds += 1
                else:
                    conflicts.append(f"Schedule {me.schedule_id} not found for patient")

        # 3. Process Task Events
        for te in data.task_events:
            task = db.get(Task, te.task_id)
            if task and task.patient_id == patient_id:
                task.status = te.status
                task.completed_at = te.completed_at or now
                synced_tasks += 1
            else:
                conflicts.append(f"Task {te.task_id} not found for patient")

        db.commit()

    except Exception as exc:
        db.rollback()
        logger.error(f"Failed to process offline sync: {exc}", exc_info=True)
        raise

    return SyncBatchResponse(
        success=True,
        synced_games=synced_games,
        synced_medications=synced_meds,
        synced_tasks=synced_tasks,
        conflicts=conflicts,
        server_timestamp=now,
    )
