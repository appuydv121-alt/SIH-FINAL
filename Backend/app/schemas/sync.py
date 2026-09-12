from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.medication import MedicationLogStatus
from app.models.task import TaskStatus


class SyncGameEvent(BaseModel):
    client_event_id: str = Field(description="Unique client-side event ID for idempotency")
    game_type: str
    game_id: str
    score: int
    accuracy: float
    duration_seconds: int
    difficulty: str = "medium"
    completed_at: datetime


class SyncMedicationEvent(BaseModel):
    client_event_id: str
    log_id: UUID | None = None
    schedule_id: UUID | None = None
    status: MedicationLogStatus
    taken_at: datetime | None = None


class SyncTaskEvent(BaseModel):
    client_event_id: str
    task_id: UUID
    status: TaskStatus
    completed_at: datetime | None = None


class SyncBatchRequest(BaseModel):
    patient_id: UUID | None = None
    last_synced_at: datetime | None = None
    game_events: list[SyncGameEvent] = Field(default_factory=list)
    medication_events: list[SyncMedicationEvent] = Field(default_factory=list)
    task_events: list[SyncTaskEvent] = Field(default_factory=list)


class SyncBatchResponse(BaseModel):
    success: bool
    synced_games: int
    synced_medications: int
    synced_tasks: int
    conflicts: list[str] = Field(default_factory=list)
    server_timestamp: datetime
