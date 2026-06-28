import pytest

@pytest.fixture
def mock_raw_clear():
    return {
        "acne": {"label": "Low", "count": 0, "totalArea": 0},
        "blackheads": {"count": 0},
        "wrinkles": {"label": "Low", "edge_density": 0.005},
        "pigmentation": {"label": "Low", "count": 100}
    }

@pytest.fixture
def mock_raw_severe():
    return {
        "acne": {"label": "High", "count": 20, "totalArea": 5000},
        "blackheads": {"count": 15},
        "wrinkles": {"label": "Visible", "edge_density": 0.05},
        "pigmentation": {"label": "High", "count": 3000}
    }
