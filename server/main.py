import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.routers import submissions, underwriting, decisions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed data idempotently
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Facultative Reinsurance Web Portal API",
    description="Underwriting Review Queue, Automated Risk Scoring, and Decision Management for Cyber & D&O Risks",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(submissions.router)
app.include_router(underwriting.router)
app.include_router(decisions.router)


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Facultative Reinsurance Web Portal API",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
