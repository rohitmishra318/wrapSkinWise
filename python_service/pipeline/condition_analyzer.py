import cv2
import numpy as np

class ConditionAnalyzer:
    def detect_blackheads(self, face_rgb, mask):
        gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)
        clahe = cv2.createCLAHE(2.0, (8,8))
        gray = clahe.apply(gray)
        blur = cv2.GaussianBlur(gray, (5,5), 0)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9,9))
        blackhat = cv2.morphologyEx(blur, cv2.MORPH_BLACKHAT, kernel)
        thresh = cv2.adaptiveThreshold(blackhat, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        thresh = cv2.bitwise_and(thresh, thresh, mask=mask)
        contours,_ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        count = 0
        for c in contours:
            area = cv2.contourArea(c)
            if 5 < area < 40:
                peri = cv2.arcLength(c, True)
                if peri == 0: continue
                circ = 4*np.pi*area/(peri*peri)
                if circ > 0.6: count += 1
        return {"present": count > 5, "count": count}

    def detect_wrinkles(self, face_rgb, mask):
        gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)
        clahe = cv2.createCLAHE(2.0, (8,8))
        gray = clahe.apply(gray)
        gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        mag = cv2.magnitude(gx, gy)
        mag = cv2.normalize(mag, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1,5))
        mag = cv2.morphologyEx(mag, cv2.MORPH_OPEN, kernel)
        mag = cv2.bitwise_and(mag, mag, mask=mask)
        skin_vals = mag[mask > 0]
        if skin_vals.size == 0: return {"label": "Low", "edge_density": 0.0}
        thr = np.percentile(skin_vals, 92)
        wrinkle_pixels = mag > thr
        density = np.sum(wrinkle_pixels) / np.sum(mask > 0)
        label = "Visible" if density > 0.025 else "Low"
        return {"label": label, "edge_density": float(round(density, 4))}

    def detect_pigmentation(self, face_rgb, final_skin_mask):
        lab = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        skin_l = l[final_skin_mask > 0]
        if skin_l.size == 0: return {"label": "Low", "score": 0.0, "count": 0}
        blur_l = cv2.GaussianBlur(l, (31, 31), 0)
        diff = blur_l.astype(np.int16) - l.astype(np.int16)
        edges = cv2.Canny(l, 80, 160)
        diff[edges > 0] = 0
        thr = np.percentile(diff[final_skin_mask > 0], 90)
        pig_mask = (diff > thr) & (final_skin_mask > 0)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        pig_mask = cv2.morphologyEx(pig_mask.astype(np.uint8)*255, cv2.MORPH_OPEN, kernel)
        pig_mask = cv2.morphologyEx(pig_mask, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(pig_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_area = 0
        for c in contours:
            area = cv2.contourArea(c)
            if 200 < area < 5000:
                valid_area += area
        skin_area = np.sum(final_skin_mask > 0)
        score = valid_area / skin_area if skin_area > 0 else 0
        if score > 0.08: label = "High"
        elif score > 0.035: label = "Moderate"
        else: label = "Low"
        return {"label": label, "score": round(float(score), 4), "count": int(valid_area)}
        
    def analyze(self, img_bgr, skin_mask, zone_masks):
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        bh = self.detect_blackheads(img_rgb, skin_mask)
        wr = self.detect_wrinkles(img_rgb, skin_mask)
        pg = self.detect_pigmentation(img_rgb, skin_mask)
        
        # Original app.py also expects hydration, we can just return a placeholder as app2 didn't have it
        hy = {"hydrationScore": 50, "status": "Normal"}
        
        return bh, wr, pg, hy
