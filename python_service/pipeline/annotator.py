import cv2
import numpy as np

class Annotator:
    def draw(self, img_bgr, detections, zone_masks):
        out = img_bgr.copy()
        
        colors = {
            'tZone': (255, 0, 0),
            'leftCheek': (0, 255, 0),
            'rightCheek': (0, 0, 255),
            'forehead': (255, 255, 0),
            'perioral': (0, 255, 255)
        }
        
        for zone, mask in zone_masks.items():
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(out, contours, -1, colors.get(zone, (255,255,255)), 1)
            
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            conf = det["confidence"]
            cv2.rectangle(out, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(out, f"{conf:.2f}", (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1)
            
            seg_mask = det.get("segmentation_mask")
            if seg_mask is not None:
                colored_mask = np.zeros_like(out)
                colored_mask[seg_mask > 0] = (0, 0, 255)
                cv2.addWeighted(colored_mask, 0.3, out, 1.0, 0, out)
                
        return cv2.imencode('.png', out)[1].tobytes()
