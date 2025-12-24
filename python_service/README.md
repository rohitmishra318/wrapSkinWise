# SkinWise – Python Service

This service performs **facial skin analysis** using:
- MediaPipe Face Landmarks
- YOLOv7 (Acne Detection)
- OpenCV (Blackheads, Wrinkles, Pigmentation)

## Features
- Acne detection (YOLOv7)
- Blackhead detection (image processing)
- Wrinkle density estimation
- Pigmentation analysis
- Face masking using 468 landmarks

## Setup

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
