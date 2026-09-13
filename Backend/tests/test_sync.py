import pytest
from datetime import datetime, timezone
from uuid import uuid4

def test_sync_offline_batch_endpoint(client, patient_user):
    headers = patient_user["headers"]
    patient_id = str(patient_user["user"].id)

    payload = {
        "patient_id": patient_id,
        "game_events": [
            {
                "client_event_id": str(uuid4()),
                "game_type": "memory_match",
                "game_id": "card-matching",
                "score": 95,
                "accuracy": 0.9,
                "duration_seconds": 120,
                "difficulty": "easy",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
        ],
        "medication_events": [],
        "task_events": [],
        "memory_events": [
            {
                "client_event_id": str(uuid4()),
                "title": "Offline Shared Memory",
                "category": "Family",
                "description": "Created while offline in rural area",
                "date_or_era": "2026",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ],
        "voice_events": [
            {
                "client_event_id": str(uuid4()),
                "transcript": "Dawaai le li",
                "action_taken": "mark_medication_taken",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
    }

    response = client.post("/api/v1/sync", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["synced_games"] == 1
    assert data["synced_memories"] == 1
    assert data["synced_voice_logs"] == 1
