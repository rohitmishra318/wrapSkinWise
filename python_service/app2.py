import sys
import io
from pathlib import Path
from flask import Flask, request, jsonify
from PIL import Image

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

import torch

app = Flask(__name__)

# ================== CONFIG / MODELS ==================
MODEL_PATH = "face_landmarker.task"

base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(base_options=base_options, num_faces=1)
face_landmarker = vision.FaceLandmarker.create_from_options(options)


# ---------------- Normalization Config ----------------
MAX_COUNTS = {
    "acne": 80,
    "blackheads": 50,
    "pigmentation": 4000,
}

def normalize_score(value, max_value):
    if value <= 0:
        return 0
    return min(100, int((value / max_value) * 100))

def wrinkles_to_score(edge_density):
    if edge_density <= 0.01:
        return 10
    elif edge_density <= 0.03:
        return 30
    elif edge_density <= 0.05:
        return 60
    else:
        return 85



# landmarks used for masks
LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
LIPS = [61,146,91,181,84,17,314,405,321,375,291,308,324,318,402,317,14,87,178,88,95]
LEFT_EYEBROW = [70,63,105,66,107,55,65,52]
RIGHT_EYEBROW = [336,296,334,293,300,285,295,282]
FACE_OUTLINE = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109]

# optional YOLO
YOLO_ROOT = Path(__file__).parent / "yolo"
sys.path.insert(0, str(YOLO_ROOT))
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
yolo_model = None
nms_fn = None
try:
    weights = YOLO_ROOT / "best.pt"
    if weights.exists():
        from yolo.models.experimental import attempt_load
        from yolo.utils.general import non_max_suppression
        yolo_model = attempt_load(str(weights), map_location=DEVICE)
        yolo_model.eval()
        nms_fn = non_max_suppression
        print("YOLO loaded for acne detection")
    else:
        print("YOLO weights not found; using color-based acne detection")
except Exception as e:
    print("YOLO load failed; using color-based detection:", e)


# ---------------- utilities
def read_image(file_storage):
    image = Image.open(io.BytesIO(file_storage.read())).convert("RGB")
    return np.array(image)


def order_points_clockwise(points):
    pts = np.array(points)
    center = pts.mean(axis=0)
    angles = np.arctan2(pts[:,1] - center[1], pts[:,0] - center[0])
    return pts[np.argsort(angles)]


def landmarks_to_face_space(landmarks, x1, y1, w, h):
    face_landmarks = []
    for lm in landmarks:
        px = int(lm.x * w) - x1
        py = int(lm.y * h) - y1
        face_landmarks.append((px, py))
    return face_landmarks


def get_face_bbox(landmarks, w, h, margin=20):
    xs = [int(l.x * w) for l in landmarks]
    ys = [int(l.y * h) for l in landmarks]
    x_min = max(min(xs) - margin, 0)
    y_min = max(min(ys) - margin, 0)
    x_max = min(max(xs) + margin, w)
    y_max = min(max(ys) + margin, h)
    return x_min, y_min, x_max, y_max


def create_face_outline_mask(face_landmarks, h, w):
    
    pts = [face_landmarks[i] for i in FACE_OUTLINE]
    pts = order_points_clockwise(pts)
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask, [np.array(pts, np.int32)], 255)
    return mask


def create_skin_mask_from_landmarks(face_landmarks, h, w):
    mask = np.ones((h, w), dtype=np.uint8) * 255
    ignore = np.zeros((h, w), dtype=np.uint8)

    def remove(indices):
        pts = [face_landmarks[i] for i in indices]
        pts = order_points_clockwise(pts)
        cv2.fillPoly(ignore, [np.array(pts, np.int32)], 255)

    for region in [LEFT_EYE, RIGHT_EYE, LIPS, LEFT_EYEBROW, RIGHT_EYEBROW]:
        remove(region)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    ignore = cv2.dilate(ignore, kernel, iterations=1)
    mask[ignore > 0] = 0
    return mask


# ---------------- detection helpers
def detect_acne_with_color(face_rgb, mask):
    hsv = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2HSV)
    red = (
        cv2.inRange(hsv, (0, 60, 60), (10, 255, 255)) +
        cv2.inRange(hsv, (170, 60, 60), (180, 255, 255))
    )
    red = cv2.bitwise_and(red, red, mask=mask)
    contours, _ = cv2.findContours(red, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    count = sum(1 for c in contours if 25 < cv2.contourArea(c) < 250)
    label = "High" if count > 15 else "Moderate" if count > 5 else "Low"
    return {"label": label, "count": int(count)}


def detect_acne_with_yolo(face_bgr, face_rgb, face_h, face_w):
    img = cv2.resize(face_rgb, (640, 640))
    img = img.transpose(2, 0, 1)
    img = np.ascontiguousarray(img)
    img = torch.from_numpy(img).float().to(DEVICE)
    img /= 255.0
    img = img.unsqueeze(0)
    with torch.no_grad():
        pred = yolo_model(img)[0]
    detections = nms_fn(pred, conf_thres=0.15, iou_thres=0.45)[0]
    if detections is None:
        return {"label": "Low", "count": 0}
    detections = detections.cpu().numpy()
    count = 0
    for det in detections:
        x1d, y1d, x2d, y2d, conf, cls = det[:6]
        if conf < 0.15:
            continue
        count += 1
        cv2.rectangle(
            face_bgr,
            (int(x1d * face_w / 640), int(y1d * face_h / 640)),
            (int(x2d * face_w / 640), int(y2d * face_h / 640)),
            (0, 0, 255),
            1,
        )
    label = "High" if count > 15 else "Moderate" if count > 5 else "Low"
    return {"label": label, "count": int(count)}


def detect_blackheads(face_rgb, mask):
    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)

    # 1. Contrast enhancement
    clahe = cv2.createCLAHE(2.0, (8,8))
    gray = clahe.apply(gray)

    # 2. Blur
    blur = cv2.GaussianBlur(gray, (5,5), 0)

    # 3. Blackhat (dark spot extraction)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9,9))
    blackhat = cv2.morphologyEx(blur, cv2.MORPH_BLACKHAT, kernel)

    # 4. Adaptive threshold
    thresh = cv2.adaptiveThreshold(
        blackhat, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11, 2
    )

    thresh = cv2.bitwise_and(thresh, thresh, mask=mask)

    contours,_ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    count = 0
    for c in contours:
        area = cv2.contourArea(c)
        if 5 < area < 40:
            peri = cv2.arcLength(c, True)
            if peri == 0:
                continue
            circ = 4*np.pi*area/(peri*peri)
            if circ > 0.6:
                count += 1

    return {
        "present": count > 5,
        "count": count
    }



def detect_wrinkles(face_rgb, mask):
    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)

    # 1. Contrast enhancement
    clahe = cv2.createCLAHE(2.0, (8,8))
    gray = clahe.apply(gray)

    # 2. Gradient magnitude (wrinkle strength)
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    mag = cv2.magnitude(gx, gy)
    mag = cv2.normalize(mag, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

    # 3. Remove pores (keep lines)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1,5))
    mag = cv2.morphologyEx(mag, cv2.MORPH_OPEN, kernel)

    mag = cv2.bitwise_and(mag, mag, mask=mask)

    skin_vals = mag[mask > 0]
    if skin_vals.size == 0:
        return {"label": "Low", "edge_density": 0.0}

    # 4. Adaptive threshold
    thr = np.percentile(skin_vals, 92)
    wrinkle_pixels = mag > thr

    density = np.sum(wrinkle_pixels) / np.sum(mask > 0)

    label = "Visible" if density > 0.025 else "Low"

    return {
        "label": label,
        "edge_density": float(round(density, 4))
    }



def detect_pigmentation(face_rgb, final_skin_mask):
    # 1. Convert to LAB
    lab = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)

    skin_l = l[final_skin_mask > 0]
    if skin_l.size == 0:
        return {"label": "Low", "score": 0.0}

    # 2. Smooth illumination (remove shadows)
    blur_l = cv2.GaussianBlur(l, (31, 31), 0)

    # 3. Relative darkness (local, not global)
    diff = blur_l.astype(np.int16) - l.astype(np.int16)

    # 4. Suppress edges / wrinkles
    edges = cv2.Canny(l, 80, 160)
    diff[edges > 0] = 0

    # 5. Threshold relative darkness
    thr = np.percentile(diff[final_skin_mask > 0], 90)
    pig_mask = (diff > thr) & (final_skin_mask > 0)

    # 6. Morphology cleanup
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    pig_mask = cv2.morphologyEx(pig_mask.astype(np.uint8)*255, cv2.MORPH_OPEN, kernel)
    pig_mask = cv2.morphologyEx(pig_mask, cv2.MORPH_CLOSE, kernel)

    # 7. Region filtering
    contours, _ = cv2.findContours(pig_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    valid_area = 0
    for c in contours:
        area = cv2.contourArea(c)
        if 200 < area < 5000:  # ignore tiny noise & full-face shadow
            valid_area += area

    # 8. Normalize score
    skin_area = np.sum(final_skin_mask > 0)
    score = valid_area / skin_area if skin_area > 0 else 0

    # 9. Severity mapping (stable)
    if score > 0.08:
        label = "High"
    elif score > 0.035:
        label = "Moderate"
    else:
        label = "Low"

    return {
        "label": label,
        "score": round(float(score), 4)
    }



def generate_recommendations(r):
    recs = []
    if r["acne"]["label"] == "High":
        recs.append("🔴 High acne: Salicylic Acid, Niacinamide, Retinol.")
    elif r["acne"]["label"] == "Moderate":
        recs.append("🟠 Moderate acne: Gentle cleanser + Aloe Vera.")
    else:
        recs.append("🟢 Acne under control.")
    if r["pigmentation"]["label"] != "Low":
        recs.append("🟤 Pigmentation: Vitamin C + SPF 50.")
    if r["wrinkles"]["label"] == "Visible":
        recs.append("🧓 Wrinkles: Retinol + Hyaluronic Acid.")
    recs.append("💧 Hydration, sleep 7–8 hrs, avoid smoking.")
    return "\n\n".join(recs)


# ---------------- API ----------------
@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'Image missing'}), 400
    file = request.files['image']
    image = read_image(file)
    h, w, _ = image.shape

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image)
    result = face_landmarker.detect(mp_image)

    if not result.face_landmarks:
        analysis = {
            'acne': {'label': 'Low', 'count': 0},
            'blackheads': {'present': False, 'count': 0},
            'wrinkles': {'label': 'Low', 'edge_density': 0.0},
            'pigmentation': {'label': 'Low', 'count': 0},
            'recommendations': 'No face detected.',
            'modelVersion': 'mediapipe-tasks-v1'
        }
        return jsonify(analysis)

    landmarks = result.face_landmarks[0]
    x1, y1, x2, y2 = get_face_bbox(landmarks, w, h)
    face_rgb = image[y1:y2, x1:x2]
    face_bgr = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2BGR)

    if face_rgb.size == 0 or face_bgr.size == 0:
        return jsonify({'error': 'Invalid face crop'}), 500

    face_h, face_w, _ = face_rgb.shape
    face_landmarks = landmarks_to_face_space(landmarks, x1, y1, w, h)

    mask = create_skin_mask_from_landmarks(face_landmarks, face_h, face_w)
    face_outline_mask = create_face_outline_mask(face_landmarks, face_h, face_w)
    final_skin_mask = cv2.bitwise_and(mask, face_outline_mask)

    if yolo_model is not None and nms_fn is not None:
        acne = detect_acne_with_yolo(face_bgr, face_rgb, face_h, face_w)
        model_version = 'mediapipe-tasks-v1+yolov7'
    else:
        acne = detect_acne_with_color(face_rgb, mask)
        model_version = 'mediapipe-tasks-v1'

    blackheads = detect_blackheads(face_rgb, mask)
    wrinkles = detect_wrinkles(face_rgb, mask)
    pigmentation = detect_pigmentation(face_rgb, final_skin_mask)


    acne_score = normalize_score(acne.get("count", 0), MAX_COUNTS["acne"])
    blackhead_score = normalize_score(blackheads.get("count", 0), MAX_COUNTS["blackheads"])
    pigmentation_score = normalize_score(pigmentation.get("count", 0), MAX_COUNTS["pigmentation"])
    wrinkle_score = wrinkles_to_score(wrinkles.get("edge_density", 0))
    


    severity = {
    "acne": acne_score,
    "blackheads": blackhead_score,
    "wrinkles": wrinkle_score,
    "pigmentation": pigmentation_score,
    }

    analysis = {
        "raw": {
        "acne": acne,
        "blackheads": blackheads,
        "wrinkles": wrinkles,
        "pigmentation": pigmentation,
    },
        'severity': severity,
        'recommendations': generate_recommendations({
            'acne': acne,
            'blackheads': blackheads,
            'wrinkles': wrinkles,
            'pigmentation': pigmentation,
        }),
        'modelVersion': model_version
    }
    print(analysis)
    return jsonify(analysis)


if __name__ == '__main__':
    app.run(port=7000, host='0.0.0.0', debug=True)
