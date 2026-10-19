from server.services.scoring_engine import calculate_risk_score
from server.services.checklist_service import evaluate_and_sync_checklist
from server.models import ReinsuranceSubmission, SubmissionDocument


def test_cyber_scoring_clean_vs_adverse():
    # AC: Automated Risk Scoring Engine - Cyber risk parameter scoring
    clean_cyber = {
        "limit_requested": 2_000_000.0,
        "attachment_point": 2_000_000.0,
        "loss_history_count": 0,
        "total_incurred_losses": 0.0,
        "risk_type": "CYBER",
        "mfa_enforced": True,
        "prior_breach_history": False,
        "security_audit_score": 95,
        "industry_sector": "Consumer Goods",
    }
    score_clean, tier_clean, factors_clean, exp_clean = calculate_risk_score(clean_cyber)
    assert score_clean <= 40
    assert tier_clean == "LOW"

    adverse_cyber = {
        "limit_requested": 25_000_000.0,
        "attachment_point": 1_000_000.0,
        "loss_history_count": 4,
        "total_incurred_losses": 3_500_000.0,
        "risk_type": "CYBER",
        "mfa_enforced": False,
        "prior_breach_history": True,
        "security_audit_score": 30,
        "industry_sector": "Financial Technology",
    }
    score_adv, tier_adv, factors_adv, exp_adv = calculate_risk_score(adverse_cyber)
    assert score_adv >= 80
    assert tier_adv == "CRITICAL"
    assert len(factors_adv) >= 5


def test_d_and_o_scoring_clean_vs_adverse():
    # AC: Automated Risk Scoring Engine - D&O risk parameter scoring
    clean_dno = {
        "limit_requested": 3_000_000.0,
        "attachment_point": 2_500_000.0,
        "loss_history_count": 0,
        "total_incurred_losses": 0.0,
        "risk_type": "D_AND_O",
        "audited_financials_available": True,
        "governance_rating": "EXCELLENT",
        "industry_sector": "Manufacturing",
    }
    score_clean, tier_clean, _, _ = calculate_risk_score(clean_dno)
    assert score_clean <= 40
    assert tier_clean == "LOW"

    adverse_dno = {
        "limit_requested": 25_000_000.0,
        "attachment_point": 1_000_000.0,
        "loss_history_count": 3,
        "total_incurred_losses": 2_000_000.0,
        "risk_type": "D_AND_O",
        "audited_financials_available": False,
        "governance_rating": "POOR",
        "industry_sector": "Biotechnology",
    }
    score_adv, tier_adv, _, _ = calculate_risk_score(adverse_dno)
    assert score_adv >= 80
    assert tier_adv == "CRITICAL"


def test_checklist_missing_docs_evaluation():
    # AC: Missing Information Identification - Document checklist logic
    submission = ReinsuranceSubmission(
        id="sub-test-checklist-1",
        carrier_id="c1",
        risk_type="CYBER",
        insured_name="Test Insured",
        industry_sector="Tech",
        revenue_tier="$10M",
        limit_requested=10_000_000.0,
        attachment_point=5_000_000.0,
        retention=500_000.0,
        effective_date="2026-01-01",
        expiry_date="2027-01-01",
        missing_info_flags=[],
        documents=[],
    )

    # In-memory mock evaluation without database commit
    from unittest.mock import MagicMock
    mock_db = MagicMock()
    flags = evaluate_and_sync_checklist(mock_db, submission)
    
    flag_names = [f.field_or_doc_name for f in flags]
    assert "Security Audit Report" in flag_names
    assert "Cyber Assessment Questionnaire" in flag_names
    assert "3-Year Loss History" in flag_names
    assert "External Vulnerability Assessment" in flag_names  # because limit >= 5M
