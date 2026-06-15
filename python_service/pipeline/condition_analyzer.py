import cv2
import numpy as np

class ConditionAnalyzer:
    def analyze(self, img_bgr, skin_mask, zone_masks):
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (7, 7), 0)
        _, thresh = cv2.threshold(blur, 55, 255, cv2.THRESH_BINARY_INV)
        thresh = cv2.bitwise_and(thresh, thresh, mask=skin_mask)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        bh_count = sum(1 for c in contours if 5 < cv2.contourArea(c) < 40)
        
        edges = cv2.Canny(gray, 60, 160)
        edges = cv2.bitwise_and(edges, edges, mask=skin_mask)
        density = float(np.sum(edges > 0) / np.sum(skin_mask > 0)) if np.sum(skin_mask > 0) > 0 else 0
        
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l, _, _ = cv2.split(lab)
        mean = np.mean(l[skin_mask > 0])
        std = np.std(l[skin_mask > 0])
        dark = (l < (mean - 1.2 * std)) & (skin_mask > 0)
        pg_count = int(np.sum(dark) / 100)
        uniformity = float(1.0 - (std / 128.0))
        
        texture_score = max(0.0, min(1.0, 1.0 - (density * 10)))
        
        return (
            {"count": bh_count},
            {"edgeDensity": round(density, 4)},
            {"count": pg_count, "uniformityScore": round(uniformity, 2)},
            {"textureScore": round(texture_score, 2)}
        )
