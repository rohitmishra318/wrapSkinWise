import numpy as np
import cv2

class ZoneMapper:
    def compute_zone_scores(self, img_bgr, zone_masks, detections):
        zone_scores = {}
        for zone, mask in zone_masks.items():
            area = np.sum(mask > 0)
            if area == 0:
                zone_scores[zone] = {"score": 0, "condition": "clear"}
                continue
                
            zone_count = 0
            for det in detections:
                x1, y1, x2, y2 = det["bbox"]
                cx, cy = (x1+x2)//2, (y1+y2)//2
                if cy < mask.shape[0] and cx < mask.shape[1] and mask[cy, cx] > 0:
                    zone_count += 1
                    
            if zone_count == 0:
                cond = "clear"
                score = 0
            elif zone_count <= 2:
                cond = "mild"
                score = 3
            elif zone_count <= 5:
                cond = "moderate"
                score = 6
            else:
                cond = "severe"
                score = 9
                
            zone_scores[zone] = {"score": score, "condition": cond}
            
        return zone_scores
