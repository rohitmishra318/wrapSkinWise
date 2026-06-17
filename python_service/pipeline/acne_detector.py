import sys
import torch
import cv2
import numpy as np
from pathlib import Path

class AcneDetector:
    def __init__(self):
        self.DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.yolo_model = None
        self.nms_fn = None
        
        try:
            YOLO_ROOT = Path(__file__).parent.parent / "yolo"
            sys.path.insert(0, str(YOLO_ROOT))
            weights = YOLO_ROOT / "best.pt"
            
            if weights.exists():
                from yolo.models.experimental import attempt_load
                from yolo.utils.general import non_max_suppression
                self.yolo_model = attempt_load(str(weights), map_location=self.DEVICE)
                self.yolo_model.eval()
                self.nms_fn = non_max_suppression
                print("YOLO loaded for acne detection")
            else:
                print("YOLO weights not found; using color-based acne detection")
        except Exception as e:
            print("YOLO load failed; using color-based detection:", e)

    def detect(self, img_bgr, skin_mask):
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        face_h, face_w, _ = img_bgr.shape
        
        detections = []
        total_count = 0
        total_area = 0

        if self.yolo_model is not None and self.nms_fn is not None:
            # YOLO logic
            img = cv2.resize(img_rgb, (640, 640))
            img = img.transpose(2, 0, 1)
            img = np.ascontiguousarray(img)
            img = torch.from_numpy(img).float().to(self.DEVICE)
            img /= 255.0
            img = img.unsqueeze(0)
            
            with torch.no_grad():
                pred = self.yolo_model(img)[0]
            
            yolo_dets = self.nms_fn(pred, conf_thres=0.15, iou_thres=0.45)[0]
            if yolo_dets is not None:
                yolo_dets = yolo_dets.cpu().numpy()
                for det in yolo_dets:
                    x1d, y1d, x2d, y2d, conf, cls = det[:6]
                    if conf < 0.15:
                        continue
                    
                    x1 = int(x1d * face_w / 640)
                    y1 = int(y1d * face_h / 640)
                    x2 = int(x2d * face_w / 640)
                    y2 = int(y2d * face_h / 640)
                    
                    # Ensure within bounds
                    x1 = max(0, x1)
                    y1 = max(0, y1)
                    x2 = min(face_w, x2)
                    y2 = min(face_h, y2)
                    
                    cx, cy = (x1+x2)//2, (y1+y2)//2
                    if cy < face_h and cx < face_w and skin_mask[cy, cx] > 0:
                        area = (x2-x1) * (y2-y1)
                        detections.append({
                            "bbox": [x1, y1, x2, y2],
                            "confidence": float(conf),
                            "area_px": area,
                            "segmentation_mask": None
                        })
                        total_count += 1
                        total_area += area
        else:
            # Color-based fallback
            hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
            red = (
                cv2.inRange(hsv, (0, 60, 60), (10, 255, 255)) +
                cv2.inRange(hsv, (170, 60, 60), (180, 255, 255))
            )
            red = cv2.bitwise_and(red, red, mask=skin_mask)
            contours, _ = cv2.findContours(red, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for c in contours:
                area = cv2.contourArea(c)
                if 25 < area < 250:
                    x, y, w, h = cv2.boundingRect(c)
                    detections.append({
                        "bbox": [x, y, x+w, y+h],
                        "confidence": 0.5, # mock confidence
                        "area_px": int(area),
                        "segmentation_mask": None
                    })
                    total_count += 1
                    total_area += int(area)
                    
        return detections, total_count, total_area
