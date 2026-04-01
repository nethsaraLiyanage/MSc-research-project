from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PostEvalMark, Student
from app.schemas import PostEvalStatusOut, PostMarkIn
from app.services.post_eval import trend_ratio

router = APIRouter(prefix="/post-eval", tags=["post-eval"])


@router.post("/students/{student_id}/marks")
def add_mark(student_id: int, body: PostMarkIn, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    m = PostEvalMark(
        student_id=student_id,
        assessment_id=body.assessment_id,
        score=body.score,
        max_score=body.max_score,
        notes=body.notes,
        recorded_at=datetime.utcnow(),
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return {"id": m.id}


@router.get("/students/{student_id}/status", response_model=PostEvalStatusOut)
def post_status(student_id: int, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    ratio, reit = trend_ratio(db, student_id)
    return PostEvalStatusOut(trend_ratio=ratio, should_reiterate_pre_eval=reit)
