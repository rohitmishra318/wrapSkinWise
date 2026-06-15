import mediapipe as mp
import cv2
import numpy as np

class FaceProcessor:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        self.ZONE_LANDMARKS = {
            'tZone': [1, 2, 3, 4, 5, 6, 168, 195, 197, 419, 9, 8, 107, 336, 151, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18],
            'leftCheek': [116, 117, 118, 119, 120, 121, 126, 142, 203, 206, 207, 213],
            'rightCheek': [345, 346, 347, 348, 349, 350, 355, 371, 423, 426, 427, 433],
            'forehead': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379],
            'perioral': [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
        }

    def extract_mesh(self, img_bgr):
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(img_rgb)
        
        if not results.multi_face_landmarks:
            return None, None, None, None
            
        landmarks = results.multi_face_landmarks[0].landmark
        h, w = img_bgr.shape[:2]
        
        xs = [l.x * w for l in landmarks]
        ys = [l.y * h for l in landmarks]
        face_bbox = [int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))]
        
        skin_mask = np.ones((h, w), dtype=np.uint8) * 255
        
        LEFT_EYE = list(range(33, 133))
        RIGHT_EYE = list(range(362, 463))
        LIPS = list(range(61, 88))
        LEFT_EYEBROW = list(range(70, 107))
        RIGHT_EYEBROW = list(range(336, 377))
        
        def remove(indices):
            pts = []
            for idx in indices:
                if idx < len(landmarks):
                    x = int(landmarks[idx].x * w)
                    y = int(landmarks[idx].y * h)
                    pts.append([x, y])
            if pts:
                pts = np.array(pts, dtype=np.int32)
                cv2.fillPoly(skin_mask, [pts], 0)
                
        remove(LEFT_EYE)
        remove(RIGHT_EYE)
        remove(LIPS)
        remove(LEFT_EYEBROW)
        remove(RIGHT_EYEBROW)
        
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
            zone_masks[zone] = z_mask

        return landmarks, face_bbox, skin_mask, zone_masks
