from typing import Dict, Any, List, Tuple


def calculate_risk_score(data: Dict[str, Any]) -> Tuple[int, str, List[Dict[str, Any]], str]:
    """
    Evaluates risk factors and returns:
    (score: int, tier: str, factors: list[dict], explanation: str)
    """
    score = 50
    factors: List[Dict[str, Any]] = []

    # 1. Limit & Attachment Exposure
    limit = float(data.get("limit_requested") or 0.0)
    attachment = float(data.get("attachment_point") or 0.0)

    if limit >= 20_000_000:
        score += 15
        factors.append({
            "name": "Catastrophic Limit Exposure",
            "score_impact": 15,
            "category": "LIMITS",
            "description": f"Requested limit of ${limit:,.0f} exceeds $20M maximum standard layer threshold.",
        })
    elif limit >= 10_000_000:
        score += 10
        factors.append({
            "name": "High Limit Request",
            "score_impact": 10,
            "category": "LIMITS",
            "description": f"Requested limit of ${limit:,.0f} is high-capacity tier.",
        })
    elif limit <= 3_000_000:
        score -= 10
        factors.append({
            "name": "Moderate Limit Exposure",
            "score_impact": -10,
            "category": "LIMITS",
            "description": f"Requested limit of ${limit:,.0f} is within standard automated appetite.",
        })

    # Attachment Ratio
    if limit > 0:
        ratio = attachment / limit
        if ratio < 0.25:
            score += 10
            factors.append({
                "name": "Low Attachment Point Buffer",
                "score_impact": 10,
                "category": "ATTACHMENT",
                "description": f"Attachment point ${attachment:,.0f} is low relative to requested capacity (ratio: {ratio:.2f}).",
            })
        elif ratio >= 0.75:
            score -= 10
            factors.append({
                "name": "High Excess Attachment Buffer",
                "score_impact": -10,
                "category": "ATTACHMENT",
                "description": f"Substantial primary layer retention (${attachment:,.0f}) buffers facultative layer.",
            })

    # 2. Loss History
    loss_count = int(data.get("loss_history_count") or 0)
    total_losses = float(data.get("total_incurred_losses") or 0.0)

    if loss_count == 0:
        score -= 15
        factors.append({
            "name": "Clean Historical Loss Experience",
            "score_impact": -15,
            "category": "LOSS_HISTORY",
            "description": "Zero reported claims or loss history in recent 3-year experience period.",
        })
    elif loss_count in (1, 2):
        score += 10
        factors.append({
            "name": "Moderate Loss Frequency",
            "score_impact": 10,
            "category": "LOSS_HISTORY",
            "description": f"{loss_count} prior claims recorded with total incurred losses of ${total_losses:,.0f}.",
        })
    else:
        score += 25
        factors.append({
            "name": "Adverse Claim Frequency",
            "score_impact": 25,
            "category": "LOSS_HISTORY",
            "description": f"{loss_count} multiple loss events incurred (${total_losses:,.0f} total).",
        })

    if total_losses >= 1_000_000:
        score += 15
        factors.append({
            "name": "Severe Claim Severity",
            "score_impact": 15,
            "category": "LOSS_HISTORY",
            "description": f"High aggregate incurred loss amount (${total_losses:,.0f}) exceeds $1M severity threshold.",
        })

    # 3. Risk-Type Specific Scoring
    risk_type = str(data.get("risk_type", "")).upper()
    if risk_type in ("CYBER", "CYBER_RISK"):
        mfa = data.get("mfa_enforced", True)
        if mfa is False:
            score += 25
            factors.append({
                "name": "Missing Enterprise MFA Controls",
                "score_impact": 25,
                "category": "SECURITY_CONTROLS",
                "description": "Multi-Factor Authentication (MFA) is not enforced across all critical administrative and remote access points.",
            })
        else:
            score -= 10
            factors.append({
                "name": "Enforced MFA Controls",
                "score_impact": -10,
                "category": "SECURITY_CONTROLS",
                "description": "Mandatory enterprise MFA active across remote access, email, and privileged identity accounts.",
            })

        breach = data.get("prior_breach_history", False)
        if breach:
            score += 20
            factors.append({
                "name": "Prior Ransomware / Breach History",
                "score_impact": 20,
                "category": "SECURITY_CONTROLS",
                "description": "Applicant experienced previous cyber security breach or ransomware intrusion.",
            })
        else:
            score -= 10
            factors.append({
                "name": "No Prior Cyber Breaches",
                "score_impact": -10,
                "category": "SECURITY_CONTROLS",
                "description": "No prior data compromise, ransomware incident, or major network security breaches.",
            })

        audit_score = int(data.get("security_audit_score") or 75)
        if audit_score < 50:
            score += 15
            factors.append({
                "name": "Deficient Security Posture Score",
                "score_impact": 15,
                "category": "AUDIT",
                "description": f"Security posture audit score of {audit_score}/100 indicates vulnerabilities and gaps.",
            })
        elif audit_score >= 80:
            score -= 15
            factors.append({
                "name": "Superior Cyber Security Hygiene",
                "score_impact": -15,
                "category": "AUDIT",
                "description": f"Strong SOC2 / ISO-27001 audit posture score of {audit_score}/100.",
            })

    elif risk_type in ("D_AND_O", "D&O", "DIRECTORS_AND_OFFICERS"):
        financials = data.get("audited_financials_available", True)
        if financials is False:
            score += 25
            factors.append({
                "name": "Missing Audited Financial Disclosures",
                "score_impact": 25,
                "category": "FINANCIALS",
                "description": "Applicant has not provided 3-year GAAP/IFRS audited financial statements.",
            })
        else:
            score -= 10
            factors.append({
                "name": "Verified Audited Financials",
                "score_impact": -10,
                "category": "FINANCIALS",
                "description": "3-year audited financial records verified by tier-1 accounting firm.",
            })

        gov = str(data.get("governance_rating") or "GOOD").upper()
        if gov in ("POOR", "WEAK"):
            score += 25
            factors.append({
                "name": "Substandard Board Governance Rating",
                "score_impact": 25,
                "category": "GOVERNANCE",
                "description": "Board oversight, committee independence, and compliance structures rated poor.",
            })
        elif gov in ("EXCELLENT", "STRONG"):
            score -= 15
            factors.append({
                "name": "Exemplary Board Governance",
                "score_impact": -15,
                "category": "GOVERNANCE",
                "description": "Independent audit committee and robust corporate governance controls.",
            })

    # 4. Industry Sector Rating
    sector = str(data.get("industry_sector") or "").lower()
    high_risk_sectors = ["biotechnology", "cryptocurrency", "financial technology", "healthcare", "aerospace"]
    if any(s in sector for s in high_risk_sectors):
        score += 10
        factors.append({
            "name": "High Volatility Industry Sector",
            "score_impact": 10,
            "category": "INDUSTRY",
            "description": f"Industry sector '{data.get('industry_sector')}' exhibits heightened litigation and exposure volatility.",
        })

    # Clamp between 5 and 98
    score = max(5, min(98, score))

    if score <= 40:
        tier = "LOW"
        explanation = "Low underwriting risk. Submission exhibits strong risk mitigations, clean loss history, and standard limits."
    elif score <= 65:
        tier = "MEDIUM"
        explanation = "Moderate underwriting risk. Submission is within acceptable risk appetite subject to standard underwriting review."
    elif score <= 80:
        tier = "HIGH"
        explanation = "Elevated underwriting risk. Submission requires senior underwriter review and tailored subjectivity terms."
    else:
        tier = "CRITICAL"
        explanation = "Critical risk profile. Significant risk indicators present; recommend strict subjectivities or formal declination."

    return score, tier, factors, explanation
