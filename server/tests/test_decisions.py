def test_record_quote_decision_success(client):
    # AC: Quote & Decline Decision Recording - Record binding quote decision
    sub_id = "s1111111-1111-1111-1111-111111111111"
    payload = {
        "submission_id": sub_id,
        "premium_amount": 85000.0,
        "capacity_offered": 10000000.0,
        "deductible_retention": 1000000.0,
        "subjectivities": "Receipt of updated external vulnerability scan within 14 days of binding",
        "expiration_date": "2026-06-30",
        "underwriter_id": "test@example.com",
        "notes": "Approved with subjectivity regarding MFA enforcement verification.",
    }
    response = client.post("/api/v1/decisions/quote", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["decision_type"] == "QUOTE"
    assert data["premium_amount"] == 85000.0
    assert data["capacity_offered"] == 10000000.0

    # Verify submission status transitioned to QUOTED
    sub_resp = client.get(f"/api/v1/submissions/{sub_id}")
    assert sub_resp.status_code == 200
    assert sub_resp.json()["status"] == "QUOTED"


def test_record_quote_decision_invalid_terms(client):
    # AC: Quote & Decline Decision Recording - Non-positive premium is rejected
    sub_id = "s1111111-1111-1111-1111-111111111111"
    payload = {
        "submission_id": sub_id,
        "premium_amount": -500.0,
        "capacity_offered": 10000000.0,
        "deductible_retention": 1000000.0,
    }
    response = client.post("/api/v1/decisions/quote", json=payload)
    assert response.status_code == 422


def test_record_quote_submission_not_found(client):
    # AC: Quote & Decline Decision Recording - 404 for unknown submission ID
    payload = {
        "submission_id": "00000000-0000-0000-0000-000000000000",
        "premium_amount": 50000.0,
        "capacity_offered": 5000000.0,
        "deductible_retention": 500000.0,
    }
    response = client.post("/api/v1/decisions/quote", json=payload)
    assert response.status_code == 404


def test_record_decline_decision_success(client):
    # AC: Quote & Decline Decision Recording - Record declination with reason code
    sub_id = "s1111111-1111-1111-1111-111111111111"
    payload = {
        "submission_id": sub_id,
        "decline_reason_code": "OUT_OF_APPETITE",
        "underwriter_id": "test@example.com",
        "notes": "Risk exceeds current appetite for critical sector without endpoint isolation.",
    }
    response = client.post("/api/v1/decisions/decline", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["decision_type"] == "DECLINE"
    assert data["decline_reason_code"] == "OUT_OF_APPETITE"

    # Verify submission status transitioned to DECLINED
    sub_resp = client.get(f"/api/v1/submissions/{sub_id}")
    assert sub_resp.status_code == 200
    assert sub_resp.json()["status"] == "DECLINED"


def test_record_decline_decision_missing_reason(client):
    # AC: Quote & Decline Decision Recording - Empty reason code is rejected
    sub_id = "s1111111-1111-1111-1111-111111111111"
    payload = {
        "submission_id": sub_id,
        "decline_reason_code": "",
    }
    response = client.post("/api/v1/decisions/decline", json=payload)
    assert response.status_code == 422


def test_get_decisions_for_submission(client):
    # AC: Quote & Decline Decision Recording - Audit trail endpoint for submission
    sub_id = "s2222222-2222-2222-2222-222222222222"
    response = client.get(f"/api/v1/decisions/{sub_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["decision_type"] == "QUOTE"


def test_list_all_decisions(client):
    # AC: Quote & Decline Decision Recording - List all decision records
    response = client.get("/api/v1/decisions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
