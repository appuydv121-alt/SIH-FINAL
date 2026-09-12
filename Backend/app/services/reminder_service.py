from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.medication import (
    MedicationLog,
    MedicationSchedule,
)
from app.models.notification import NotificationType

from app.services.medication_service import (
    create_medication_log,
)
from app.services.notification_service import (
    create_notification,
)


def is_schedule_due_today(
    schedule: MedicationSchedule,
    target_date: date,
) -> bool:

    if not schedule.active:
        return False

    if target_date < schedule.start_date:
        return False

    if (
        schedule.end_date
        and target_date > schedule.end_date
    ):
        return False

    if schedule.frequency.value == "daily":
        return True

    if schedule.frequency.value in (
        "weekly",
        "custom",
    ):
        if not schedule.days_of_week:
            return False

        current_day = target_date.strftime(
            "%a"
        ).lower()

        days = [
            day.strip().lower()
            for day in schedule.days_of_week.split(",")
        ]

        return current_day in days

    return False


def get_due_schedules(
    db: Session,
    now: datetime,
) -> list[MedicationSchedule]:

    today = now.date()
    current_time = now.time()

    statement = (
        select(MedicationSchedule)
        .where(
            MedicationSchedule.active.is_(True),
            MedicationSchedule.reminder_enabled.is_(True),
            MedicationSchedule.start_date <= today,
            MedicationSchedule.scheduled_time <= current_time,
        )
    )

    schedules = list(
        db.scalars(statement).all()
    )

    return [
        schedule
        for schedule in schedules
        if is_schedule_due_today(
            schedule,
            today,
        )
    ]


def medication_log_exists(
    db: Session,
    schedule_id,
    scheduled_datetime,
) -> bool:

    statement = (
        select(MedicationLog)
        .where(
            MedicationLog.schedule_id
            == schedule_id,
            MedicationLog.scheduled_at
            == scheduled_datetime,
        )
    )

    return db.scalar(statement) is not None


def process_due_medications(
    db: Session,
    now: datetime | None = None,
) -> int:

    if now is None:
        now = datetime.now(timezone.utc)

    schedules = get_due_schedules(
        db,
        now,
    )

    processed_count = 0

    for schedule in schedules:

        scheduled_datetime = datetime.combine(
            now.date(),
            schedule.scheduled_time,
            tzinfo=timezone.utc,
        )

        if medication_log_exists(
            db,
            schedule.id,
            scheduled_datetime,
        ):
            continue

        log = create_medication_log(
            db,
            schedule,
            scheduled_datetime,
        )

        create_notification(
            db=db,
            patient_id=schedule.patient_id,
            notification_type=NotificationType.MEDICATION,
            title="Medication Reminder",
            message=(
                f"Please take "
                f"{schedule.medicine_name} "
                f"({schedule.dosage})."
            ),
            scheduled_for=scheduled_datetime,
            related_entity_id=log.id,
        )

        db.commit()

        processed_count += 1

    return processed_count