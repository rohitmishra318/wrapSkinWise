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

FACE_OUTLINE = [
    10, 338, 297, 332, 284, 251, 389, 356, 454,
    323, 361, 288, 397, 365, 379, 378, 400, 377,
    152, 148, 176, 149, 150, 136, 172, 58, 132,
    93, 234, 127, 162, 21, 54, 103, 67, 109
]


def create_face_outline_mask(face_landmarks, h, w):
    pts = [face_landmarks[i] for i in FACE_OUTLINE]
    pts = order_points_clockwise(pts)

    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask, [np.array(pts, np.int32)], 255)
    return mask


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


def create_skin_mask_from_landmarks(face_landmarks, h, w):
    mask = np.ones((h, w), dtype=np.uint8) * 255
    ignore = np.zeros((h, w), dtype=np.uint8)

    def remove(indices):
        pts = [face_landmarks[i] for i in indices]
        pts = order_points_clockwise(pts)
        cv2.fillPoly(ignore, [np.array(pts, np.int32)], 255)

    for region in [LEFT_EYE, RIGHT_EYE, LIPS, LEFT_EYEBROW, RIGHT_EYEBROW]:
        remove(region)

    # buffer zone
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    ignore = cv2.dilate(ignore, kernel, iterations=1)

    mask[ignore > 0] = 0
    return mask




IMAGE_PATH = "input.jpg"      # input image
OUTPUT_PATH = "output.jpg"    # annotated result



def draw_ignored_regions(face_bgr, face_landmarks, w, h):
    overlay = face_bgr.copy()

    def draw_region(indices, color):
        pts = [face_landmarks[i] for i in indices]
        pts = order_points_clockwise(pts)
        cv2.fillPoly(overlay, [np.array(pts, np.int32)], color)

    draw_region(LEFT_EYE, (0, 255, 0))
    draw_region(RIGHT_EYE, (0, 255, 0))
    draw_region(LIPS, (0, 255, 0))
    draw_region(LEFT_EYEBROW, (0, 255, 0))
    draw_region(RIGHT_EYEBROW, (0, 255, 0))
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
    full_landmarks = result.face_landmarks[0]

    # ---- FACE BOUNDING BOX ----
    x1, y1, x2, y2 = get_face_bbox(full_landmarks, w, h)

    # convert landmarks to face-local coordinates (relative to bbox)
    face_landmarks = landmarks_to_face_space(full_landmarks, x1, y1, w, h)
    face_rgb = rgb[y1:y2, x1:x2]
    face_bgr = frame[y1:y2, x1:x2]
    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)


    # ---- SKIN MASK ON FACE ONLY ----
    face_h, face_w, _ = face_rgb.shape
    mask = create_skin_mask_from_landmarks(face_landmarks, face_h, face_w)
    draw_ignored_regions(face_bgr, face_landmarks, face_w, face_h)



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

    face_outline_mask = create_face_outline_mask(face_landmarks, face_h, face_w)

    final_skin_mask = cv2.bitwise_and(mask, face_outline_mask)

    dark = (l < (mean - 1.0 * std)) & (final_skin_mask > 0)


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
