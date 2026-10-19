def test_create_cyber_submission_success(client):
    # AC: Carrier Submission Portal - Carrier submits Cyber facultative request
    payload = {
        "carrier_name": "Apex Insurance Co.",
        "risk_type": "CYBER",
        "insured_name": "SecureCloud Inc",
        "industry_sector": "Technology",
        "revenue_tier": "$50M - $100M",
        "limit_requested": 10000000.0,
        "attachment_point": 5000000.0,
        "retention": 1000000.0,
        "effective_date": "2026-06-01",
        "expiry_date": "2027-06-01",
        "loss_history_count": 0,
        "total_incurred_losses": 0.0,
        "mfa_enforced": True,
        "prior_breach_history": False,
        "security_audit_score": 90,
        "notes": "Fast growing cloud infrastructure provider.",
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "SecureCloud Inc"
    assert data["risk_type"] == "CYBER"
    assert data["risk_score"] > 0
    assert data["status"] == "PENDING"
    assert "missing_info_flags" in data
    assert len(data["missing_info_flags"]) > 0


def test_create_d_and_o_submission_success(client):
    # AC: Carrier Submission Portal - Carrier submits D&O facultative request
    payload = {
        "carrier_name": "Hartford Global Casualty",
        "risk_type": "D_AND_O",
        "insured_name": "NexGen Biotech Corp",
        "industry_sector": "Biotechnology",
        "revenue_tier": "$25M - $50M",
        "limit_requested": 5000000.0,
        "attachment_point": 2000000.0,
        "retention": 500000.0,
        "effective_date": "2026-09-01",
        "expiry_date": "2027-09-01",
        "loss_history_count": 0,
        "total_incurred_losses": 0.0,
        "audited_financials_available": True,
        "governance_rating": "EXCELLENT",
        "financial_rating": "A",
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "NexGen Biotech Corp"
    assert data["risk_type"] == "D_AND_O"
    assert data["status"] == "PENDING"


def test_create_submission_invalid_risk_type(client):
    # AC: Carrier Submission Portal - Invalid risk type is rejected with 400
    payload = {
        "risk_type": "PROPERTY_CASUALTY",
        "insured_name": "General Warehousing",
        "industry_sector": "Real Estate",
        "revenue_tier": "$10M",
        "limit_requested": 1000000.0,
        "attachment_point": 500000.0,
        "retention": 100000.0,
        "effective_date": "2026-01-01",
        "expiry_date": "2027-01-01",
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 400
    assert "Invalid risk type" in response.json()["detail"]


def test_create_submission_missing_required_fields(client):
    # AC: Carrier Submission Portal - Missing mandatory fields returns 422
    payload = {
        "risk_type": "CYBER",
        # missing insured_name, limit_requested, etc.
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 422


def test_get_submission_by_id(client):
    # AC: Underwriter Review Queue - Retrieve submission details by UUID
    response = client.get("/api/v1/submissions/s1111111-1111-1111-1111-111111111111")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "s1111111-1111-1111-1111-111111111111"
    assert data["insured_name"] == "Fintech Cloud Holdings Inc"
    assert len(data["documents"]) >= 1


def test_get_submission_not_found(client):
    # AC: Underwriter Review Queue - Non-existent ID returns 404
    response = client.get("/api/v1/submissions/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_list_submissions_filtering(client):
    # AC: Underwriter Review Queue - List and filter submissions
    resp_all = client.get("/api/v1/submissions")
    assert resp_all.status_code == 200
    assert len(resp_all.json()) >= 3

    resp_cyber = client.get("/api/v1/submissions?risk_type=CYBER")
    assert resp_cyber.status_code == 200
    assert all(s["risk_type"] == "CYBER" for s in resp_cyber.json())

    resp_d_and_o = client.get("/api/v1/submissions?risk_type=D_AND_O")
    assert resp_d_and_o.status_code == 200
    assert all(s["risk_type"] == "D_AND_O" for s in resp_d_and_o.json())

    resp_pending = client.get("/api/v1/submissions?status=PENDING")
    assert resp_pending.status_code == 200
    assert all(s["status"] == "PENDING" for s in resp_pending.json())


def test_patch_submission_updates_score(client):
    # AC: Underwriter Review Queue - Update submission recalculates score
    patch_payload = {
        "mfa_enforced": False,
        "prior_breach_history": True,
        "security_audit_score": 40,
    }
    response = client.patch(
        "/api/v1/submissions/s1111111-1111-1111-1111-111111111111",
        json=patch_payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] > 80
    assert data["risk_tier"] == "CRITICAL"


def test_add_and_list_attachment(client):
    # AC: Missing Info & Attachments - Register document attachment metadata
    doc_payload = {
        "document_type": "External Vulnerability Assessment",
        "file_name": "fintech_cloud_pentest_2026.pdf",
        "file_path": "/documents/fintech_cloud_pentest_2026.pdf",
        "file_size_bytes": 2048576,
    }
    response = client.post(
        "/api/v1/submissions/s1111111-1111-1111-1111-111111111111/attachments",
        json=doc_payload,
    )
    assert response.status_code == 201
    doc_data = response.json()
    assert doc_data["document_type"] == "External Vulnerability Assessment"

    list_resp = client.get(
        "/api/v1/submissions/s1111111-1111-1111-1111-111111111111/attachments"
    )
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 2


def test_carrier_endpoints(client):
    # AC: Carrier Profiles - List and create carriers
    get_resp = client.get("/api/v1/carriers")
    assert get_resp.status_code == 200
    assert len(get_resp.json()) >= 3

    post_resp = client.post("/api/v1/carriers", json={
        "name": "Liberty Mutual Treaty",
        "rating": "A+",
        "contact_email": "facultative@libertymutual.com",
        "phone": "+1-800-555-9988",
        "headquarters": "Boston, MA",
    })
    assert post_resp.status_code == 201
    assert post_resp.json()["name"] == "Liberty Mutual Treaty"
