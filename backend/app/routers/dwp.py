from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student, SurveyProfile
from app.schemas import DWPAOut, DWPARequest
from app.services.dwp_engine import load_theta, predict_strategy_probs

router = APIRouter(prefix="/dwp", tags=["dwp"])


@router.post("/preview", response_model=DWPAOut)
def preview_dwpa(body: DWPARequest):
    theta = load_theta()
    p = predict_strategy_probs(
        theta,
        hearing=body.hearing_issue,
        vision=body.vision_issue,
        focus=body.focus_issue,
        device=body.device_score,
    )
    return DWPAOut(**p)


@router.get("/student/{student_id}", response_model=DWPAOut)
def dwpa_for_student(student_id: int, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    latest = (
        db.query(SurveyProfile)
        .filter(SurveyProfile.student_id == student_id)
        .order_by(SurveyProfile.created_at.desc())
        .first()
    )
    if not latest:
        raise HTTPException(400, "No survey profile; complete survey first")
    theta = load_theta()
    p = predict_strategy_probs(
        theta,
        hearing=latest.hearing_issue,
        vision=latest.vision_issue,
        focus=latest.focus_issue,
        device=latest.device_score,
    )
    return DWPAOut(**p)
