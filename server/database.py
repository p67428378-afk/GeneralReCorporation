import os
import uuid
from datetime import datetime, timezone
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    # Truncate to 72 bytes for bcrypt compatibility
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


def init_db():
    from server import models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import (
        User,
        CarrierProfile,
        ReinsuranceSubmission,
        SubmissionDocument,
        MissingInfoFlag,
        UnderwritingDecision,
    )

    # 1. Seed Users
    users_to_seed = [
        {
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "Test Underwriter",
            "role": "underwriter",
        },
        {
            "email": "admin@example.com",
            "password": "adminpassword",
            "full_name": "Senior Admin Underwriter",
            "role": "admin",
        },
        {
            "email": "carrier@apexinsurance.com",
            "password": "testpassword",
            "full_name": "Apex Carrier Rep",
            "role": "carrier",
        },
    ]

    for u_data in users_to_seed:
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            new_user = User(
                id=str(uuid.uuid4()),
                email=u_data["email"],
                hashed_password=get_password_hash(u_data["password"]),
                full_name=u_data["full_name"],
                role=u_data["role"],
                is_active=True,
                is_verified=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(new_user)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

    # 2. Seed Carrier Profiles
    carriers_to_seed = [
        {
            "id": "c1111111-1111-1111-1111-111111111111",
            "name": "Apex Insurance Co.",
            "rating": "A+",
            "contact_email": "submissions@apexinsurance.com",
            "phone": "+1-800-555-0199",
            "headquarters": "Hartford, CT",
        },
        {
            "id": "c2222222-2222-2222-2222-222222222222",
            "name": "Aegis Mutual Underwriters",
            "rating": "A",
            "contact_email": "reinsurance@aegismutual.com",
            "phone": "+1-800-555-0144",
            "headquarters": "New York, NY",
        },
        {
            "id": "c3333333-3333-3333-3333-333333333333",
            "name": "Hartford Global Casualty",
            "rating": "A++",
            "contact_email": "treaty@hartfordglobal.com",
            "phone": "+1-800-555-0188",
            "headquarters": "Boston, MA",
        },
    ]

    for c_data in carriers_to_seed:
        existing_c = db.query(CarrierProfile).filter(CarrierProfile.id == c_data["id"]).first()
        if not existing_c:
            carrier = CarrierProfile(
                id=c_data["id"],
                name=c_data["name"],
                rating=c_data["rating"],
                contact_email=c_data["contact_email"],
                phone=c_data["phone"],
                headquarters=c_data["headquarters"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(carrier)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

    # 3. Seed Sample Submissions if table is empty
    submission_count = db.query(ReinsuranceSubmission).count()
    if submission_count == 0:
        sub1_id = "s1111111-1111-1111-1111-111111111111"
        sub1 = ReinsuranceSubmission(
            id=sub1_id,
            carrier_id="c1111111-1111-1111-1111-111111111111",
            risk_type="CYBER",
            insured_name="Fintech Cloud Holdings Inc",
            industry_sector="Financial Technology",
            revenue_tier="$100M - $500M",
            limit_requested=10000000.0,
            attachment_point=5000000.0,
            retention=1000000.0,
            effective_date="2026-06-01",
            expiry_date="2027-06-01",
            loss_history_count=1,
            total_incurred_losses=250000.0,
            mfa_enforced=True,
            prior_breach_history=True,
            security_audit_score=82,
            financial_rating="A",
            risk_score=74,
            risk_tier="HIGH",
            status="PENDING",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(sub1)

        sub2_id = "s2222222-2222-2222-2222-222222222222"
        sub2 = ReinsuranceSubmission(
            id=sub2_id,
            carrier_id="c2222222-2222-2222-2222-222222222222",
            risk_type="D_AND_O",
            insured_name="Apex BioPharma Therapeutics",
            industry_sector="Biotechnology",
            revenue_tier="$50M - $100M",
            limit_requested=5000000.0,
            attachment_point=2000000.0,
            retention=500000.0,
            effective_date="2026-07-01",
            expiry_date="2027-07-01",
            loss_history_count=0,
            total_incurred_losses=0.0,
            audited_financials_available=True,
            governance_rating="EXCELLENT",
            financial_rating="A+",
            risk_score=35,
            risk_tier="LOW",
            status="QUOTED",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(sub2)

        sub3_id = "s3333333-3333-3333-3333-333333333333"
        sub3 = ReinsuranceSubmission(
            id=sub3_id,
            carrier_id="c3333333-3333-3333-3333-333333333333",
            risk_type="CYBER",
            insured_name="Global Logistics Network Corp",
            industry_sector="Transportation & Logistics",
            revenue_tier="$500M+",
            limit_requested=15000000.0,
            attachment_point=10000000.0,
            retention=2500000.0,
            effective_date="2026-08-01",
            expiry_date="2027-08-01",
            loss_history_count=3,
            total_incurred_losses=1800000.0,
            mfa_enforced=False,
            prior_breach_history=True,
            security_audit_score=48,
            financial_rating="BBB",
            risk_score=88,
            risk_tier="CRITICAL",
            status="DECLINED",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(sub3)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()

        # Seed Documents
        doc1 = SubmissionDocument(
            id=str(uuid.uuid4()),
            submission_id=sub1_id,
            document_type="Security Audit Report",
            file_name="fintech_cloud_soc2_audit.pdf",
            file_path="/documents/fintech_cloud_soc2_audit.pdf",
            file_size_bytes=1048576,
            created_at=datetime.now(timezone.utc),
        )
        db.add(doc1)

        # Seed Missing Info Flags
        flag1 = MissingInfoFlag(
            id=str(uuid.uuid4()),
            submission_id=sub1_id,
            flag_type="DOCUMENT",
            field_or_doc_name="External Vulnerability Assessment",
            description="Submissions with requested limits >= $5M require external vulnerability penetration test report.",
            is_resolved=False,
            created_at=datetime.now(timezone.utc),
        )
        db.add(flag1)

        # Seed Decision for sub2 (Quoted)
        dec2 = UnderwritingDecision(
            id=str(uuid.uuid4()),
            submission_id=sub2_id,
            decision_type="QUOTE",
            premium_amount=125000.0,
            capacity_offered=5000000.0,
            deductible_retention=500000.0,
            subjectivities="Receipt of updated litigation questionnaire prior to inception",
            expiration_date="2026-07-15",
            decline_reason_code=None,
            underwriter_id="test@example.com",
            notes="Strong board governance and zero claim history support quoting full requested layer.",
            created_at=datetime.now(timezone.utc),
        )
        db.add(dec2)

        # Seed Decision for sub3 (Declined)
        dec3 = UnderwritingDecision(
            id=str(uuid.uuid4()),
            submission_id=sub3_id,
            decision_type="DECLINE",
            premium_amount=None,
            capacity_offered=None,
            deductible_retention=None,
            subjectivities=None,
            expiration_date=None,
            decline_reason_code="HIGH_RISK_SCORE",
            underwriter_id="test@example.com",
            notes="Critical risk score due to lacking MFA enforcement and frequent ransomware losses.",
            created_at=datetime.now(timezone.utc),
        )
        db.add(dec3)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
