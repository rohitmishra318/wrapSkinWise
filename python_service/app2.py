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
    blur = cv2.GaussianBlur(gray, (7, 7), 0)
    _, thresh = cv2.threshold(blur, 55, 255, cv2.THRESH_BINARY_INV)
    thresh = cv2.bitwise_and(thresh, thresh, mask=mask)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    count = sum(1 for c in contours if 5 < cv2.contourArea(c) < 40)
    return {"present": count > 5, "count": int(count)}


def detect_wrinkles(face_rgb, mask):
    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 60, 160)
    edges = cv2.bitwise_and(edges, edges, mask=mask)
    density = np.sum(edges > 0) / np.sum(mask > 0) if np.sum(mask > 0) > 0 else 0.0
    label = "Visible" if density > 0.035 else "Low"
    return {"label": label, "edge_density": float(round(density, 4))}


def detect_pigmentation(face_rgb, final_skin_mask):
    lab = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2LAB)
    l, _, _ = cv2.split(lab)
    masked = l[final_skin_mask > 0]
    if masked.size == 0:
        return {"label": "Low", "count": 0}
    mean = np.mean(masked)
    std = np.std(masked)
    dark = (l < (mean - 1.0 * std)) & (final_skin_mask > 0)
    count = int(np.sum(dark))
    label = "High" if count > 3000 else "Moderate" if count > 1500 else "Low"
    return {"label": label, "count": int(count / 100)}


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

    analysis = {
        'acne': acne,
        'blackheads': blackheads,
        'wrinkles': wrinkles,
        'pigmentation': pigmentation,
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
