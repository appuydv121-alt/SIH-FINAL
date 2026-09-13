from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PatientProfileCreate(BaseModel):
    date_of_birth: date | None = None

    emergency_contact_name: str | None = Field(
        default=None,
        max_length=150,
    )

    emergency_contact_phone: str | None = Field(
        default=None,
        max_length=20,
    )

    preferred_language: str = Field(
        default="en",
        max_length=20,
    )

    gender: str | None = Field(
        default=None,
        max_length=20,
    )

    address: str | None = Field(
        default=None,
        max_length=255,
    )

    doctor_name: str | None = Field(
        default=None,
        max_length=150,
    )

    timezone: str = Field(
        default="Asia/Kolkata",
        max_length=50,
    )


class PatientProfileUpdate(BaseModel):
    date_of_birth: date | None = None

    emergency_contact_name: str | None = Field(
        default=None,
        max_length=150,
    )

    emergency_contact_phone: str | None = Field(
        default=None,
        max_length=20,
    )

    preferred_language: str | None = Field(
        default=None,
        max_length=20,
    )

    gender: str | None = Field(
        default=None,
        max_length=20,
    )

    address: str | None = Field(
        default=None,
        max_length=255,
    )

    doctor_name: str | None = Field(
        default=None,
        max_length=150,
    )

    timezone: str | None = Field(
        default=None,
        max_length=50,
    )


class PatientProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    date_of_birth: date | None
    emergency_contact_name: str | None
    emergency_contact_phone: str | None
    preferred_language: str
    gender: str | None = None
    address: str | None = None
    doctor_name: str | None = None
    timezone: str

    model_config = ConfigDict(from_attributes=True)