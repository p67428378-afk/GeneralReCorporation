def test_get_underwriting_queue_sorting_and_filtering(client):
    # AC: Underwriter Review Queue - Triage queue with risk score prioritization
    response = client.get("/api/v1/underwriting/queue?sort_by=risk_score_desc")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 3
    # Check sorted descending
    scores = [item["risk_score"] for item in items]
    assert scores == sorted(scores, reverse=True)

    # Filter by risk_tier
    res_critical = client.get("/api/v1/underwriting/queue?risk_tier=CRITICAL")
    assert res_critical.status_code == 200
    for item in res_critical.json():
        assert item["risk_tier"] == "CRITICAL"


def test_get_score_breakdown(client):
    # AC: Automated Risk Scoring Engine - Scoring factors breakdown
    sub_id = "s1111111-1111-1111-1111-111111111111"
    response = client.get(f"/api/v1/underwriting/{sub_id}/score-breakdown")
    assert response.status_code == 200
    data = response.json()
    assert data["submission_id"] == sub_id
    assert "risk_score" in data
    assert "risk_tier" in data
    assert "scoring_factors" in data
    assert len(data["scoring_factors"]) > 0
    assert "explanation" in data


def test_get_score_breakdown_not_found(client):
    # AC: Automated Risk Scoring Engine - 404 for unknown submission
    response = client.get("/api/v1/underwriting/00000000-0000-0000-0000-000000000000/score-breakdown")
    assert response.status_code == 404


def test_get_submission_checklist(client):
    # AC: Missing Information Identification - Checklist evaluation
    sub_id = "s1111111-1111-1111-1111-111111111111"
    response = client.get(f"/api/v1/underwriting/{sub_id}/checklist")
    assert response.status_code == 200
    data = response.json()
    assert data["submission_id"] == sub_id
    assert "flags" in data
    assert "is_complete" in data
    assert data["total_flags"] >= 1


def test_resolve_checklist_flag(client):
    # AC: Missing Information Identification - Resolve flag
    sub_id = "s1111111-1111-1111-1111-111111111111"
    chk_resp = client.get(f"/api/v1/underwriting/{sub_id}/checklist")
    flags = chk_resp.json()["flags"]
    unresolved = [f for f in flags if not f["is_resolved"]]
    assert len(unresolved) > 0
    flag_id = unresolved[0]["id"]

    res_resp = client.post(
        f"/api/v1/underwriting/{sub_id}/checklist/{flag_id}/resolve",
        json={"is_resolved": True},
    )
    assert res_resp.status_code == 200
    assert res_resp.json()["is_resolved"] is True


def test_resolve_checklist_flag_not_found(client):
    # AC: Missing Information Identification - 404 on bad flag ID
    sub_id = "s1111111-1111-1111-1111-111111111111"
    response = client.post(
        f"/api/v1/underwriting/{sub_id}/checklist/bad-flag-id/resolve",
        json={"is_resolved": True},
    )
    assert response.status_code == 404


def test_underwriting_kpis(client):
    # AC: Underwriter Review Queue - Aggregate KPI metrics calculation
    response = client.get("/api/v1/underwriting/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "active_requests" in data
    assert "avg_risk_score" in data
    assert "missing_info_flags" in data
    assert "quoted_capacity" in data
    assert data["total_submissions"] >= 3
