import pytest
from pipeline.severity_scorer import SeverityScorer

def test_recommendations_high_acne():
    scorer = SeverityScorer()
    raw = {
        "acne": {"label": "High"},
        "blackheads": {},
        "wrinkles": {},
        "pigmentation": {}
    }
    recs = scorer.generate_recommendations(raw)
    assert "Salicylic Acid" in recs or "dermatologist" in recs.lower()
    assert "Acne under control" not in recs

def test_recommendations_moderate_acne():
    scorer = SeverityScorer()
    raw = {
        "acne": {"label": "Moderate"},
        "blackheads": {},
        "wrinkles": {},
        "pigmentation": {}
    }
    recs = scorer.generate_recommendations(raw)
    assert "Moderate acne" in recs

def test_recommendations_pigmentation_and_wrinkles():
    scorer = SeverityScorer()
    raw = {
        "acne": {"label": "Low"},
        "blackheads": {},
        "wrinkles": {"label": "Visible"},
        "pigmentation": {"label": "High"}
    }
    recs = scorer.generate_recommendations(raw)
    assert "Vitamin C + SPF 50" in recs
    assert "Retinol + Hyaluronic Acid" in recs
