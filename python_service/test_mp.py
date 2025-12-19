import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


MODEL_PATH = "face_landmarker.task"

base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    num_faces=1
)

face_landmarker = vision.FaceLandmarker.create_from_options(options)


LEFT_EYE = [
    33, 7, 163, 144, 145, 153, 154, 155,
    133, 173, 157, 158, 159, 160, 161, 246
]

RIGHT_EYE = [
    362, 382, 381, 380, 374, 373, 390, 249,
    263, 466, 388, 387, 386, 385, 384, 398
]

LIPS = [
    61, 146, 91, 181, 84, 17, 314, 405,
    321, 375, 291, 308, 324, 318, 402,
    317, 14, 87, 178, 88, 95
]

LEFT_EYEBROW = [70, 63, 105, 66, 107, 55, 65, 52]
RIGHT_EYEBROW = [336, 296, 334, 293, 300, 285, 295, 282]





def get_face_bbox(landmarks, w, h, margin=20):
    xs = [int(l.x * w) for l in landmarks]
    ys = [int(l.y * h) for l in landmarks]

    x_min = max(min(xs) - margin, 0)
    y_min = max(min(ys) - margin, 0)
    x_max = min(max(xs) + margin, w)
    y_max = min(max(ys) + margin, h)

    return x_min, y_min, x_max, y_max


def create_skin_mask_from_landmarks(landmarks, h, w):
    mask = np.ones((h, w), dtype=np.uint8) * 255

    def remove(indices):
        pts = [(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in indices]
        cv2.fillPoly(mask, [np.array(pts, np.int32)], 0)

    for region in [LEFT_EYE, RIGHT_EYE, LIPS, LEFT_EYEBROW, RIGHT_EYEBROW]:
        remove(region)

    return mask



cap = cv2.VideoCapture(0)


def draw_ignored_regions(face_bgr, landmarks, w, h):
    overlay = face_bgr.copy()

    def draw_region(indices, color):
        pts = [(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in indices]
        cv2.fillPoly(overlay, [np.array(pts, np.int32)], color)

    # Eyes → Blue
    draw_region(LEFT_EYE, (255, 0, 0))
    draw_region(RIGHT_EYE, (255, 0, 0))

    # Lips → Red
    draw_region(LIPS, (0, 0, 255))

    # Eyebrows → Purple
    draw_region(LEFT_EYEBROW, (255, 0, 255))
    draw_region(RIGHT_EYEBROW, (255, 0, 255))

    # Blend overlay with original
    cv2.addWeighted(overlay, 0.45, face_bgr, 0.55, 0, face_bgr)


while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = face_landmarker.detect(mp_image)

    if not result.face_landmarks:
        cv2.imshow("Real-Time Skin Analysis", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break
        continue

    h, w, _ = frame.shape
    landmarks = result.face_landmarks[0]

    # ---- FACE BOUNDING BOX ----
    x1, y1, x2, y2 = get_face_bbox(landmarks, w, h)
    face_rgb = rgb[y1:y2, x1:x2]
    face_bgr = frame[y1:y2, x1:x2]
    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)


    # ---- SKIN MASK ON FACE ONLY ----
    face_h, face_w, _ = face_rgb.shape
    mask = create_skin_mask_from_landmarks(
    landmarks, face_h, face_w
      )
    
    draw_ignored_regions(face_bgr, landmarks, face_w, face_h)


    # ========== ACNE ==========
    hsv = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2HSV)
    red = (
        cv2.inRange(hsv, (0, 60, 60), (10, 255, 255)) +
        cv2.inRange(hsv, (170, 60, 60), (180, 255, 255))
    )
    red = cv2.bitwise_and(red, red, mask=mask)

    contours, _ = cv2.findContours(red, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    acne_count = 0

    for c in contours:
        area = cv2.contourArea(c)
        if 25 < area < 250:
            acne_count += 1
            (x, y), r = cv2.minEnclosingCircle(c)
            cv2.circle(face_bgr, (int(x), int(y)), int(r), (0, 0, 255), 1)

    

    # ========== BLACKHEADS ==========
        blur = cv2.GaussianBlur(gray, (7, 7), 0)
        _, thresh = cv2.threshold(blur, 55, 255, cv2.THRESH_BINARY_INV)
        thresh = cv2.bitwise_and(thresh, thresh, mask=mask)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        blackhead_count = 0

        for c in contours:
               area = cv2.contourArea(c)
               if 5 < area < 40:
                blackhead_count += 1
                (x, y), r = cv2.minEnclosingCircle(c)
                cv2.circle(face_bgr, (int(x), int(y)), int(r), (0, 0, 0), 1)

    # ========== WRINKLES ==========
    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 60, 160)
    edges = cv2.bitwise_and(edges, edges, mask=mask)
    overlay = face_bgr.copy()
    overlay[edges > 0] = [255, 0, 0]
    face_bgr[:] = cv2.addWeighted(overlay, 0.4, face_bgr, 0.6, 0)


    wrinkle_density = np.sum(edges > 0) / np.sum(mask > 0)

    # ========== PIGMENTATION ==========
    lab = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2LAB)
    l, _, _ = cv2.split(lab)
    mean, std = np.mean(l[mask > 0]), np.std(l[mask > 0])

    dark = (l < (mean - 1.0 * std)) & (mask > 0)

    pig_overlay = face_bgr.copy()
    pig_overlay[dark] = [0, 255, 255]
    face_bgr[:] = cv2.addWeighted(pig_overlay, 0.35, face_bgr, 0.65, 0)


    # ---- LABELS ----
    acne_label = "High" if acne_count > 15 else "Moderate" if acne_count > 5 else "Low"
    wrinkle_label = "Visible" if wrinkle_density > 0.035 else "Low"

    cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)
    cv2.putText(frame, f"Acne: {acne_label} ({acne_count})",
                (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2)
    cv2.putText(frame, f"Blackheads: {blackhead_count}",
            (x1, y1 - 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,0), 2)

    cv2.putText(frame, f"Wrinkles: {wrinkle_label}",
            (x1, y1 - 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,0,0), 2)


    cv2.imshow("Real-Time Skin Analysis", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
