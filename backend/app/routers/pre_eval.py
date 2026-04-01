from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ModalityAttempt, PreEvalSession, Student, SurveyProfile
from app.schemas import PreEvalCompleteIn, PreEvalSessionOut
from app.services.dwp_engine import load_theta, predict_strategy_probs
from app.services.fusion import empirical_weights, fuse_dwpa_and_observed

router = APIRouter(prefix="/pre-eval", tags=["pre-eval"])


@router.post("/sessions/start", response_model=PreEvalSessionOut)
def start_session(student_id: int, db: Session = Depends(get_db)):
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
        raise HTTPException(400, "Survey required before pre-evaluation")

    theta = load_theta()
    dwpa = predict_strategy_probs(
        theta,
        hearing=latest.hearing_issue,
        vision=latest.vision_issue,
        focus=latest.focus_issue,
        device=latest.device_score,
    )
    sess = PreEvalSession(
        student_id=student_id,
        status="in_progress",
        dwpa_video=dwpa["video"],
        dwpa_audio=dwpa["audio"],
        dwpa_text=dwpa["text"],
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)
    return sess


@router.post("/sessions/{session_id}/complete", response_model=PreEvalSessionOut)
def complete_session(session_id: int, body: PreEvalCompleteIn, db: Session = Depends(get_db)):
    sess = db.get(PreEvalSession, session_id)
    if not sess:
        raise HTTPException(404, "Session not found")
    if sess.status == "completed":
        raise HTTPException(400, "Session already completed")

    per: dict[str, dict[str, float]] = {}
    for m in body.modalities:
        per[m.strategy] = {
            "quiz": m.quiz_score,
            "engagement": m.engagement_score,
            "time_sec": m.time_on_task_sec,
        }
    obs = empirical_weights(per)
    dwpa = {
        "video": sess.dwpa_video or 0.33,
        "audio": sess.dwpa_audio or 0.33,
        "text": sess.dwpa_text or 0.34,
    }
    final = fuse_dwpa_and_observed(dwpa, obs, body.lambda_blend)

    for m in body.modalities:
        att = ModalityAttempt(
            session_id=session_id,
            strategy=m.strategy,
            time_on_task_sec=m.time_on_task_sec,
            engagement_score=m.engagement_score,
            quiz_score=m.quiz_score,
            completed=m.completed,
        )
        db.add(att)

    sess.lambda_blend = body.lambda_blend
    sess.final_video = final["video"]
    sess.final_audio = final["audio"]
    sess.final_text = final["text"]
    sess.status = "completed"
    sess.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(sess)
    return sess


@router.get("/sessions/{session_id}", response_model=PreEvalSessionOut)
def get_session(session_id: int, db: Session = Depends(get_db)):
    sess = db.get(PreEvalSession, session_id)
    if not sess:
        raise HTTPException(404, "Session not found")
    return sess
