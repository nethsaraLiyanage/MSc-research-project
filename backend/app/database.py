from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def migrate_sqlite_schema() -> None:
    """Lightweight additive migrations for local SQLite (no Alembic)."""
    if not settings.database_url.startswith("sqlite"):
        return
    insp = inspect(engine)
    if not insp.has_table("students"):
        return
    cols = {c["name"] for c in insp.get_columns("students")}
    if "email" not in cols:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE students ADD COLUMN email VARCHAR(320)"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
