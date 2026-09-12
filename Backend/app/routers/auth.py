from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import (
    DBSession,
    get_current_user,
)
from app.core.security import create_access_token
from app.models.user import User, UserRole
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.schemas.patient import PatientProfileCreate
from app.services.auth_service import (
    authenticate_user,
    register_user,
)
from app.services.patient_service import create_patient_profile


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: DBSession,
):
    try:
        # Create the user
        user = register_user(
            db,
            data,
        )

        # Automatically create a patient profile
        # for newly registered patient users.
        if user.role == UserRole.PATIENT:
            create_patient_profile(
                db,
                user,
                PatientProfileCreate(),
            )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    token = create_access_token(user.id)

    return AuthResponse(
        user=user,
        token=TokenResponse(
            access_token=token,
        ),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    data: LoginRequest,
    db: DBSession,
):
    user = authenticate_user(
        db,
        data.email,
        data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id)

    return AuthResponse(
        user=user,
        token=TokenResponse(
            access_token=token,
        ),
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user