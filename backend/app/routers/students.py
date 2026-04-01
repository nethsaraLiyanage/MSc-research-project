from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ConsentRecord, Student, SurveyProfile
from app.schemas import ConsentIn, StudentCreate, StudentOut, SurveyIn

router = APIRouter(prefix="/students", tags=["students"])


@router.post("", response_model=StudentOut)
def create_student(body: StudentCreate, db: Session = Depends(get_db)):
    email_norm = body.email.strip().lower()
    taken = db.query(Student).filter(Student.email == email_norm).first()
    if taken:
        raise HTTPException(status.HTTP_409_CONFLICT, "This email is already registered")
    s = Student(email=email_norm, display_name=body.display_name)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    return s


@router.post("/{student_id}/consent")
def record_consent(student_id: int, body: ConsentIn, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    from datetime import datetime

    c = ConsentRecord(student_id=student_id, accepted=body.accepted, version=body.version)
    if body.accepted:
        c.accepted_at = datetime.utcnow()
    db.add(c)
    db.commit()
    return {"ok": True}


@router.post("/{student_id}/survey")
def save_survey(student_id: int, body: SurveyIn, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    sp = SurveyProfile(
        student_id=student_id,
        age=body.age,
        gender=body.gender,
        hearing_issue=body.hearing_issue,
        vision_issue=body.vision_issue,
        focus_issue=body.focus_issue,
        device_score=body.device_score,
    )
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return {"id": sp.id}
