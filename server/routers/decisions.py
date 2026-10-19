from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import UnderwritingDecision, ReinsuranceSubmission
from server.schemas import (
    QuoteDecisionCreate,
    DeclineDecisionCreate,
    DecisionResponse,
)
from server.services.decision_service import record_quote, record_decline

router = APIRouter(prefix="/api/v1/decisions", tags=["Quote & Decline Decisions"])


@router.post("/quote", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
def submit_quote_decision(
    quote_in: QuoteDecisionCreate,
    db: Session = Depends(get_db),
):
    return record_quote(db, quote_in)


@router.post("/decline", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
def submit_decline_decision(
    decline_in: DeclineDecisionCreate,
    db: Session = Depends(get_db),
):
    return record_decline(db, decline_in)


@router.get("/{submission_id}", response_model=List[DecisionResponse])
def get_submission_decisions(
    submission_id: str,
    db: Session = Depends(get_db),
):
    submission = db.query(ReinsuranceSubmission).filter(
        ReinsuranceSubmission.id == submission_id
    ).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{submission_id}' not found.",
        )

    decisions = (
        db.query(UnderwritingDecision)
        .filter(UnderwritingDecision.submission_id == submission_id)
        .order_by(UnderwritingDecision.created_at.desc())
        .all()
    )
    return decisions


@router.get("", response_model=List[DecisionResponse])
def list_all_decisions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return (
        db.query(UnderwritingDecision)
        .order_by(UnderwritingDecision.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
