from flask import Flask, request, jsonify
import cv2
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# ---------------- Load Haar Cascades ----------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)
eye_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_eye.xml'
)

# ---------------- Utility ----------------
def read_image(file):
    image = Image.open(io.BytesIO(file.read())).convert("RGB")
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

# ---------------- Skin Mask (Ignore eyes & eyebrows) ----------------
def create_skin_mask(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mask = np.ones(gray.shape, dtype=np.uint8) * 255

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        face_gray = gray[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(face_gray, 1.3, 5)

        for (ex, ey, ew, eh) in eyes:
            eyebrow_y = max(0, y + ey - int(0.6 * eh))
            eyebrow_h = ey + eh

            mask[
                eyebrow_y : eyebrow_y + eyebrow_h,
                x + ex : x + ex + ew
            ] = 0

    return mask

# ---------------- Acne Detection ----------------
def detect_acne(img, mask):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    lower1 = np.array([0, 60, 60])
    upper1 = np.array([10, 255, 255])
    lower2 = np.array([170, 60, 60])
    upper2 = np.array([180, 255, 255])

    red_mask = cv2.inRange(hsv, lower1, upper1) + cv2.inRange(hsv, lower2, upper2)
    red_mask = cv2.bitwise_and(red_mask, red_mask, mask=mask)

    contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    acne_count = sum(1 for c in contours if 30 < cv2.contourArea(c) < 300)

    label = "High" if acne_count > 15 else "Moderate" if acne_count > 5 else "Low"

    return {"label": label, "count": acne_count}

# ---------------- Blackheads ----------------
def detect_blackheads(img, mask):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)

    _, thresh = cv2.threshold(blurred, 55, 255, cv2.THRESH_BINARY_INV)
    thresh = cv2.bitwise_and(thresh, thresh, mask=mask)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    blackheads = [c for c in contours if 5 < cv2.contourArea(c) < 40]

    return {
        "present": len(blackheads) > 6,
        "count": len(blackheads)
    }

# ---------------- Wrinkles ----------------
def detect_wrinkles(img, mask):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 60, 160)
    edges = cv2.bitwise_and(edges, edges, mask=mask)

    edge_density = np.sum(edges > 0) / np.sum(mask > 0)

    label = "Visible" if edge_density > 0.035 else "Low"

    return {
        "label": label,
        "edge_density": round(edge_density, 4)
    }

# ---------------- Pigmentation ----------------
def detect_pigmentation(img, mask):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, _, _ = cv2.split(lab)

    mean_l = np.mean(l[mask > 0])
    dark_pixels = (l < (mean_l - 18)) & (mask > 0)

    count = np.sum(dark_pixels)
    label = "High" if count > 3500 else "Moderate" if count > 1800 else "Low"

    return {
        "label": label,
        "count": int(count / 120)
    }

# ---------------- Dynamic Recommendations ----------------
def generate_recommendations(result):
    recs = []

    acne = result["acne"]
    pigmentation = result["pigmentation"]
    wrinkles = result["wrinkles"]
    blackheads = result["blackheads"]

    if acne["label"] == "High":
        recs.append("🔴 Acne (High): Use Salicylic Acid 1–2%, Niacinamide daily, Retinol at night. Avoid sugary & oily food.")
    elif acne["label"] == "Moderate":
        recs.append("🟠 Acne (Moderate): Gentle cleanser, Aloe Vera gel, Multani Mitti mask weekly.")
    else:
        recs.append("🟢 Acne (Low): Maintain hygiene and oil-free moisturizer.")

    if blackheads["present"]:
        recs.append("⚫ Blackheads: Steam once a week, use BHA or Rice Flour + Honey scrub.")

    if pigmentation["label"] == "High":
        recs.append("🟤 Pigmentation (High): Vitamin C in morning, Retinol at night, Sunscreen SPF 50 mandatory.")
    elif pigmentation["label"] == "Moderate":
        recs.append("🟠 Pigmentation (Moderate): Niacinamide daily, Aloe Vera + Turmeric mask twice weekly.")
    else:
        recs.append("🟢 Pigmentation (Low): Continue sunscreen and hydration.")

    if wrinkles["label"] == "Visible":
        recs.append("🧓 Wrinkles: Retinol 0.25% twice weekly, Hyaluronic Acid, daily SPF.")
    else:
        recs.append("🙂 Wrinkles (Low): Maintain hydration and sun protection.")

    recs.append("💧 Lifestyle: Drink 2–3L water, sleep 7–8 hrs, avoid smoking, eat Vitamin-C rich fruits.")

    return "\n\n".join(recs)

# ---------------- API ----------------
@app.route('/analyze-image', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "Image not provided"}), 400

    img = read_image(request.files['image'])
    skin_mask = create_skin_mask(img)

    analysis = {
        "acne": detect_acne(img, skin_mask),
        "blackheads": detect_blackheads(img, skin_mask),
        "wrinkles": detect_wrinkles(img, skin_mask),
        "pigmentation": detect_pigmentation(img, skin_mask)
    }

    analysis["recommendations"] = generate_recommendations(analysis)

    return jsonify(analysis)

if __name__ == '__main__':
    app.run(port=7000, debug=True)
