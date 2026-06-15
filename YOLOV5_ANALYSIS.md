# YOLOv5 Analysis - Rental Property Project

## Overview

YOLOv5 is integrated into the Python skin analysis service as an **optional acne detection model**. It runs as a neural network-based detector to identify and count acne lesions on the face. The model is trained on a custom dataset of skin lesions and operates alongside traditional computer vision methods.

---

## Architecture & Integration

### Model Location
- **Weights File**: `python_service/yolo/best.pt`
- **Implementation**: `python_service/yolo/` (custom YOLOv5 fork)
- **Usage File**: `python_service/app2.py`

### Loading & Initialization

```python
# From app2.py (lines 54-68)
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
```

**Key Points**:
- Model loads from `best.pt` (custom trained YOLOv5 model)
- Runs on **GPU (CUDA)** if available, otherwise **CPU**
- **Gracefully falls back** to color-based detection if model fails to load
- Model set to **evaluation mode** (`eval()`) for inference

---

## Input Specification

### Input Source
- **Raw Input**: Cropped face region from the full face image
- **Preprocessing Steps**:

```python
# From app2.py - detect_acne_with_yolo() function (lines 176-191)
1. Resize face crop to 640×640 pixels (standard YOLOv5 input size)
2. Transpose channels: (H, W, 3) → (3, H, W) for PyTorch
3. Ensure memory contiguity (C-contiguous format)
4. Convert to PyTorch tensor on GPU/CPU device
5. Normalize pixel values: 0-255 → 0.0-1.0 (divide by 255)
6. Add batch dimension: (3, 640, 640) → (1, 3, 640, 640)
```

### Input Format
| Property | Value |
|----------|-------|
| **Image Size** | 640×640 pixels |
| **Channels** | RGB (3 channels) |
| **Batch Size** | 1 (single image) |
| **Value Range** | [0.0, 1.0] (normalized) |
| **Tensor Shape** | (1, 3, 640, 640) |
| **Device** | GPU (CUDA) or CPU |

### Pseudo-Code for Input Preparation
```python
def detect_acne_with_yolo(face_bgr, face_rgb, face_h, face_w):
    # 1. Resize to 640×640
    img = cv2.resize(face_rgb, (640, 640))
    
    # 2. Transpose to (3, 640, 640)
    img = img.transpose(2, 0, 1)
    
    # 3. Ensure C-contiguous
    img = np.ascontiguousarray(img)
    
    # 4. Convert to tensor
    img = torch.from_numpy(img).float().to(DEVICE)
    
    # 5. Normalize
    img /= 255.0
    
    # 6. Add batch dimension
    img = img.unsqueeze(0)  # Now shape: (1, 3, 640, 640)
    
    return img
```

---

## Processing Pipeline

### Model Inference

```python
with torch.no_grad():
    pred = yolo_model(img)[0]  # Shape: (1, n_predictions, 85)
```

**Inference Details**:
- **Gradient Computation**: Disabled (`torch.no_grad()`) for faster inference
- **Output Shape**: `(batch_size, num_predictions, 85)`
  - **85** = 4 bbox coords (x1, y1, x2, y2) + 1 confidence score + 80 class predictions
- **Prediction Format**: Raw YOLO predictions (before NMS)

### Non-Maximum Suppression (NMS)

```python
detections = nms_fn(pred, conf_thres=0.15, iou_thres=0.45)[0]
```

**NMS Configuration**:
| Parameter | Value | Purpose |
|-----------|-------|---------|
| **conf_thres** | 0.15 | Confidence threshold - only predictions with confidence ≥ 15% are kept |
| **iou_thres** | 0.45 | IoU threshold - overlapping boxes with IoU > 45% are merged |

**Effect**: Removes duplicate/overlapping detections and low-confidence predictions

---

## Output Specification

### Raw Detection Output

After inference and NMS, detections have shape `(n_detections, 6)`:

| Index | Field | Range | Description |
|-------|-------|-------|-------------|
| 0 | x1 | [0, 640] | Left edge of bounding box (normalized to 640px) |
| 1 | y1 | [0, 640] | Top edge of bounding box |
| 2 | x2 | [0, 640] | Right edge of bounding box |
| 3 | y2 | [0, 640] | Bottom edge of bounding box |
| 4 | conf | [0.0, 1.0] | Confidence score (probability of being acne) |
| 5 | cls | 0 | Class ID (only 1 class: acne lesions) |

### Acne Count & Severity Classification

```python
detections = nms_fn(pred, conf_thres=0.15, iou_thres=0.45)[0]

if detections is None:
    return {"label": "Low", "count": 0}

count = 0
for det in detections:
    x1d, y1d, x2d, y2d, conf, cls = det[:6]
    if conf < 0.15:
        continue
    count += 1

# Severity mapping
label = "High" if count > 15 else "Moderate" if count > 5 else "Low"

return {"label": label, "count": int(count)}
```

### Severity Levels

| Detection Count | Severity Label | Recommendation |
|-----------------|---|---|
| 0-5 | **Low** | Acne under control |
| 6-15 | **Moderate** | Gentle cleanser + Aloe Vera |
| 16+ | **High** | Salicylic Acid, Niacinamide, Retinol |

### API Response Format

```json
{
  "raw": {
    "acne": {
      "label": "Moderate",
      "count": 8
    },
    "blackheads": { "present": true, "count": 12 },
    "wrinkles": { "label": "Low", "edge_density": 0.0234 },
    "pigmentation": { "label": "Low", "count": 0 }
  },
  "severity": {
    "acne": 10,           // 0-100 normalized score
    "blackheads": 24,
    "wrinkles": 30,
    "pigmentation": 0
  },
  "recommendations": "🟠 Moderate acne: Gentle cleanser + Aloe Vera...",
  "modelVersion": "mediapipe-tasks-v1+yolov7"
}
```

---

## Complete Data Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. IMAGE INPUT                                              │
│    - User uploads full face image                           │
│    - Image loaded: RGB, variable size                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 2. FACE DETECTION (MediaPipe FaceLandmarker)                │
│    - Detect face boundaries                                 │
│    - Extract 468 facial landmarks                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 3. FACE CROP & PREPROCESSING                                │
│    - Crop face region from image                            │
│    - Create skin mask (exclude eyes, lips, eyebrows)        │
│    - Create face outline mask                               │
│    - Combine masks for final skin region                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐  ┌────────▼────────────┐
│ PATH A: YOLO   │  │ PATH B: COLOR-BASED │
│ (if available) │  │ (fallback)          │
└───────┬────────┘  └────────┬────────────┘
        │                     │
        │  ┌──────────────────┘
        │  │
┌───────▼──▼──────────────────────────────┐
│ 4. ACNE DETECTION                       │
│ YOLO PATH:                              │
│  - Resize face crop to 640×640          │
│  - Normalize to [0, 1]                  │
│  - Run YOLO inference: 640×640 → ...    │
│  - Apply NMS (conf=0.15, iou=0.45)      │
│  - Count detections                     │
│ FALLBACK PATH:                          │
│  - Convert to HSV color space           │
│  - Detect red pixels (acne signature)   │
│  - Count contours in red mask           │
└───────┬──────────────────────────────────┘
        │
┌───────▼──────────────────────────────────┐
│ 5. OTHER DETECTIONS                     │
│ - Blackhead detection (morphological)   │
│ - Wrinkle detection (edge-based)        │
│ - Pigmentation detection (LAB color)    │
└───────┬──────────────────────────────────┘
        │
┌───────▼──────────────────────────────────┐
│ 6. NORMALIZATION & SCORING               │
│ - Map raw counts to 0-100 scale         │
│ - Classify into Low/Moderate/High       │
│ - Generate recommendations              │
└───────┬──────────────────────────────────┘
        │
┌───────▼──────────────────────────────────┐
│ 7. API RESPONSE                         │
│ - Return JSON with all metrics          │
│ - Include model version used            │
└───────────────────────────────────────────┘
```

---

## Model Architecture Details

### YOLOv5 Network Structure

The YOLOv5 model consists of:

| Component | Purpose |
|-----------|---------|
| **Backbone** | Convolutional layers for feature extraction |
| **Neck** | FPN (Feature Pyramid Network) to multi-scale features |
| **Head (Detect Layer)** | Detection layer with 3 scales (predicts at 3 resolutions) |

### Detection Layer (`yolo/models/yolo.py`)

```python
class Detect(nn.Module):
    def __init__(self, nc=80, anchors=(), ch=()):
        self.nc = nc           # number of classes = 1 (acne)
        self.no = nc + 5       # outputs per anchor = 6 (1 class + 5 params)
        self.nl = len(anchors) # number of detection layers = 3
        self.na = len(anchors[0]) // 2  # number of anchors per layer = 3
        # Each layer predicts at different scales for multi-scale detection
```

### Anchors & Multi-Scale Detection

YOLOv5 predicts at **3 different scales**:
- **Large objects** (acne lesions): Detected at coarser feature maps
- **Small objects**: Detected at finer feature maps  
- **Medium objects**: Detected at intermediate feature maps

This enables detection of acne lesions of various sizes.

---

## Key Parameters & Thresholds

### Model Parameters

| Parameter | Value | Note |
|-----------|-------|------|
| **Input Resolution** | 640×640 | Fixed size; images are resized |
| **Number of Classes** | 1 | Only acne (binary: acne / no acne) |
| **Number of Anchors** | 3 per scale | Total 9 anchors across 3 scales |
| **Device** | GPU/CPU | Auto-selects CUDA if available |

### Detection Thresholds

| Threshold | Value | Purpose |
|-----------|-------|---------|
| **Confidence Threshold** | 0.15 | 15% minimum confidence for a detection |
| **IoU Threshold (NMS)** | 0.45 | Merge overlapping boxes with IoU > 45% |
| **Min Acne Count (Moderate)** | 5 | 6+ lesions = Moderate |
| **Min Acne Count (High)** | 15 | 16+ lesions = High |

### Normalization Thresholds

```python
MAX_COUNTS = {
    "acne": 80,              # 80 detected lesions = 100 severity score
    "blackheads": 50,
    "pigmentation": 4000,
}

# Scoring formula: min(100, int((count / max_count) * 100))
```

---

## Fallback Mechanism

If YOLOv5 fails to load, the system falls back to **color-based acne detection**:

### Color-Based Detection (Backup)

```python
def detect_acne_with_color(face_rgb, mask):
    # 1. Convert RGB to HSV color space
    hsv = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2HSV)
    
    # 2. Define red color ranges (acne signature)
    lower1 = np.array([0, 60, 60])      # Hue 0° (pure red)
    upper1 = np.array([10, 255, 255])
    lower2 = np.array([170, 60, 60])    # Hue 170-180° (red again due to HSV wrap)
    upper2 = np.array([180, 255, 255])
    
    # 3. Create binary mask of red pixels
    red = cv2.inRange(hsv, lower1, upper1) + cv2.inRange(hsv, lower2, upper2)
    red = cv2.bitwise_and(red, red, mask=mask)
    
    # 4. Count red regions (acne lesions)
    contours, _ = cv2.findContours(red, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    count = sum(1 for c in contours if 25 < cv2.contourArea(c) < 250)
    
    # 5. Classify severity
    label = "High" if count > 15 else "Moderate" if count > 5 else "Low"
    return {"label": label, "count": count}
```

**Model Version String**:
- With YOLO: `"mediapipe-tasks-v1+yolov7"`
- Fallback: `"mediapipe-tasks-v1"`

---

## Performance Characteristics

### Latency

| Component | Estimated Time | Notes |
|-----------|---|---|
| Face Detection (MediaPipe) | 10-30ms | Per image |
| YOLO Inference | 20-50ms | Depends on hardware (GPU ~20ms, CPU ~100ms+) |
| NMS Post-processing | 5-15ms | After inference |
| Other Detections | 30-100ms | Blackheads, wrinkles, pigmentation |
| **Total** | **100-300ms** | Per face image |

### Memory Requirements

| Component | Memory |
|-----------|--------|
| YOLOv5 Model (best.pt) | ~50-100 MB (loaded once) |
| Inference Batch | ~500 MB (GPU) or less on CPU |

---

## File Structure

```
python_service/
├── app2.py                    # Main Flask app with YOLO integration
├── yolo/
│   ├── best.pt                # Pre-trained weights (custom trained on skin dataset)
│   ├── detect.py              # Standalone detection script
│   ├── models/
│   │   ├── yolo.py            # YOLOv5 architecture (Detect, IDetect layers)
│   │   ├── common.py          # Common modules (Conv, Bottleneck, etc.)
│   │   ├── experimental.py    # attempt_load() function
│   │   └── ...
│   └── utils/
│       ├── general.py         # Utility functions (non_max_suppression)
│       ├── datasets.py        # Data loading
│       ├── plots.py           # Visualization
│       └── ...
└── requirements.txt           # Dependencies (torch, opencv-python, mediapipe)
```

---

## Dependencies

```
torch                     # PyTorch (model inference)
opencv-python            # OpenCV (image processing)
numpy                     # NumPy (numerical computations)
mediapipe                 # MediaPipe (face detection)
pillow                    # PIL (image I/O)
```

---

## Training Details (best.pt)

### Dataset Characteristics
- **Classes**: 1 (acne lesions)
- **Annotations**: Bounding boxes around acne lesions
- **Image Count**: Unknown (custom trained model)
- **Augmentation**: Standard YOLOv5 augmentations likely used

### Model Configuration
- **Architecture**: YOLOv5 (likely small or medium variant)
- **Input Size**: 640×640 (standard for YOLOv5)
- **Training Framework**: PyTorch
- **Exported Format**: PyTorch .pt file (can be exported to ONNX, TensorRT, etc.)

---

## Advantages & Limitations

### Advantages of YOLO Approach
✅ **Faster than traditional methods**: Neural network inference is parallelizable on GPUs  
✅ **More accurate**: Learned features capture complex acne patterns  
✅ **Multi-scale detection**: Can detect lesions of various sizes  
✅ **Confidence scores**: Provides uncertainty estimates for each detection  
✅ **Graceful fallback**: Switches to color-based detection if model unavailable  

### Limitations
❌ **Requires GPU for speed**: CPU inference is slow (100ms+)  
❌ **Training data dependency**: Model quality depends on training dataset  
❌ **Black-box nature**: Cannot easily interpret why a region is classified as acne  
❌ **Model size**: ~50-100 MB overhead  
❌ **Vulnerability to adversarial inputs**: Can be fooled by unusual skin conditions  

---

## API Endpoint

### POST `/analyze-image`

**Request**:
```
Content-Type: multipart/form-data
- image: [binary image file]
```

**Response** (200 OK):
```json
{
  "raw": {
    "acne": {
      "label": "Moderate",
      "count": 8
    },
    "blackheads": {
      "present": true,
      "count": 12
    },
    "wrinkles": {
      "label": "Low",
      "edge_density": 0.0234
    },
    "pigmentation": {
      "label": "Low",
      "count": 0
    }
  },
  "severity": {
    "acne": 10,
    "blackheads": 24,
    "wrinkles": 30,
    "pigmentation": 0
  },
  "recommendations": "🟠 Moderate acne: Gentle cleanser + Aloe Vera.\n\n🟢 Acne under control (rest).",
  "modelVersion": "mediapipe-tasks-v1+yolov7"
}
```

**Error Response** (400/500):
```json
{
  "error": "Image missing"
}
```

---

## Conclusion

YOLOv5 serves as the **primary acne detection mechanism** in this skin analysis pipeline, providing fast and accurate lesion detection when available. The system gracefully degrades to color-based detection if the model fails to load, ensuring robustness in all scenarios. Combined with MediaPipe face detection and supplementary computer vision algorithms, it provides comprehensive skin health analysis.
