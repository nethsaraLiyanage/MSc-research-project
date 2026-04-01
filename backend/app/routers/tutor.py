from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PreEvalSession, Student
from app.schemas import DWPAOut, TutorBatchOut
from app.services.post_eval import trend_ratio

router = APIRouter(prefix="/tutor", tags=["tutor"])


@router.get("/batch-summary", response_model=list[TutorBatchOut])
def batch_summary(db: Session = Depends(get_db)):
    students = db.query(Student).order_by(Student.id).all()
    out: list[TutorBatchOut] = []
    for s in students:
        last_sess = (
            db.query(PreEvalSession)
            .filter(PreEvalSession.student_id == s.id, PreEvalSession.status == "completed")
            .order_by(PreEvalSession.completed_at.desc())
            .first()
        )
        final = None
        if last_sess and last_sess.final_video is not None:
            final = DWPAOut(
                video=last_sess.final_video,
                audio=last_sess.final_audio or 0.0,
                text=last_sess.final_text or 0.0,
            )
        ratio, reit = trend_ratio(db, s.id)
        out.append(
            TutorBatchOut(
                student_id=s.id,
                email=s.email,
                display_name=s.display_name,
                last_final=final,
                trend_ratio=ratio,
                reiterate=reit,
            )
        )
    return out
