from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import json
import logging
import time
from pythonjsonlogger import jsonlogger
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

from pipeline.face_processor import FaceProcessor
from pipeline.colorimetry import Colorimetry
from pipeline.acne_detector import AcneDetector
from pipeline.condition_analyzer import ConditionAnalyzer
from pipeline.zone_mapper import ZoneMapper
from pipeline.severity_scorer import SeverityScorer
from pipeline.annotator import Annotator

app = Flask(__name__)

# Logger setup
logger = logging.getLogger("python_service")
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# Prometheus setup
REQUEST_COUNT = Counter('skinwise_python_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'http_status'])
REQUEST_LATENCY = Histogram('skinwise_python_request_duration_seconds', 'HTTP Request Latency', ['method', 'endpoint'])

face_processor = FaceProcessor()
colorimetry = Colorimetry()
acne_detector = AcneDetector()
condition_analyzer = ConditionAnalyzer()
zone_mapper = ZoneMapper()
severity_scorer = SeverityScorer()
annotator = Annotator()

@app.route('/metrics', methods=['GET'])
def metrics():
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "yolo": "loaded" if acne_detector.model else "not_loaded",
        "mediapipe": "loaded" if face_processor.face_mesh else "not_loaded"
    })

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    start_time = time.time()
    
    if 'image' not in request.files:
        REQUEST_COUNT.labels('POST', '/analyze-image', 400).inc()
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img is None:
        REQUEST_COUNT.labels('POST', '/analyze-image', 400).inc()
        return jsonify({"error": "Invalid image"}), 400

    metadata_str = request.form.get('metadata', '{}')
    metadata = json.loads(metadata_str)
    request_id = request.form.get('requestId', 'unknown')
    
    logger.info("Starting image analysis", extra={"requestId": request_id})

    landmarks, face_bbox, skin_mask, zone_masks = face_processor.extract_mesh(img)
    if not landmarks:
        REQUEST_COUNT.labels('POST', '/analyze-image', 422).inc()
        logger.warning("No face detected", extra={"requestId": request_id})
        return jsonify({"error": "No face detected"}), 422

    fitzpatrick, ita_angle, lab_values = colorimetry.analyze(img, skin_mask)
    detections, total_count, total_area = acne_detector.detect(img, skin_mask)
    blackheads, wrinkles, pigmentation, hydration = condition_analyzer.analyze(img, skin_mask, zone_masks)
    zonal_severity = zone_mapper.compute_zone_scores(img, zone_masks, detections)

    acne_label = "High" if total_count > 15 else "Moderate" if total_count > 5 else "Low"
    raw = {
        "acne": {"label": acne_label, "count": total_count, "totalArea": total_area},
        "blackheads": blackheads,
        "wrinkles": wrinkles,
        "pigmentation": pigmentation,
        "hydration": hydration
    }

    severity, overall_score, iga_grade, recommendations = severity_scorer.compute(raw, fitzpatrick)

    annotated_img_bytes = annotator.draw(img, detections, zone_masks)
    annotated_b64 = base64.b64encode(annotated_img_bytes).decode('utf-8')

    response = {
        "raw": raw,
        "severity": severity,
        "zonalSeverity": zonal_severity,
        "overallScore": overall_score,
        "igaGrade": iga_grade,
        "fitzpatrickEstimate": fitzpatrick,
        "recommendations": recommendations,
        "annotatedImageBase64": annotated_b64,
        "processingTimeMs": int((time.time() - start_time) * 1000),
        "modelVersion": "v2.0-merged"
    }

    REQUEST_COUNT.labels('POST', '/analyze-image', 200).inc()
    REQUEST_LATENCY.labels('POST', '/analyze-image').observe(time.time() - start_time)
    logger.info("Analysis complete", extra={"requestId": request_id, "processingTimeMs": response["processingTimeMs"]})

    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7000)
