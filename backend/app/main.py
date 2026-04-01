from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine, migrate_sqlite_schema
from app.routers import dwp, post_eval, pre_eval, students, tutor

settings = get_settings()
Base.metadata.create_all(bind=engine)
migrate_sqlite_schema()

app = FastAPI(title="Learning Strategy Analytics", version="0.1.0")

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(dwp.router)
app.include_router(pre_eval.router)
app.include_router(post_eval.router)
app.include_router(tutor.router)


@app.get("/health")
def health():
    return {"status": "ok"}
