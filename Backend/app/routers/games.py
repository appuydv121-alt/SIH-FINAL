from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import DBSession, get_current_user
from app.models.user import User, UserRole
from app.schemas.game import (
    GameSessionCreate,
    GameSessionResponse,
    GameSummaryResponse,
    GameTypeInfo,
)
from app.services.game_service import (
    get_available_game_types,
    get_patient_game_sessions,
    get_patient_game_summary,
    record_game_session,
)
from app.services.relationship_service import (
    caretaker_has_patient_access,
    doctor_has_patient_access,
)

router = APIRouter(
    prefix="/games",
    tags=["Cognitive Games"],
)


def verify_patient_access(
    db,
    current_user: User,
    patient_id: UUID,
):
    if current_user.role == UserRole.ADMIN:
        return

    if current_user.role == UserRole.PATIENT:
        if current_user.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own game records",
            )
        return

    if current_user.role == UserRole.DOCTOR:
        if not doctor_has_patient_access(db, current_user.id, patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Doctor is not assigned to this patient",
            )
        return

    if current_user.role == UserRole.CARETAKER:
        if not caretaker_has_patient_access(db, current_user.id, patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Caretaker is not assigned to this patient",
            )
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to this patient's game data",
    )


@router.get("/types", response_model=list[GameTypeInfo])
def list_game_types():
    """List all available cognitive games and their descriptions."""
    return get_available_game_types()


@router.post(
    "/sessions",
    response_model=GameSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_game_session(
    data: GameSessionCreate,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    """Submit a completed cognitive game session and score."""
    patient_id = data.patient_id or current_user.id

    if current_user.role == UserRole.PATIENT and patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients can only submit scores for themselves",
        )

    verify_patient_access(db, current_user, patient_id)

    return record_game_session(
        db=db,
        patient_id=patient_id,
        data=data,
    )


@router.get(
    "/sessions/patient/{patient_id}",
    response_model=list[GameSessionResponse],
)
def list_game_sessions(
    patient_id: UUID,
    db: DBSession,
    game_type: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
):
    """List historical game sessions for a patient."""
    verify_patient_access(db, current_user, patient_id)

    return get_patient_game_sessions(
        db=db,
        patient_id=patient_id,
        game_type=game_type,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/sessions/patient/{patient_id}/summary",
    response_model=GameSummaryResponse,
)
def get_game_summary(
    patient_id: UUID,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    """Get aggregated game performance statistics for a patient."""
    verify_patient_access(db, current_user, patient_id)

    return get_patient_game_summary(
        db=db,
        patient_id=patient_id,
    )


# ---------------------------------------------------------------------------
# Convenience endpoints — authenticated user operates on their own record
# ---------------------------------------------------------------------------


@router.get(
    "/sessions/my",
    response_model=list[GameSessionResponse],
    summary="List my game sessions",
)
def list_my_game_sessions(
    db: DBSession,
    game_type: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
):
    """List the current user's own game session history."""
    return get_patient_game_sessions(
        db=db,
        patient_id=current_user.id,
        game_type=game_type,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/sessions/my/summary",
    response_model=GameSummaryResponse,
    summary="Get my game performance summary",
)
def get_my_game_summary(
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    """Get the current user's own aggregated game performance statistics."""
    return get_patient_game_summary(
        db=db,
        patient_id=current_user.id,
    )
