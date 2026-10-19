import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from server.database import get_db
from server.models import (
    ReinsuranceSubmission,
    CarrierProfile,
    SubmissionDocument,
)
from server.schemas import (
    SubmissionCreate,
    SubmissionUpdate,
    SubmissionResponse,
    DocumentCreate,
    DocumentResponse,
    CarrierProfileCreate,
    CarrierProfileResponse,
)
from server.services.scoring_engine import calculate_risk_score
from server.services.checklist_service import evaluate_and_sync_checklist

router = APIRouter(prefix="/api/v1", tags=["Submissions & Carriers"])


# -------------------------------------------------------------
# Carriers
# -------------------------------------------------------------
@router.get("/carriers", response_model=List[CarrierProfileResponse])
def list_carriers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return db.query(CarrierProfile).order_by(CarrierProfile.name.asc()).offset(skip).limit(limit).all()


@router.post("/carriers", response_model=CarrierProfileResponse, status_code=status.HTTP_201_CREATED)
def create_carrier(
    carrier_in: CarrierProfileCreate,
    db: Session = Depends(get_db),
):
    carrier = CarrierProfile(
        id=str(uuid.uuid4()),
        name=carrier_in.name,
        rating=carrier_in.rating,
        contact_email=carrier_in.contact_email,
        phone=carrier_in.phone,
        headquarters=carrier_in.headquarters,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(carrier)
    db.commit()
    db.refresh(carrier)
    return carrier


# -------------------------------------------------------------
# Submissions
# -------------------------------------------------------------
@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db),
):
    # Normalize risk_type
    raw_type = submission_in.risk_type.strip().upper()
    if raw_type in ("CYBER", "CYBER_RISK"):
        normalized_risk_type = "CYBER"
    elif raw_type in ("D_AND_O", "D&O", "DIRECTORS_AND_OFFICERS"):
        normalized_risk_type = "D_AND_O"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid risk type '{submission_in.risk_type}'. Must be 'CYBER' or 'D_AND_O'.",
        )

    # Resolve Carrier
    carrier = None
    if submission_in.carrier_id:
        carrier = db.query(CarrierProfile).filter(CarrierProfile.id == submission_in.carrier_id).first()
    if not carrier and submission_in.carrier_name:
        carrier = db.query(CarrierProfile).filter(CarrierProfile.name == submission_in.carrier_name).first()
        if not carrier:
            carrier = CarrierProfile(
                id=str(uuid.uuid4()),
                name=submission_in.carrier_name,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(carrier)
            db.commit()
            db.refresh(carrier)
    if not carrier:
        # Default to first available or create general carrier
        carrier = db.query(CarrierProfile).first()
        if not carrier:
            carrier = CarrierProfile(
                id=str(uuid.uuid4()),
                name="General Reinsurance Partner",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(carrier)
            db.commit()
            db.refresh(carrier)

    # Calculate initial risk score & tier
    score, tier, _, _ = calculate_risk_score({
        "limit_requested": submission_in.limit_requested,
        "attachment_point": submission_in.attachment_point,
        "loss_history_count": submission_in.loss_history_count,
        "total_incurred_losses": submission_in.total_incurred_losses,
        "risk_type": normalized_risk_type,
        "mfa_enforced": submission_in.mfa_enforced,
        "prior_breach_history": submission_in.prior_breach_history,
        "security_audit_score": submission_in.security_audit_score,
        "audited_financials_available": submission_in.audited_financials_available,
        "governance_rating": submission_in.governance_rating,
        "financial_rating": submission_in.financial_rating,
        "industry_sector": submission_in.industry_sector,
    })

    sub_id = str(uuid.uuid4())
    submission = ReinsuranceSubmission(
        id=sub_id,
        carrier_id=carrier.id,
        risk_type=normalized_risk_type,
        insured_name=submission_in.insured_name,
        industry_sector=submission_in.industry_sector,
        revenue_tier=submission_in.revenue_tier,
        limit_requested=submission_in.limit_requested,
        attachment_point=submission_in.attachment_point,
        retention=submission_in.retention,
        effective_date=submission_in.effective_date,
        expiry_date=submission_in.expiry_date,
        loss_history_count=submission_in.loss_history_count or 0,
        total_incurred_losses=submission_in.total_incurred_losses or 0.0,
        mfa_enforced=submission_in.mfa_enforced,
        prior_breach_history=submission_in.prior_breach_history,
        security_audit_score=submission_in.security_audit_score,
        audited_financials_available=submission_in.audited_financials_available,
        governance_rating=submission_in.governance_rating,
        financial_rating=submission_in.financial_rating,
        risk_score=score,
        risk_tier=tier,
        status="PENDING",
        notes=submission_in.notes,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Evaluate and sync checklist
    evaluate_and_sync_checklist(db, submission)
    db.commit()

    # Re-fetch with eager loaded relationships
    submission = (
        db.query(ReinsuranceSubmission)
        .options(
            joinedload(ReinsuranceSubmission.carrier),
            joinedload(ReinsuranceSubmission.documents),
            joinedload(ReinsuranceSubmission.missing_info_flags),
            joinedload(ReinsuranceSubmission.decisions),
        )
        .filter(ReinsuranceSubmission.id == sub_id)
        .first()
    )
    return submission


@router.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(
    carrier_id: Optional[str] = None,
    risk_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
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

    if carrier_id:
        query = query.filter(ReinsuranceSubmission.carrier_id == carrier_id)
    if risk_type:
        rt = risk_type.strip().upper()
        if "CYBER" in rt:
            query = query.filter(ReinsuranceSubmission.risk_type == "CYBER")
        elif "D" in rt and "O" in rt:
            query = query.filter(ReinsuranceSubmission.risk_type == "D_AND_O")
        else:
            query = query.filter(ReinsuranceSubmission.risk_type == rt)
    if status_filter:
        query = query.filter(ReinsuranceSubmission.status == status_filter.upper())

    return query.order_by(ReinsuranceSubmission.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(
    submission_id: str,
    db: Session = Depends(get_db),
):
    submission = (
        db.query(ReinsuranceSubmission)
        .options(
            joinedload(ReinsuranceSubmission.carrier),
            joinedload(ReinsuranceSubmission.documents),
            joinedload(ReinsuranceSubmission.missing_info_flags),
            joinedload(ReinsuranceSubmission.decisions),
        )
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{submission_id}' not found.",
        )
    return submission


@router.patch("/submissions/{submission_id}", response_model=SubmissionResponse)
def update_submission(
    submission_id: str,
    update_in: SubmissionUpdate,
    db: Session = Depends(get_db),
):
    submission = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{submission_id}' not found.",
        )

    update_data = update_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(submission, field, val)

    # Recompute risk score
    score, tier, _, _ = calculate_risk_score({
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
    submission.risk_score = score
    submission.risk_tier = tier
    submission.updated_at = datetime.now(timezone.utc)

    db.commit()
    evaluate_and_sync_checklist(db, submission)
    db.commit()

    return get_submission(submission_id, db)


# -------------------------------------------------------------
# Attachments
# -------------------------------------------------------------
@router.post("/submissions/{submission_id}/attachments", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def add_attachment(
    submission_id: str,
    doc_in: DocumentCreate,
    db: Session = Depends(get_db),
):
    submission = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{submission_id}' not found.",
        )

    doc = SubmissionDocument(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        document_type=doc_in.document_type,
        file_name=doc_in.file_name,
        file_path=doc_in.file_path or f"/documents/{doc_in.file_name}",
        file_size_bytes=doc_in.file_size_bytes or 1024,
        created_at=datetime.now(timezone.utc),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Re-evaluate checklist now that a document was registered
    evaluate_and_sync_checklist(db, submission)
    db.commit()

    return doc


@router.get("/submissions/{submission_id}/attachments", response_model=List[DocumentResponse])
def list_attachments(
    submission_id: str,
    db: Session = Depends(get_db),
):
    submission = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{submission_id}' not found.",
        )
    return db.query(SubmissionDocument).filter(SubmissionDocument.submission_id == submission_id).all()
