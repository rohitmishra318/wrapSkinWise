from flask import Flask, request, jsonify
import cv2
import numpy as np
from PIL import Image
import io
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

app = Flask(__name__)

# ---------------- MediaPipe Tasks Setup ----------------
MODEL_PATH = "face_landmarker.task"

base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    num_faces=1,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
)

face_landmarker = vision.FaceLandmarker.create_from_options(options)

# ---------------- Landmark Groups ----------------
LEFT_EYE = list(range(33, 133))
RIGHT_EYE = list(range(362, 463))
LIPS = list(range(61, 88))
LEFT_EYEBROW = list(range(70, 107))
RIGHT_EYEBROW = list(range(336, 377))

# ---------------- Utility ----------------
def read_image(file):
    image = Image.open(io.BytesIO(file.read())).convert("RGB")
    return np.array(image)

# ---------------- Skin Mask using Face Landmarker ----------------
def create_skin_mask(img):
    h, w, _ = img.shape
    mask = np.ones((h, w), dtype=np.uint8) * 255

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=img
    )

    result = face_landmarker.detect(mp_image)

    if not result.face_landmarks:
        return mask

    landmarks = result.face_landmarks[0]

    def remove(indices):
        pts = []
        for idx in indices:
            x = int(landmarks[idx].x * w)
            y = int(landmarks[idx].y * h)
            pts.append([x, y])
        pts = np.array(pts, dtype=np.int32)
        cv2.fillPoly(mask, [pts], 0)

    remove(LEFT_EYE)
    remove(RIGHT_EYE)
    remove(LIPS)
    remove(LEFT_EYEBROW)
    remove(RIGHT_EYEBROW)

    return mask

# ---------------- Acne Detection ----------------
def detect_acne(img, mask):
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)

    lower1 = np.array([0, 60, 60])
    upper1 = np.array([10, 255, 255])
    lower2 = np.array([170, 60, 60])
    upper2 = np.array([180, 255, 255])

    red = cv2.inRange(hsv, lower1, upper1) + cv2.inRange(hsv, lower2, upper2)
    red = cv2.bitwise_and(red, red, mask=mask)

    contours, _ = cv2.findContours(red, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    count = sum(1 for c in contours if 25 < cv2.contourArea(c) < 250)

    label = "High" if count > 15 else "Moderate" if count > 5 else "Low"
    return {"label": label, "count": count}

# ---------------- Blackheads ----------------
def detect_blackheads(img, mask):
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    blur = cv2.GaussianBlur(gray, (7, 7), 0)
    _, thresh = cv2.threshold(blur, 55, 255, cv2.THRESH_BINARY_INV)
    thresh = cv2.bitwise_and(thresh, thresh, mask=mask)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    count = sum(1 for c in contours if 5 < cv2.contourArea(c) < 40)

    return {"present": count > 5, "count": count}

# ---------------- Wrinkles ----------------
def detect_wrinkles(img, mask):
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 60, 160)
    edges = cv2.bitwise_and(edges, edges, mask=mask)

    density = np.sum(edges > 0) / np.sum(mask > 0)
    label = "Visible" if density > 0.035 else "Low"

    return {"label": label, "edge_density": round(density, 4)}

# ---------------- Pigmentation ----------------
def detect_pigmentation(img, mask):
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, _, _ = cv2.split(lab)

    mean = np.mean(l[mask > 0])
    std = np.std(l[mask > 0])

    dark = (l < (mean - 1.2 * std)) & (mask > 0)
    count = np.sum(dark)

    label = "High" if count > 3000 else "Moderate" if count > 1500 else "Low"
    return {"label": label, "count": int(count / 100)}

# ---------------- Recommendations ----------------
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
@app.route("/analyze-image", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "Image missing"}), 400

    img = read_image(request.files["image"])
    mask = create_skin_mask(img)

    analysis = {
        "acne": detect_acne(img, mask),
        "blackheads": detect_blackheads(img, mask),
        "wrinkles": detect_wrinkles(img, mask),
        "pigmentation": detect_pigmentation(img, mask),
    }

    analysis["recommendations"] = generate_recommendations(analysis)
    analysis["modelVersion"] = "mediapipe-tasks-v1"

    return jsonify(analysis)

if __name__ == "__main__":
    app.run(port=7000, debug=True)
