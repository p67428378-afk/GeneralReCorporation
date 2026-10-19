from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# Base & Config
# -------------------------------------------------------------
class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Carrier Profile Schemas
# -------------------------------------------------------------
class CarrierProfileBase(BaseModel):
    name: str
    rating: Optional[str] = "A"
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    headquarters: Optional[str] = None


class CarrierProfileCreate(CarrierProfileBase):
    pass


class CarrierProfileResponse(CarrierProfileBase, ORMBase):
    id: str
    created_at: datetime
    updated_at: datetime


# -------------------------------------------------------------
# Document Schemas
# -------------------------------------------------------------
class DocumentCreate(BaseModel):
    document_type: str
    file_name: str
    file_path: Optional[str] = None
    file_size_bytes: Optional[int] = 0


class DocumentResponse(ORMBase):
    id: str
    submission_id: str
    document_type: str
    file_name: str
    file_path: str
    file_size_bytes: int
    created_at: datetime


# -------------------------------------------------------------
# Missing Info Flag Schemas
# -------------------------------------------------------------
class MissingInfoFlagBase(BaseModel):
    flag_type: str = "DOCUMENT"
    field_or_doc_name: str
    description: str
    is_resolved: bool = False


class MissingInfoFlagCreate(MissingInfoFlagBase):
    pass


class MissingInfoFlagResponse(MissingInfoFlagBase, ORMBase):
    id: str
    submission_id: str
    created_at: datetime


class FlagResolveRequest(BaseModel):
    is_resolved: bool = True


# -------------------------------------------------------------
# Decision Schemas
# -------------------------------------------------------------
class QuoteDecisionCreate(BaseModel):
    submission_id: str
    premium_amount: float = Field(..., gt=0, description="Binding quote premium in USD")
    capacity_offered: float = Field(..., gt=0, description="Offered capacity limit in USD")
    deductible_retention: float = Field(..., ge=0, description="Deductible / retention in USD")
    subjectivities: Optional[str] = None
    expiration_date: Optional[str] = None
    underwriter_id: Optional[str] = "test@example.com"
    notes: Optional[str] = None


class DeclineDecisionCreate(BaseModel):
    submission_id: str
    decline_reason_code: str = Field(..., min_length=1, description="Standardized declination code")
    underwriter_id: Optional[str] = "test@example.com"
    notes: Optional[str] = None


class DecisionResponse(ORMBase):
    id: str
    submission_id: str
    decision_type: str
    premium_amount: Optional[float] = None
    capacity_offered: Optional[float] = None
    deductible_retention: Optional[float] = None
    subjectivities: Optional[str] = None
    expiration_date: Optional[str] = None
    decline_reason_code: Optional[str] = None
    underwriter_id: str
    notes: Optional[str] = None
    created_at: datetime


# -------------------------------------------------------------
# Reinsurance Submission Schemas
# -------------------------------------------------------------
class SubmissionCreate(BaseModel):
    carrier_id: Optional[str] = None
    carrier_name: Optional[str] = None
    risk_type: str = Field(..., description="CYBER or D_AND_O")
    insured_name: str = Field(..., min_length=1)
    industry_sector: str = Field(..., min_length=1)
    revenue_tier: str = Field(..., min_length=1)
    limit_requested: float = Field(..., gt=0)
    attachment_point: float = Field(..., ge=0)
    retention: float = Field(..., ge=0)
    effective_date: str = Field(..., min_length=1)
    expiry_date: str = Field(..., min_length=1)
    
    # Loss history
    loss_history_count: Optional[int] = 0
    total_incurred_losses: Optional[float] = 0.0
    
    # Risk factor attributes
    mfa_enforced: Optional[bool] = True
    prior_breach_history: Optional[bool] = False
    security_audit_score: Optional[int] = 75
    audited_financials_available: Optional[bool] = True
    governance_rating: Optional[str] = "GOOD"
    financial_rating: Optional[str] = "A"
    notes: Optional[str] = None


class SubmissionUpdate(BaseModel):
    insured_name: Optional[str] = None
    industry_sector: Optional[str] = None
    revenue_tier: Optional[str] = None
    limit_requested: Optional[float] = None
    attachment_point: Optional[float] = None
    retention: Optional[float] = None
    effective_date: Optional[str] = None
    expiry_date: Optional[str] = None
    loss_history_count: Optional[int] = None
    total_incurred_losses: Optional[float] = None
    mfa_enforced: Optional[bool] = None
    prior_breach_history: Optional[bool] = None
    security_audit_score: Optional[int] = None
    audited_financials_available: Optional[bool] = None
    governance_rating: Optional[str] = None
    financial_rating: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class SubmissionResponse(ORMBase):
    id: str
    carrier_id: str
    risk_type: str
    insured_name: str
    industry_sector: str
    revenue_tier: str
    limit_requested: float
    attachment_point: float
    retention: float
    effective_date: str
    expiry_date: str
    loss_history_count: int
    total_incurred_losses: float
    mfa_enforced: Optional[bool] = None
    prior_breach_history: Optional[bool] = None
    security_audit_score: Optional[int] = None
    audited_financials_available: Optional[bool] = None
    governance_rating: Optional[str] = None
    financial_rating: Optional[str] = None
    risk_score: int
    risk_tier: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    carrier: Optional[CarrierProfileResponse] = None
    documents: List[DocumentResponse] = []
    missing_info_flags: List[MissingInfoFlagResponse] = []
    decisions: List[DecisionResponse] = []


# -------------------------------------------------------------
# Scoring Breakdown Schemas
# -------------------------------------------------------------
class ScoreFactor(BaseModel):
    name: str
    score_impact: int
    category: str
    description: str


class ScoreBreakdownResponse(BaseModel):
    submission_id: str
    risk_score: int
    risk_tier: str
    scoring_factors: List[ScoreFactor]
    explanation: str


# -------------------------------------------------------------
# Checklist Schemas
# -------------------------------------------------------------
class ChecklistResponse(BaseModel):
    submission_id: str
    flags: List[MissingInfoFlagResponse]
    is_complete: bool
    total_flags: int
    unresolved_flags: int


# -------------------------------------------------------------
# KPI Schemas
# -------------------------------------------------------------
class UnderwritingKPIResponse(BaseModel):
    active_requests: int
    avg_risk_score: float
    missing_info_flags: int
    quoted_capacity: float
    total_submissions: int
