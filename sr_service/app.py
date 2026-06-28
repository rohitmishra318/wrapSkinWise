from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import time
import logging
from pythonjsonlogger import jsonlogger
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from quality_gate import QualityGate
from sr_processor import SRProcessor

app = Flask(__name__)

# Logger setup
logger = logging.getLogger("sr_service")
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# Prometheus setup
REQUEST_COUNT = Counter('skinwise_sr_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'http_status'])
REQUEST_LATENCY = Histogram('skinwise_sr_request_duration_seconds', 'HTTP Request Latency', ['method', 'endpoint'])

qg = QualityGate()
sr_processor = SRProcessor()

@app.route('/metrics', methods=['GET'])
def metrics():
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "realesrgan": "loaded" if sr_processor.realesrgan else "not_loaded",
        "gfpgan": "loaded" if sr_processor.gfpgan else "not_loaded"
    })

@app.route('/enhance', methods=['POST'])
def enhance():
    start_time = time.time()
    request_id = request.form.get('requestId', 'unknown')
    logger.info("Starting image enhancement", extra={"requestId": request_id})
    
    if 'image' not in request.files:
        REQUEST_COUNT.labels('POST', '/enhance', 400).inc()
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files['image']
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        REQUEST_COUNT.labels('POST', '/enhance', 400).inc()
        return jsonify({"error": "Invalid image data"}), 400

    h, w = img_bgr.shape[:2]
    original_size = f"{w}x{h}"

    q_result = qg.check(img_bgr)

    if not q_result["passed"] and ("BLUR" in q_result["flags"] or "NO_FACE" in q_result["flags"]):
        REQUEST_COUNT.labels('POST', '/enhance', 422).inc()
        logger.warning("Quality gate failed", extra={"requestId": request_id, "flags": q_result["flags"]})
        return jsonify({
            "error": "QUALITY_GATE_FAILED",
            "flags": q_result["flags"]
        }), 422

    _, buffer = cv2.imencode('.png', img_bgr)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    if not q_result["needsSR"]:
        REQUEST_COUNT.labels('POST', '/enhance', 200).inc()
        REQUEST_LATENCY.labels('POST', '/enhance').observe(time.time() - start_time)
        logger.info("No SR needed", extra={"requestId": request_id})
        return jsonify({
            "srApplied": False,
            "imageBase64": img_base64,
            "qualityResult": q_result
        })

    # Needs SR
    face_coverage = 0
    if q_result["faceBbox"]:
        x1, y1, x2, y2 = q_result["faceBbox"]
        face_area = (x2 - x1) * (y2 - y1)
        face_coverage = face_area / (h * w)

    model_name = sr_processor.select_model(face_coverage)
    enhanced, actual_model = sr_processor.enhance(img_bgr, model_name)
    
    eh, ew = enhanced.shape[:2]
    enhanced_size = f"{ew}x{eh}"
    
    post_processed = sr_processor.post_process(enhanced)
    ph, pw = post_processed.shape[:2]
    post_processed_size = f"{pw}x{ph}"
    
    _, buffer = cv2.imencode('.png', post_processed)
    enhanced_base64 = base64.b64encode(buffer).decode('utf-8')
    
    processing_time = int((time.time() - start_time) * 1000)

    REQUEST_COUNT.labels('POST', '/enhance', 200).inc()
    REQUEST_LATENCY.labels('POST', '/enhance').observe(time.time() - start_time)
    logger.info("Enhancement complete", extra={"requestId": request_id, "processingTimeMs": processing_time})

    return jsonify({
        "srApplied": True,
        "srModel": actual_model,
        "imageBase64": enhanced_base64,
        "originalSize": original_size,
        "enhancedSize": enhanced_size,
        "postProcessedSize": post_processed_size,
        "processingTimeMs": processing_time,
        "qualityResult": q_result
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7001)
