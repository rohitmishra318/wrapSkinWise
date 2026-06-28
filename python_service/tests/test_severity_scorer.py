import pytest
from pipeline.severity_scorer import SeverityScorer

def test_severity_scorer_clear(mock_raw_clear):
    scorer = SeverityScorer()
    sev_norm, overall, iga, recs = scorer.compute(mock_raw_clear, fitzpatrick=3)
    
    assert overall == 90
    assert iga == 0
    assert sev_norm["acne"] == 0
    assert "Acne under control" in recs

def test_severity_scorer_severe(mock_raw_severe):
    scorer = SeverityScorer()
    sev_norm, overall, iga, recs = scorer.compute(mock_raw_severe, fitzpatrick=3)
    
    # Base for severe (count 20) is 40.
    # Penalties: wrinkles > 0.04 (+5), pig > 2000 (+5), blackheads > 10 (+5). Total penalty = 15.
    # Overall = 40 - 15 = 25
    assert overall == 25
    assert iga == 3
    assert sev_norm["acne"] == 25  # 20 / 80 * 100
    assert "High acne: Salicylic Acid" in recs

def test_severity_scorer_mild_threshold():
    scorer = SeverityScorer()
    raw = {
        "acne": {"count": 3},
        "blackheads": {"count": 0},
        "wrinkles": {"edge_density": 0},
        "pigmentation": {"count": 0}
    }
    sev_norm, overall, iga, recs = scorer.compute(raw, 3)
    assert iga == 1
    assert overall == 75

def test_severity_scorer_moderate_threshold():
    scorer = SeverityScorer()
    raw = {
        "acne": {"count": 10},
        "blackheads": {"count": 0},
        "wrinkles": {"edge_density": 0},
        "pigmentation": {"count": 0}
    }
    sev_norm, overall, iga, recs = scorer.compute(raw, 3)
    assert iga == 2
    assert overall == 60

def test_severity_scorer_very_severe_threshold():
    scorer = SeverityScorer()
    raw = {
        "acne": {"count": 26},
        "blackheads": {"count": 0},
        "wrinkles": {"edge_density": 0},
        "pigmentation": {"count": 0}
    }
    sev_norm, overall, iga, recs = scorer.compute(raw, 3)
    assert iga == 4
    assert overall == 20
