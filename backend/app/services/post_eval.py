"""
Post-evaluation: detect declining performance and flag re-run of pre-evaluation.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import PostEvalMark


def trend_ratio(db: Session, student_id: int, last_n: int = 5) -> tuple[float | None, bool]:
    """
    Returns (recent_avg / older_avg, should_reiterate).
    If not enough data, returns (None, False).
    """
    stmt = (
        select(PostEvalMark)
        .where(PostEvalMark.student_id == student_id)
        .order_by(PostEvalMark.recorded_at.desc())
        .limit(max(last_n * 2, 4))
    )
    rows = list(db.scalars(stmt).all())
    if len(rows) < 4:
        return None, False

    def norm(m: PostEvalMark) -> float:
        if m.max_score and m.max_score > 0:
            return m.score / m.max_score
        return m.score

    vals = [norm(m) for m in rows]
    half = len(vals) // 2
    recent = sum(vals[:half]) / half
    older = sum(vals[half:]) / max(len(vals) - half, 1)
    if older <= 0:
        return recent, recent < 0.55
    ratio = recent / older
    reiterate = ratio < 0.88 and recent < 0.62
    return ratio, reiterate
