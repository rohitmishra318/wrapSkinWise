class SeverityScorer:
    def compute(self, raw, fitzpatrick):
        acne_count = raw["acne"]["count"]
        
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
        if raw["wrinkles"]["edgeDensity"] > 0.04: penalty += 5
        if raw["pigmentation"]["count"] > 20: penalty += 5
        if raw["blackheads"]["count"] > 10: penalty += 5
        
        overall = max(0, min(100, base - penalty))
        
        return sev, overall, iga
