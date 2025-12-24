import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ================== CONFIG ==================
MODEL_PATH = "face_landmarker.task"
INPUT_IMAGE = "testing/input1.jpg"      # <-- change path
OUTPUT_IMAGE = "testing/output1.jpg"    # <-- result saved here

# ================== MEDIAPIPE SETUP ==================
base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    num_faces=1
)
face_landmarker = vision.FaceLandmarker.create_from_options(options)

# ================== LANDMARK GROUPS ==================
LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
LIPS = [61,146,91,181,84,17,314,405,321,375,291,308,324,318,402,317,14,87,178,88,95]
LEFT_EYEBROW = [70,63,105,66,107,55,65,52]
RIGHT_EYEBROW = [336,296,334,293,300,285,295,282]

FACE_OUTLINE = [
    10,338,297,332,284,251,389,356,454,323,361,288,
    397,365,379,378,400,377,152,148,176,149,150,136,
    172,58,132,93,234,127,162,21,54,103,67,109
]

# ================== UTIL FUNCTIONS ==================
def order_points_clockwise(points):
    pts = np.array(points)
    center = pts.mean(axis=0)
    angles = np.arctan2(pts[:,1]-center[1], pts[:,0]-center[0])
    return pts[np.argsort(angles)]

def get_face_bbox(landmarks, w, h, margin=20):
    xs = [int(l.x * w) for l in landmarks]
    ys = [int(l.y * h) for l in landmarks]
    return (
        max(min(xs)-margin, 0),
        max(min(ys)-margin, 0),
        min(max(xs)+margin, w),
        min(max(ys)+margin, h)
    )

def landmarks_to_face_space(landmarks, x1, y1, w, h):
    return [(int(l.x*w)-x1, int(l.y*h)-y1) for l in landmarks]

def create_face_outline_mask(landmarks, h, w):
    pts = order_points_clockwise([landmarks[i] for i in FACE_OUTLINE])
    mask = np.zeros((h,w), np.uint8)
    cv2.fillPoly(mask, [pts.astype(np.int32)], 255)
    return mask

def create_skin_mask(face_landmarks, h, w):
    mask = np.ones((h,w), np.uint8) * 255
    ignore = np.zeros((h,w), np.uint8)

    def remove(region):
        pts = order_points_clockwise([face_landmarks[i] for i in region])
        cv2.fillPoly(ignore, [pts.astype(np.int32)], 255)

    for r in [LEFT_EYE, RIGHT_EYE, LIPS, LEFT_EYEBROW, RIGHT_EYEBROW]:
        remove(r)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15,15))
    ignore = cv2.dilate(ignore, kernel, 1)
    mask[ignore > 0] = 0
    return mask

# ================== LOAD IMAGE ==================
frame = cv2.imread(INPUT_IMAGE)
if frame is None:
    raise ValueError("Input image not found")

rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
h, w, _ = frame.shape

# ================== FACE LANDMARK DETECTION ==================
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
result = face_landmarker.detect(mp_image)

if not result.face_landmarks:
    print("No face detected")
    cv2.imwrite(OUTPUT_IMAGE, frame)
    exit()

landmarks = result.face_landmarks[0]

# ================== FACE ROI ==================
x1, y1, x2, y2 = get_face_bbox(landmarks, w, h)
face_rgb = rgb[y1:y2, x1:x2]
face_bgr = frame[y1:y2, x1:x2]
face_landmarks = landmarks_to_face_space(landmarks, x1, y1, w, h)

fh, fw, _ = face_rgb.shape
gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)

# ================== SKIN MASK ==================
mask = create_skin_mask(face_landmarks, fh, fw)
face_outline = create_face_outline_mask(face_landmarks, fh, fw)
final_mask = cv2.bitwise_and(mask, face_outline)

# ================== ACNE ==================
hsv = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2HSV)
red = (
    cv2.inRange(hsv,(0,60,60),(10,255,255)) +
    cv2.inRange(hsv,(170,60,60),(180,255,255))
)
red = cv2.bitwise_and(red, red, mask=final_mask)

contours,_ = cv2.findContours(red, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
acne_count = 0
for c in contours:
    if 25 < cv2.contourArea(c) < 250:
        acne_count += 1
        (x,y),r = cv2.minEnclosingCircle(c)
        cv2.circle(face_bgr,(int(x),int(y)),int(r),(0,0,255),1)

# ================== BLACKHEADS ==================
blur = cv2.GaussianBlur(gray,(7,7),0)
_,th = cv2.threshold(blur,55,255,cv2.THRESH_BINARY_INV)
th = cv2.bitwise_and(th, th, mask=final_mask)

contours,_ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
blackhead_count = 0
for c in contours:
    if 5 < cv2.contourArea(c) < 40:
        blackhead_count += 1
        (x,y),r = cv2.minEnclosingCircle(c)
        cv2.circle(face_bgr,(int(x),int(y)),int(r),(0,0,0),1)

# ================== WRINKLES ==================
edges = cv2.Canny(gray,60,160)
edges = cv2.bitwise_and(edges, edges, mask=final_mask)
overlay = face_bgr.copy()
overlay[edges > 0] = [255,0,0]
face_bgr[:] = cv2.addWeighted(overlay,0.4,face_bgr,0.6,0)

wrinkle_density = np.sum(edges>0)/np.sum(final_mask>0)

# ================== PIGMENTATION ==================
lab = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2LAB)
l,_,_ = cv2.split(lab)
mean,std = np.mean(l[final_mask>0]), np.std(l[final_mask>0])
dark = (l < (mean-1.0*std)) & (final_mask>0)

pig = face_bgr.copy()
pig[dark] = [0,255,255]
face_bgr[:] = cv2.addWeighted(pig,0.35,face_bgr,0.65,0)

# ================== LABELS ==================
acne_label = "High" if acne_count>15 else "Moderate" if acne_count>5 else "Low"
wrinkle_label = "Visible" if wrinkle_density>0.035 else "Low"

cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,0),2)
cv2.putText(frame,f"Acne: {acne_label} ({acne_count})",(x1,y1-10),
            cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,255),2)
cv2.putText(frame,f"Blackheads: {blackhead_count}",(x1,y1-35),
            cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,0),2)
cv2.putText(frame,f"Wrinkles: {wrinkle_label}",(x1,y1-60),
            cv2.FONT_HERSHEY_SIMPLEX,0.6,(255,0,0),2)

# ================== SAVE RESULT ==================
cv2.imwrite(OUTPUT_IMAGE, frame)
print(f"✅ Result saved as {OUTPUT_IMAGE}")
