class SeverityScorer:
    MAX_COUNTS = {
        "acne": 80,
        "blackheads": 50,
        "pigmentation": 4000,
    }

    def normalize_score(self, value, max_value):
        if value <= 0:
            return 0
        return min(100, int((value / max_value) * 100))

    def wrinkles_to_score(self, edge_density):
        if edge_density <= 0.01:
            return 10
        elif edge_density <= 0.03:
            return 30
        elif edge_density <= 0.05:
            return 60
        else:
            return 85

    def generate_recommendations(self, r):
        recs = []
        
        # Note: in app.py 'raw' structure: 
        # acne is {"label": "...", "count": X, ...}
        # blackheads is {"present": bool, "count": X}
        # wrinkles is {"label": "...", "edge_density": X}
        # pigmentation is {"label": "...", "score": X, "count": X}

        acne_label = r["acne"].get("label", "Low")
        if acne_label == "High" or acne_label == "severe" or acne_label == "very_severe":
            recs.append("🔴 High acne: Salicylic Acid, Niacinamide, Retinol.")
        elif acne_label == "Moderate" or acne_label == "moderate" or acne_label == "mild":
            recs.append("🟠 Moderate acne: Gentle cleanser + Aloe Vera.")
        else:
            recs.append("🟢 Acne under control.")
            
        pig_label = r["pigmentation"].get("label", "Low")
        if pig_label != "Low":
            recs.append("🟤 Pigmentation: Vitamin C + SPF 50.")
            
        wr_label = r["wrinkles"].get("label", "Low")
        if wr_label == "Visible":
            recs.append("🧓 Wrinkles: Retinol + Hyaluronic Acid.")
            
        recs.append("💧 Hydration, sleep 7–8 hrs, avoid smoking.")
        return "\n\n".join(recs)

    def compute(self, raw, fitzpatrick):
        acne_count = raw["acne"].get("count", 0)
        
        # Original logic for overall score & IGA
        if acne_count == 0:
            sev = "clear"
            iga = 0
            base = 90
        elif acne_count <= 3:
            sev = "mild"
            iga = 1
            base = 75
        elif acne_count <= 10:
            sev = "moderate"
            iga = 2
            base = 60
        elif acne_count <= 25:
            sev = "severe"
            iga = 3
            base = 40
        else:
            sev = "very_severe"
            iga = 4
            base = 20
            
        penalty = 0
        if raw["wrinkles"].get("edge_density", 0) > 0.04: penalty += 5
        if raw["pigmentation"].get("count", 0) > 2000: penalty += 5  # increased threshold due to area logic
        if raw["blackheads"].get("count", 0) > 10: penalty += 5
        
        overall = max(0, min(100, base - penalty))
        
        # New normalization logic from app2
        severity_normalized = {
            "acne": self.normalize_score(acne_count, self.MAX_COUNTS["acne"]),
            "blackheads": self.normalize_score(raw["blackheads"].get("count", 0), self.MAX_COUNTS["blackheads"]),
            "pigmentation": self.normalize_score(raw["pigmentation"].get("count", 0), self.MAX_COUNTS["pigmentation"]),
            "wrinkles": self.wrinkles_to_score(raw["wrinkles"].get("edge_density", 0))
        }
        
        recommendations = self.generate_recommendations(raw)
        
        return severity_normalized, overall, iga, recommendations
