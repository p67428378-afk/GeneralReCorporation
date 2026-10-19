import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="underwriter")
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)


class CarrierProfile(Base):
    __tablename__ = "carrier_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    rating = Column(String(50), nullable=True, default="A")
    contact_email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    headquarters = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    submissions = relationship("ReinsuranceSubmission", back_populates="carrier", cascade="all, delete-orphan")


class ReinsuranceSubmission(Base):
    __tablename__ = "reinsurance_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    carrier_id = Column(String(36), ForeignKey("carrier_profiles.id"), nullable=False, index=True)
    risk_type = Column(String(50), nullable=False, index=True)  # CYBER or D_AND_O
    insured_name = Column(String(255), nullable=False, index=True)
    industry_sector = Column(String(255), nullable=False)
    revenue_tier = Column(String(100), nullable=False)
    limit_requested = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    retention = Column(Float, nullable=False)
    effective_date = Column(String(50), nullable=False)
    expiry_date = Column(String(50), nullable=False)
    
    # Loss history parameters
    loss_history_count = Column(Integer, default=0, nullable=False)
    total_incurred_losses = Column(Float, default=0.0, nullable=False)
    
    # Risk factor attributes (Cyber & D&O)
    mfa_enforced = Column(Boolean, default=True, nullable=True)
    prior_breach_history = Column(Boolean, default=False, nullable=True)
    security_audit_score = Column(Integer, default=75, nullable=True)  # 0-100
    audited_financials_available = Column(Boolean, default=True, nullable=True)
    governance_rating = Column(String(50), default="GOOD", nullable=True)  # EXCELLENT, GOOD, FAIR, POOR
    financial_rating = Column(String(50), default="A", nullable=True)  # AAA, AA, A, BBB, BB, B
    
    # Automated Scoring & Triage
    risk_score = Column(Integer, default=50, nullable=False, index=True)  # 0-100
    risk_tier = Column(String(50), default="MEDIUM", nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), default="PENDING", nullable=False, index=True)  # PENDING, UNDER_REVIEW, QUOTED, DECLINED, INFO_REQUESTED
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    carrier = relationship("CarrierProfile", back_populates="submissions")
    documents = relationship("SubmissionDocument", back_populates="submission", cascade="all, delete-orphan")
    missing_info_flags = relationship("MissingInfoFlag", back_populates="submission", cascade="all, delete-orphan")
    decisions = relationship("UnderwritingDecision", back_populates="submission", cascade="all, delete-orphan")


class SubmissionDocument(Base):
    __tablename__ = "submission_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("reinsurance_submissions.id"), nullable=False, index=True)
    document_type = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="documents")


class MissingInfoFlag(Base):
    __tablename__ = "missing_info_flags"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("reinsurance_submissions.id"), nullable=False, index=True)
    flag_type = Column(String(50), default="DOCUMENT", nullable=False)  # DOCUMENT, FIELD, VERIFICATION
    field_or_doc_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="missing_info_flags")


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("reinsurance_submissions.id"), nullable=False, index=True)
    decision_type = Column(String(50), nullable=False)  # QUOTE or DECLINE
    premium_amount = Column(Float, nullable=True)
    capacity_offered = Column(Float, nullable=True)
    deductible_retention = Column(Float, nullable=True)
    subjectivities = Column(Text, nullable=True)
    expiration_date = Column(String(50), nullable=True)
    decline_reason_code = Column(String(100), nullable=True)  # OUT_OF_APPETITE, HIGH_RISK_SCORE, INADEQUATE_DATA, CAPACITY_EXHAUSTED, CLAIMS_HISTORY, OTHER
    underwriter_id = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="decisions")
