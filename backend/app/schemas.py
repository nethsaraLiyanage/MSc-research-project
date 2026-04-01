from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

StrategyName = Literal["video", "audio", "text"]


class StudentCreate(BaseModel):
    email: EmailStr
    display_name: str | None = None


class StudentOut(BaseModel):
    id: int
    email: str | None
    display_name: str | None

    model_config = {"from_attributes": True}


class ConsentIn(BaseModel):
    accepted: bool = True
    version: str = "1.0"


class SurveyIn(BaseModel):
    age: int | None = Field(None, ge=5, le=100)
    gender: str | None = None
    hearing_issue: float = Field(0.0, ge=0, le=1)
    vision_issue: float = Field(0.0, ge=0, le=1)
    focus_issue: float = Field(0.0, ge=0, le=1)
    device_score: float = Field(1.0, ge=0, le=1)


class DWPARequest(BaseModel):
    hearing_issue: float = Field(0.0, ge=0, le=1)
    vision_issue: float = Field(0.0, ge=0, le=1)
    focus_issue: float = Field(0.0, ge=0, le=1)
    device_score: float = Field(1.0, ge=0, le=1)


class DWPAOut(BaseModel):
    video: float
    audio: float
    text: float


class ModalityProgressIn(BaseModel):
    strategy: StrategyName
    time_on_task_sec: float = 0.0
    engagement_score: float = Field(0.0, ge=0, le=1)
    quiz_score: float = Field(0.0, ge=0, le=1)
    completed: bool = True


class PreEvalCompleteIn(BaseModel):
    lambda_blend: float = Field(0.45, ge=0, le=1)
    modalities: list[ModalityProgressIn]


class PreEvalSessionOut(BaseModel):
    id: int
    student_id: int
    status: str
    dwpa_video: float | None
    dwpa_audio: float | None
    dwpa_text: float | None
    final_video: float | None
    final_audio: float | None
    final_text: float | None
    lambda_blend: float
    created_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class PostMarkIn(BaseModel):
    assessment_id: str
    score: float
    max_score: float = 100.0
    notes: str | None = None


class PostEvalStatusOut(BaseModel):
    trend_ratio: float | None
    should_reiterate_pre_eval: bool


class TutorBatchOut(BaseModel):
    student_id: int
    email: str | None
    display_name: str | None
    last_final: DWPAOut | None
    trend_ratio: float | None
    reiterate: bool
