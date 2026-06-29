import sys
import os
import glob
from pathlib import Path

# Add yolo to path
YOLO_ROOT = Path(__file__).parent / "yolo"
sys.path.insert(0, str(YOLO_ROOT))

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import torch
from yolo.models.experimental import attempt_load
from yolo.utils.general import non_max_suppression

MODEL_PATH = "face_landmarker.task"
base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(base_options=base_options, num_faces=1)
face_landmarker = vision.FaceLandmarker.create_from_options(options)

# Face regions for mask extraction
LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
LEFT_EYEBROW = [70, 63, 105, 66, 107, 55, 65, 52]
RIGHT_EYEBROW = [336, 296, 334, 293, 300, 285, 295, 282]
FACE_OUTLINE = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

def order_points_clockwise(points):
    pts = np.array(points)
    center = pts.mean(axis=0)
    angles = np.arctan2(pts[:,1] - center[1], pts[:,0] - center[0])
    return pts[np.argsort(angles)]

def landmarks_to_face_space(landmarks, x1, y1, w, h):
    return [(int(lm.x * w) - x1, int(lm.y * h) - y1) for lm in landmarks]

def get_face_bbox(landmarks, w, h, margin=20):
    xs = [int(l.x * w) for l in landmarks]
    ys = [int(l.y * h) for l in landmarks]
    return max(min(xs) - margin, 0), max(min(ys) - margin, 0), min(max(xs) + margin, w), min(max(ys) + margin, h)

def create_face_outline_mask(face_landmarks, h, w):
    pts = order_points_clockwise([face_landmarks[i] for i in FACE_OUTLINE])
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask, [np.array(pts, np.int32)], 255)
    return mask

def create_skin_mask_from_landmarks(face_landmarks, h, w):
    mask = np.ones((h, w), dtype=np.uint8) * 255
    ignore = np.zeros((h, w), dtype=np.uint8)
    def remove(indices):
        pts = order_points_clockwise([face_landmarks[i] for i in indices])
        cv2.fillPoly(ignore, [np.array(pts, np.int32)], 255)
    for region in [LEFT_EYE, RIGHT_EYE, LIPS, LEFT_EYEBROW, RIGHT_EYEBROW]:
        remove(region)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    ignore = cv2.dilate(ignore, kernel, iterations=1)
    mask[ignore > 0] = 0
    return mask

def draw_ignored_regions(face_bgr, face_landmarks):
    overlay = face_bgr.copy()
    def draw_region(indices, color):
        pts = order_points_clockwise([face_landmarks[i] for i in indices])
        cv2.fillPoly(overlay, [np.array(pts, np.int32)], color)
    for region in [LEFT_EYE, RIGHT_EYE, LIPS, LEFT_EYEBROW, RIGHT_EYEBROW]:
        draw_region(region, (0, 255, 0))
    cv2.addWeighted(overlay, 0.45, face_bgr, 0.55, 0, face_bgr)

# Load YOLO model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
weights = YOLO_ROOT / "best.pt"
yolo_model = attempt_load(weights, map_location=device) if weights.exists() else None
if yolo_model:
    yolo_model.eval()
    print("YOLOv7 model loaded successfully")
else:
    print("YOLO weights not found. Skipping YOLO acne detection.")

input_dir = "imagetesting"
os.makedirs(input_dir, exist_ok=True)
# Find all image files
images = glob.glob(os.path.join(input_dir, "*.[pj][pn]*[g]")) 

if not images:
    print(f"No images found in {input_dir}. Please place some images there to test.")
    sys.exit(0)

for img_path in images:
    print(f"Processing {img_path}...")
    frame = cv2.imread(img_path)
    if frame is None:
        print(f"Failed to read {img_path}")
        continue
    
    # Resize frame if it's too large to fit on screen
    max_dim = 900
    h, w = frame.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        frame = cv2.resize(frame, (int(w * scale), int(h * scale)))
        h, w = frame.shape[:2]

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = face_landmarker.detect(mp_image)

    if not result.face_landmarks:
        print("No face detected.")
        cv2.imshow("Skin Analysis Output", frame)
        cv2.waitKey(0)
        continue

    full_landmarks = result.face_landmarks[0]
    x1, y1, x2, y2 = get_face_bbox(full_landmarks, w, h)
    
    face_landmarks = landmarks_to_face_space(full_landmarks, x1, y1, w, h)
    face_rgb = rgb[y1:y2, x1:x2]
    face_bgr = frame[y1:y2, x1:x2]
    face_h, face_w = face_rgb.shape[:2]
    
    if face_h <= 0 or face_w <= 0:
        continue

    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)

    # 1. YOLO Acne Detection
    acne_count = 0
    if yolo_model:
        img_tensor = cv2.resize(cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB), (640, 640))
        img_tensor = img_tensor.transpose(2, 0, 1)
        img_tensor = np.ascontiguousarray(img_tensor)
        img_tensor = torch.from_numpy(img_tensor).float().to(device) / 255.0
        img_tensor = img_tensor.unsqueeze(0)
        
        with torch.no_grad():
            pred = yolo_model(img_tensor)[0]
        detections = non_max_suppression(pred, conf_thres=0.15, iou_thres=0.45)[0]
        
        if detections is not None:
            for det in detections.cpu().numpy():
                x1d, y1d, x2d, y2d, conf, cls = det[:6]
                if conf >= 0.15:
                    acne_count += 1
                    cv2.rectangle(
                        face_bgr,
                        (int(x1d * face_w / 640), int(y1d * face_h / 640)),
                        (int(x2d * face_w / 640), int(y2d * face_h / 640)),
                        (0, 0, 255), 1
                    )

    # 2. Extract Skin Mask (ignoring eyes, lips, eyebrows)
    mask = create_skin_mask_from_landmarks(face_landmarks, face_h, face_w)
    draw_ignored_regions(face_bgr, face_landmarks)

    # 3. Blackheads
    blur = cv2.GaussianBlur(gray, (7, 7), 0)
    _, thresh = cv2.threshold(blur, 55, 255, cv2.THRESH_BINARY_INV)
    thresh = cv2.bitwise_and(thresh, thresh, mask=mask)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    blackhead_count = 0
    for c in contours:
        if 5 < cv2.contourArea(c) < 40:
            blackhead_count += 1
            (x, y), r = cv2.minEnclosingCircle(c)
            cv2.circle(face_bgr, (int(x), int(y)), int(r), (0, 0, 0), 1)

    # 4. Wrinkles
    edges = cv2.Canny(gray, 60, 160)
    edges = cv2.bitwise_and(edges, edges, mask=mask)
    overlay = face_bgr.copy()
    overlay[edges > 0] = [255, 0, 0]
    face_bgr[:] = cv2.addWeighted(overlay, 0.4, face_bgr, 0.6, 0)
    wrinkle_density = np.sum(edges > 0) / np.sum(mask > 0) if np.sum(mask > 0) > 0 else 0

    # 5. Pigmentation
    lab = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2LAB)
    l = cv2.split(lab)[0]
    skin_pixels = l[mask > 0]
    if skin_pixels.size > 0:
        mean, std = np.mean(skin_pixels), np.std(skin_pixels)
        face_outline_mask = create_face_outline_mask(face_landmarks, face_h, face_w)
        final_skin_mask = cv2.bitwise_and(mask, face_outline_mask)
        dark = (l < (mean - 1.0 * std)) & (final_skin_mask > 0)
        pig_overlay = face_bgr.copy()
        pig_overlay[dark] = [0, 255, 255]
        face_bgr[:] = cv2.addWeighted(pig_overlay, 0.35, face_bgr, 0.65, 0)

    # 6. Labels and Output
    acne_label = "High" if acne_count > 15 else "Moderate" if acne_count > 5 else "Low"
    wrinkle_label = "Visible" if wrinkle_density > 0.035 else "Low"

    cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)
    cv2.putText(frame, f"Acne: {acne_label} ({acne_count})", (x1, max(y1 - 10, 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2)
    cv2.putText(frame, f"Blackheads: {blackhead_count}", (x1, max(y1 - 35, 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,0), 2)
    cv2.putText(frame, f"Wrinkles: {wrinkle_label}", (x1, max(y1 - 60, 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,0,0), 2)

    cv2.imshow("Skin Analysis Output - Press any key for next", frame)
    print("Press any key on the image window to proceed to the next image (or close the window).")
    key = cv2.waitKey(0)
    if key == 27: # ESC key to break loop entirely
        break

cv2.destroyAllWindows()
