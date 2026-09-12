import logging
from apscheduler.schedulers.background import (
    BackgroundScheduler,
)

from app.core.database import SessionLocal
from app.services.reminder_service import (
    process_due_medications,
)

logger = logging.getLogger("scheduler")
scheduler = BackgroundScheduler()


def scheduled_reminder_job():
    db = SessionLocal()

    try:
        count = process_due_medications(db)
        if count > 0:
            logger.info(f"Processed {count} due medication reminders.")
    except Exception as exc:
        db.rollback()
        logger.error(f"Error executing scheduled reminder job: {exc}", exc_info=True)
    finally:
        db.close()


def start_scheduler():
    if scheduler.running:
        return

    scheduler.add_job(
        scheduled_reminder_job,
        "interval",
        minutes=1,
        id="medication_reminder_job",
        replace_existing=True,
    )

    scheduler.start()


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()