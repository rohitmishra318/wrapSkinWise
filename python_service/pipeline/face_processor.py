import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import cv2
import numpy as np

class FaceProcessor:
    def __init__(self):
        # Resolve path to face_landmarker.task (which is in the parent directory of 'pipeline')
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "face_landmarker.task")
        
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.FaceLandmarkerOptions(base_options=base_options, num_faces=1)
        self.face_landmarker = vision.FaceLandmarker.create_from_options(options)
        
        self.ZONE_LANDMARKS = {
            'tZone': [1, 2, 3, 4, 5, 6, 168, 195, 197, 419, 9, 8, 107, 336, 151, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18],
            'leftCheek': [116, 117, 118, 119, 120, 121, 126, 142, 203, 206, 207, 213],
            'rightCheek': [345, 346, 347, 348, 349, 350, 355, 371, 423, 426, 427, 433],
            'forehead': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379],
            'perioral': [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
        }
        
        # Additional lists for creating the skin mask (from app2.py)
        self.LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        self.RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.LIPS = [61,146,91,181,84,17,314,405,321,375,291,308,324,318,402,317,14,87,178,88,95]
        self.LEFT_EYEBROW = [70,63,105,66,107,55,65,52]
        self.RIGHT_EYEBROW = [336,296,334,293,300,285,295,282]
        self.FACE_OUTLINE = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109]

    def order_points_clockwise(self, points):
        pts = np.array(points)
        if len(pts) == 0:
            return pts
        center = pts.mean(axis=0)
        angles = np.arctan2(pts[:,1] - center[1], pts[:,0] - center[0])
        return pts[np.argsort(angles)]

    def extract_mesh(self, img_bgr):
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        result = self.face_landmarker.detect(mp_image)
        
        if not result.face_landmarks:
            return None, None, None, None
            
        landmarks = result.face_landmarks[0]
        h, w = img_bgr.shape[:2]
        
        # Calculate face bbox
        xs = [l.x * w for l in landmarks]
        ys = [l.y * h for l in landmarks]
        
        # apply margin as in app2.py
        margin = 20
        x_min = max(min(xs) - margin, 0)
        y_min = max(min(ys) - margin, 0)
        x_max = min(max(xs) + margin, w)
        y_max = min(max(ys) + margin, h)
        face_bbox = [int(x_min), int(y_min), int(x_max), int(y_max)]
        
        # Create full skin mask (excluding eyes, lips, eyebrows)
        mask = np.ones((h, w), dtype=np.uint8) * 255
        ignore = np.zeros((h, w), dtype=np.uint8)

        def remove(indices):
            pts = []
            for i in indices:
                if i < len(landmarks):
                    x = int(landmarks[i].x * w)
                    y = int(landmarks[i].y * h)
                    pts.append([x, y])
            if pts:
                pts = self.order_points_clockwise(pts)
                cv2.fillPoly(ignore, [np.array(pts, np.int32)], 255)

        remove(self.LEFT_EYE)
        remove(self.RIGHT_EYE)
        remove(self.LIPS)
        remove(self.LEFT_EYEBROW)
        remove(self.RIGHT_EYEBROW)

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        ignore = cv2.dilate(ignore, kernel, iterations=1)
        mask[ignore > 0] = 0
        
        # Create face outline mask
        pts_outline = []
        for i in self.FACE_OUTLINE:
            if i < len(landmarks):
                x = int(landmarks[i].x * w)
                y = int(landmarks[i].y * h)
                pts_outline.append([x, y])
        
        face_outline_mask = np.zeros((h, w), dtype=np.uint8)
        if pts_outline:
            pts_outline = self.order_points_clockwise(pts_outline)
            cv2.fillPoly(face_outline_mask, [np.array(pts_outline, np.int32)], 255)
            
        final_skin_mask = cv2.bitwise_and(mask, face_outline_mask)

        # Create zone masks
        zone_masks = {}
        for zone, indices in self.ZONE_LANDMARKS.items():
            z_mask = np.zeros((h, w), dtype=np.uint8)
            pts = []
            for idx in indices:
                if idx < len(landmarks):
                    x = int(landmarks[idx].x * w)
                    y = int(landmarks[idx].y * h)
                    pts.append([x, y])
            if pts:
                pts = np.array(pts, dtype=np.int32)
                hull = cv2.convexHull(pts)
                cv2.fillConvexPoly(z_mask, hull, 255)
                
                # Intersect zone mask with final skin mask to avoid eyes/lips within zones
                z_mask = cv2.bitwise_and(z_mask, final_skin_mask)
            zone_masks[zone] = z_mask

        return landmarks, face_bbox, final_skin_mask, zone_masks
