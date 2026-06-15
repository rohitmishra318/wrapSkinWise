import numpy as np
from ultralytics import YOLO

class AcneDetector:
    def __init__(self):
        try:
            self.model = YOLO('yolov8n-seg.pt')
        except:
            self.model = None

    def detect(self, img_bgr, skin_mask):
        if not self.model:
            return [], 0, 0
            
        results = self.model(img_bgr, conf=0.25, iou=0.45, imgsz=640)
        
        detections = []
        total_count = 0
        total_area = 0
        
        if len(results) > 0 and results[0].boxes:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            confs = results[0].boxes.conf.cpu().numpy()
            
            masks = None
            if results[0].masks:
                masks = results[0].masks.data.cpu().numpy()
                
            for i, box in enumerate(boxes):
                x1, y1, x2, y2 = map(int, box)
                cx, cy = (x1+x2)//2, (y1+y2)//2
                if cy < skin_mask.shape[0] and cx < skin_mask.shape[1] and skin_mask[cy, cx] > 0:
                    area = 0
                    seg_mask = None
                    if masks is not None and i < len(masks):
                        seg_mask = masks[i]
                        area = int(np.sum(seg_mask > 0))
                    else:
                        area = (x2-x1) * (y2-y1)
                        
                    detections.append({
                        "bbox": [x1, y1, x2, y2],
                        "confidence": float(confs[i]),
                        "area_px": area,
                        "segmentation_mask": seg_mask
                    })
                    total_count += 1
                    total_area += area
                    
        return detections, total_count, total_area
