import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from server.models import ReinsuranceSubmission, MissingInfoFlag, SubmissionDocument


def evaluate_and_sync_checklist(db: Session, submission: ReinsuranceSubmission) -> List[MissingInfoFlag]:
    """
    Evaluates submission data and uploaded documents against underwriting checklists.
    Generates or resolves MissingInfoFlag records for the submission.
    """
    existing_flags = {f.field_or_doc_name: f for f in submission.missing_info_flags}
    existing_docs = {d.document_type.lower() for d in submission.documents}
    
    needed_rules: List[Dict[str, Any]] = []
    risk_type = (submission.risk_type or "").upper()

    # Common Field Rules
    if submission.retention is None or submission.retention <= 0:
        needed_rules.append({
            "flag_type": "FIELD",
            "field_or_doc_name": "Primary Retention Amount",
            "description": "Primary retention amount must be positive and non-zero.",
        })

    # Cyber Checklist Rules
    if risk_type in ("CYBER", "CYBER_RISK"):
        # Document checks
        needed_rules.append({
            "flag_type": "DOCUMENT",
            "field_or_doc_name": "Security Audit Report",
            "description": "SOC2, ISO27001, or equivalent third-party security posture assessment report.",
            "is_doc": True,
            "doc_types": ["security audit report", "security audit", "soc2 audit", "soc 2"],
        })
        needed_rules.append({
            "flag_type": "DOCUMENT",
            "field_or_doc_name": "Cyber Assessment Questionnaire",
            "description": "Completed and signed cyber underwriting assessment questionnaire.",
            "is_doc": True,
            "doc_types": ["cyber assessment questionnaire", "cyber questionnaire", "assessment questionnaire"],
        })
        needed_rules.append({
            "flag_type": "DOCUMENT",
            "field_or_doc_name": "3-Year Loss History",
            "description": "Certified 3-year loss history and claims experience runs from primary carrier.",
            "is_doc": True,
            "doc_types": ["3-year loss history", "loss history", "loss runs", "loss run report"],
        })
        if submission.limit_requested and submission.limit_requested >= 5_000_000:
            needed_rules.append({
                "flag_type": "DOCUMENT",
                "field_or_doc_name": "External Vulnerability Assessment",
                "description": "Submissions with requested limits >= $5M require external vulnerability penetration test report.",
                "is_doc": True,
                "doc_types": ["external vulnerability assessment", "vulnerability assessment", "penetration test"],
            })

    # D&O Checklist Rules
    elif risk_type in ("D_AND_O", "D&O", "DIRECTORS_AND_OFFICERS"):
        needed_rules.append({
            "flag_type": "DOCUMENT",
            "field_or_doc_name": "Audited Financial Statements (3 Years)",
            "description": "Audited financial statements (Balance Sheet, P&L, Cash Flow) for the past 3 fiscal years.",
            "is_doc": True,
            "doc_types": ["audited financial statements", "audited financials", "financial statements", "audited financial statements (3 years)"],
        })
        needed_rules.append({
            "flag_type": "DOCUMENT",
            "field_or_doc_name": "Directors & Officers Policy Copy",
            "description": "Copy of primary underlying D&O policy form and scheduled endorsements.",
            "is_doc": True,
            "doc_types": ["directors & officers policy copy", "policy copy", "underlying policy copy", "d&o policy copy"],
        })
        needed_rules.append({
            "flag_type": "DOCUMENT",
            "field_or_doc_name": "3-Year Loss History",
            "description": "Carrier-verified 3-year D&O loss and claims history summary.",
            "is_doc": True,
            "doc_types": ["3-year loss history", "loss history", "loss runs", "d&o loss history"],
        })
        if submission.limit_requested and submission.limit_requested >= 10_000_000:
            needed_rules.append({
                "flag_type": "DOCUMENT",
                "field_or_doc_name": "Board Governance & Litigation Questionnaire",
                "description": "Completed board structure and active/threatened litigation questionnaire for limits >= $10M.",
                "is_doc": True,
                "doc_types": ["board governance & litigation questionnaire", "litigation questionnaire", "governance questionnaire"],
            })

    # Evaluate each rule against uploaded documents and fields
    active_flags = []
    for rule in needed_rules:
        name = rule["field_or_doc_name"]
        is_missing = True
        
        if rule.get("is_doc"):
            # Check if any matching doc type is present
            doc_matches = any(dt in existing_docs for dt in rule["doc_types"])
            is_missing = not doc_matches
        
        if is_missing:
            if name in existing_flags:
                # Existing flag
                flag = existing_flags[name]
                flag.description = rule["description"]
                active_flags.append(flag)
            else:
                # Create new flag
                new_flag = MissingInfoFlag(
                    id=str(uuid.uuid4()),
                    submission_id=submission.id,
                    flag_type=rule["flag_type"],
                    field_or_doc_name=name,
                    description=rule["description"],
                    is_resolved=False,
                )
                db.add(new_flag)
                active_flags.append(new_flag)
        else:
            # If doc was uploaded, auto-resolve existing flag if present
            if name in existing_flags:
                existing_flags[name].is_resolved = True
                active_flags.append(existing_flags[name])

    return active_flags
