import cv2
import numpy as np
import mediapipe as mp

class QualityGate:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)

    def check(self, img_bgr):
        height, width = img_bgr.shape[:2]
        total_area = height * width
        
        result = {
            "passed": True,
            "qualityScore": 100,
            "flags": [],
            "needsSR": False,
            "faceDetected": False,
            "faceBbox": None
        }

        # 1. Face detection
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        detection_results = self.face_detection.process(img_rgb)

        if not detection_results or not detection_results.detections:
            result["passed"] = False
            result["flags"].append("NO_FACE")
            return result
        
        # Get best face
        best_detection = max(detection_results.detections, key=lambda d: d.score[0])
        bboxC = best_detection.location_data.relative_bounding_box
        x1 = int(bboxC.xmin * width)
        y1 = int(bboxC.ymin * height)
        box_w = int(bboxC.width * width)
        box_h = int(bboxC.height * height)
        x2 = x1 + box_w
        y2 = y1 + box_h
        
        result["faceDetected"] = True
        result["faceBbox"] = [x1, y1, x2, y2]

        face_area = box_w * box_h
        face_coverage = face_area / total_area if total_area > 0 else 0
        face_short_axis = min(box_w, box_h)

        # 2. Resolution check
        if min(height, width) < 720 or face_short_axis < 300:
            result["needsSR"] = True

        # 3. Blur check
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 80.0:
            result["passed"] = False
            result["flags"].append("BLUR")
            return result

        # 4. Face angle check
        confidence = best_detection.score[0]
        if confidence < 0.7:
            result["flags"].append("ANGLE")

        # 5. Lighting check
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l_channel = lab[:,:,0]
        l_mean = np.mean(l_channel)
        if l_mean < 80:
            result["flags"].append("LOW_LIGHT")
        elif l_mean > 220:
            result["flags"].append("OVEREXPOSED")

        # 6. Face coverage
        if face_coverage < 0.08:
            result["flags"].append("FACE_TOO_SMALL")

        # 7. Quality score
        sharpness_score = min(100, int((laplacian_var / 500) * 100)) * 0.4
        coverage_score = min(100, int((face_coverage / 0.4) * 100)) * 0.3
        lighting_score = (100 - abs(150 - l_mean)) * 0.2
        angle_score = (confidence * 100) * 0.1
        
        result["qualityScore"] = int(sharpness_score + coverage_score + lighting_score + angle_score)

        return result
