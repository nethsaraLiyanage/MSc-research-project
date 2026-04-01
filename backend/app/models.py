from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_ref: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), unique=True, nullable=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    consents: Mapped[list["ConsentRecord"]] = relationship(back_populates="student")
    surveys: Mapped[list["SurveyProfile"]] = relationship(back_populates="student")
    sessions: Mapped[list["PreEvalSession"]] = relationship(back_populates="student")
    marks: Mapped[list["PostEvalMark"]] = relationship(back_populates="student")


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    accepted: Mapped[bool] = mapped_column(Boolean, default=False)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    version: Mapped[str] = mapped_column(String(32), default="1.0")

    student: Mapped["Student"] = relationship(back_populates="consents")


class SurveyProfile(Base):
    __tablename__ = "survey_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(32), nullable=True)
    hearing_issue: Mapped[float] = mapped_column(Float, default=0.0)  # H ∈ [0,1]
    vision_issue: Mapped[float] = mapped_column(Float, default=0.0)  # V
    focus_issue: Mapped[float] = mapped_column(Float, default=0.0)  # F
    device_score: Mapped[float] = mapped_column(Float, default=1.0)  # D ∈ [0,1], higher = more capable
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    student: Mapped["Student"] = relationship(back_populates="surveys")


class PreEvalSession(Base):
    __tablename__ = "pre_eval_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    status: Mapped[str] = mapped_column(String(32), default="in_progress")
    dwpa_video: Mapped[float | None] = mapped_column(Float, nullable=True)
    dwpa_audio: Mapped[float | None] = mapped_column(Float, nullable=True)
    dwpa_text: Mapped[float | None] = mapped_column(Float, nullable=True)
    final_video: Mapped[float | None] = mapped_column(Float, nullable=True)
    final_audio: Mapped[float | None] = mapped_column(Float, nullable=True)
    final_text: Mapped[float | None] = mapped_column(Float, nullable=True)
    lambda_blend: Mapped[float] = mapped_column(Float, default=0.45)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    student: Mapped["Student"] = relationship(back_populates="sessions")
    attempts: Mapped[list["ModalityAttempt"]] = relationship(back_populates="session")


class ModalityAttempt(Base):
    __tablename__ = "modality_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("pre_eval_sessions.id"), index=True)
    strategy: Mapped[str] = mapped_column(String(16))
    time_on_task_sec: Mapped[float] = mapped_column(Float, default=0.0)
    engagement_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0–1 composite / or CV proxy
    quiz_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0–1
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

    session: Mapped["PreEvalSession"] = relationship(back_populates="attempts")


class PostEvalMark(Base):
    __tablename__ = "post_eval_marks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    assessment_id: Mapped[str] = mapped_column(String(64), index=True)
    score: Mapped[float] = mapped_column(Float)
    max_score: Mapped[float] = mapped_column(Float, default=100.0)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    student: Mapped["Student"] = relationship(back_populates="marks")
