from flask import Flask, request, jsonify
import cv2
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# ---------- Utility ----------
def read_image(file):
    image = Image.open(io.BytesIO(file.read())).convert("RGB")
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

# ---------- Acne / Pimples (Red spots using HSV) ----------
def detect_acne(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # red color ranges (two ranges in HSV)
    lower1 = np.array([0, 50, 50])
    upper1 = np.array([10, 255, 255])
    lower2 = np.array([170, 50, 50])
    upper2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower1, upper1)
    mask2 = cv2.inRange(hsv, lower2, upper2)
    mask = mask1 + mask2

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    acne_count = sum(1 for c in contours if 20 < cv2.contourArea(c) < 500)

    return {
        "label": "High" if acne_count > 10 else "Moderate" if acne_count > 4 else "Mild",
        "count": acne_count
    }

# ---------- Blackheads (Dark small spots) ----------
def detect_blackheads(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)

    _, thresh = cv2.threshold(blurred, 60, 255, cv2.THRESH_BINARY_INV)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    blackheads = [c for c in contours if 5 < cv2.contourArea(c) < 50]

    return {
        "present": len(blackheads) > 5,
        "count": len(blackheads)
    }

# ---------- Wrinkles (Edge detection) ----------
def detect_wrinkles(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)

    edge_density = np.sum(edges > 0) / edges.size

    return {
        "label": "Visible" if edge_density > 0.05 else "Low",
        "edge_density": round(edge_density, 4)
    }

# ---------- Pigmentation (Darker patches) ----------
def detect_pigmentation(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    mean_l = np.mean(l)
    dark_mask = l < (mean_l - 15)

    count = np.sum(dark_mask)

    return {
        "label": "High" if count > 5000 else "Moderate" if count > 2000 else "Low",
        "count": int(count / 100)
    }

# ---------- API ----------
@app.route('/analyze-image', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "Image not provided"}), 400

    img = read_image(request.files['image'])

    result = {
        "acne": detect_acne(img),
        "blackheads": detect_blackheads(img),
        "wrinkles": detect_wrinkles(img),
        "pigmentation": detect_pigmentation(img),
        "recommendations": (
            "✔ Cleanse twice daily\n"
            "✔ Use sunscreen SPF 50\n"
            "✔ Avoid harsh scrubs\n"
            "✔ Stay hydrated"
        )
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(port=7000, debug=True)
