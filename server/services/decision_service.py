import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models import ReinsuranceSubmission, UnderwritingDecision
from server.schemas import QuoteDecisionCreate, DeclineDecisionCreate


def record_quote(db: Session, quote_in: QuoteDecisionCreate) -> UnderwritingDecision:
    submission = db.query(ReinsuranceSubmission).filter(
        ReinsuranceSubmission.id == quote_in.submission_id
    ).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{quote_in.submission_id}' not found.",
        )

    # Validate binding terms
    if quote_in.premium_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Binding quote must specify a positive premium amount.",
        )
    if quote_in.capacity_offered <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Binding quote must specify positive capacity offered.",
        )

    decision = UnderwritingDecision(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        decision_type="QUOTE",
        premium_amount=quote_in.premium_amount,
        capacity_offered=quote_in.capacity_offered,
        deductible_retention=quote_in.deductible_retention,
        subjectivities=quote_in.subjectivities,
        expiration_date=quote_in.expiration_date,
        decline_reason_code=None,
        underwriter_id=quote_in.underwriter_id or "underwriter@generalre.local",
        notes=quote_in.notes,
        created_at=datetime.now(timezone.utc),
    )

    submission.status = "QUOTED"
    submission.updated_at = datetime.now(timezone.utc)

    db.add(decision)
    db.commit()
    db.refresh(decision)
    return decision


def record_decline(db: Session, decline_in: DeclineDecisionCreate) -> UnderwritingDecision:
    submission = db.query(ReinsuranceSubmission).filter(
        ReinsuranceSubmission.id == decline_in.submission_id
    ).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{decline_in.submission_id}' not found.",
        )

    if not decline_in.decline_reason_code or not decline_in.decline_reason_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Declination requires a mandatory standardized decline reason code.",
        )

    decision = UnderwritingDecision(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        decision_type="DECLINE",
        premium_amount=None,
        capacity_offered=None,
        deductible_retention=None,
        subjectivities=None,
        expiration_date=None,
        decline_reason_code=decline_in.decline_reason_code.strip().upper(),
        underwriter_id=decline_in.underwriter_id or "underwriter@generalre.local",
        notes=decline_in.notes,
        created_at=datetime.now(timezone.utc),
    )

    submission.status = "DECLINED"
    submission.updated_at = datetime.now(timezone.utc)

    db.add(decision)
    db.commit()
    db.refresh(decision)
    return decision
