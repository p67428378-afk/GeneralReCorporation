from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from server.database import get_db
from server.models import (
    ReinsuranceSubmission,
    MissingInfoFlag,
    UnderwritingDecision,
)
from server.schemas import (
    SubmissionResponse,
    ScoreBreakdownResponse,
    ChecklistResponse,
    MissingInfoFlagResponse,
    FlagResolveRequest,
    UnderwritingKPIResponse,
)
from server.services.scoring_engine import calculate_risk_score
from server.services.checklist_service import evaluate_and_sync_checklist

router = APIRouter(prefix="/api/v1/underwriting", tags=["Underwriting Queue & Triage"])


@router.get("/kpis", response_model=UnderwritingKPIResponse)
def get_underwriting_kpis(db: Session = Depends(get_db)):
    total_submissions = db.query(ReinsuranceSubmission).count()
    active_requests = db.query(ReinsuranceSubmission).filter(
        ReinsuranceSubmission.status.in_(["PENDING", "UNDER_REVIEW"])
    ).count()

    avg_score_res = db.query(func.avg(ReinsuranceSubmission.risk_score)).scalar()
    avg_score = float(avg_score_res) if avg_score_res is not None else 0.0

    unresolved_flags = db.query(MissingInfoFlag).filter(
        MissingInfoFlag.is_resolved.is_(False)
    ).count()

    quoted_capacity_res = db.query(func.sum(UnderwritingDecision.capacity_offered)).filter(
        UnderwritingDecision.decision_type == "QUOTE"
    ).scalar()
    quoted_capacity = float(quoted_capacity_res) if quoted_capacity_res is not None else 0.0

    return UnderwritingKPIResponse(
        active_requests=active_requests,
        avg_risk_score=round(avg_score, 1),
        missing_info_flags=unresolved_flags,
        quoted_capacity=quoted_capacity,
        total_submissions=total_submissions,
    )


@router.get("/queue", response_model=List[SubmissionResponse])
def get_underwriting_queue(
    risk_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    risk_tier: Optional[str] = None,
    carrier_id: Optional[str] = None,
    min_score: Optional[int] = Query(None, ge=0, le=100),
    max_score: Optional[int] = Query(None, ge=0, le=100),
    sort_by: Optional[str] = Query("risk_score_desc", description="risk_score_desc, risk_score_asc, created_at_desc, limit_desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(ReinsuranceSubmission).options(
        joinedload(ReinsuranceSubmission.carrier),
        joinedload(ReinsuranceSubmission.documents),
        joinedload(ReinsuranceSubmission.missing_info_flags),
        joinedload(ReinsuranceSubmission.decisions),
    )

    if risk_type:
        rt = risk_type.strip().upper()
        if "CYBER" in rt:
            query = query.filter(ReinsuranceSubmission.risk_type == "CYBER")
        elif "D" in rt and "O" in rt:
            query = query.filter(ReinsuranceSubmission.risk_type == "D_AND_O")
        else:
            query = query.filter(ReinsuranceSubmission.risk_type == rt)

    if status_filter:
        query = query.filter(ReinsuranceSubmission.status == status_filter.strip().upper())

    if risk_tier:
        query = query.filter(ReinsuranceSubmission.risk_tier == risk_tier.strip().upper())

    if carrier_id:
        query = query.filter(ReinsuranceSubmission.carrier_id == carrier_id)

    if min_score is not None:
        query = query.filter(ReinsuranceSubmission.risk_score >= min_score)

    if max_score is not None:
        query = query.filter(ReinsuranceSubmission.risk_score <= max_score)

    if sort_by == "risk_score_asc":
        query = query.order_by(ReinsuranceSubmission.risk_score.asc())
    elif sort_by == "created_at_desc":
        query = query.order_by(ReinsuranceSubmission.created_at.desc())
    elif sort_by == "limit_desc":
        query = query.order_by(ReinsuranceSubmission.limit_requested.desc())
    else:  # default risk_score_desc
        query = query.order_by(ReinsuranceSubmission.risk_score.desc())

    return query.offset(skip).limit(limit).all()


@router.get("/{submission_id}/score-breakdown", response_model=ScoreBreakdownResponse)
def get_score_breakdown(
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

    score, tier, factors, explanation = calculate_risk_score({
        "limit_requested": submission.limit_requested,
        "attachment_point": submission.attachment_point,
        "loss_history_count": submission.loss_history_count,
        "total_incurred_losses": submission.total_incurred_losses,
        "risk_type": submission.risk_type,
        "mfa_enforced": submission.mfa_enforced,
        "prior_breach_history": submission.prior_breach_history,
        "security_audit_score": submission.security_audit_score,
        "audited_financials_available": submission.audited_financials_available,
        "governance_rating": submission.governance_rating,
        "financial_rating": submission.financial_rating,
        "industry_sector": submission.industry_sector,
    })

    return ScoreBreakdownResponse(
        submission_id=submission.id,
        risk_score=score,
        risk_tier=tier,
        scoring_factors=factors,
        explanation=explanation,
    )


@router.get("/{submission_id}/checklist", response_model=ChecklistResponse)
def get_submission_checklist(
    submission_id: str,
    db: Session = Depends(get_db),
):
    submission = (
        db.query(ReinsuranceSubmission)
        .options(
            joinedload(ReinsuranceSubmission.documents),
            joinedload(ReinsuranceSubmission.missing_info_flags),
        )
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{submission_id}' not found.",
        )

    evaluate_and_sync_checklist(db, submission)
    db.commit()

    flags = submission.missing_info_flags
    unresolved = [f for f in flags if not f.is_resolved]

    return ChecklistResponse(
        submission_id=submission.id,
        flags=flags,
        is_complete=(len(unresolved) == 0),
        total_flags=len(flags),
        unresolved_flags=len(unresolved),
    )


@router.post("/{submission_id}/checklist/{flag_id}/resolve", response_model=MissingInfoFlagResponse)
def resolve_checklist_flag(
    submission_id: str,
    flag_id: str,
    resolve_in: Optional[FlagResolveRequest] = None,
    db: Session = Depends(get_db),
):
    flag = db.query(MissingInfoFlag).filter(
        MissingInfoFlag.id == flag_id,
        MissingInfoFlag.submission_id == submission_id,
    ).first()
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Checklist flag with ID '{flag_id}' not found for submission '{submission_id}'.",
        )

    flag.is_resolved = resolve_in.is_resolved if resolve_in else True
    db.commit()
    db.refresh(flag)
    return flag
