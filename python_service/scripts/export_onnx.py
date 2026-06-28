import argparse
import torch
import os
import sys

def main():
    parser = argparse.ArgumentParser(description="Export YOLOv5 PyTorch model to ONNX")
    parser.add_argument('--weights', type=str, default='../yolo/best.pt', help='Path to weights file')
    parser.add_argument('--output', type=str, default='../yolo/best.onnx', help='Path to output ONNX file')
    parser.add_argument('--img-size', type=int, nargs='+', default=[640, 640], help='Image size (height, width)')
    parser.add_argument('--batch-size', type=int, default=1, help='Batch size')
    args = parser.parse_args()

    # Load model
    try:
        from models.experimental import attempt_load
    except ImportError:
        print("Error: ultralytics/yolov5 repository code must be in PYTHONPATH")
        sys.exit(1)

    device = torch.device('cpu')
    print(f"Loading weights from {args.weights}...")
    model = attempt_load(args.weights, device=device)
    model.eval()

    # Create dummy input
    dummy_input = torch.zeros(args.batch_size, 3, *args.img_size).to(device)

    # Export
    print(f"Exporting to {args.output}...")
    try:
        torch.onnx.export(
            model,
            dummy_input,
            args.output,
            verbose=False,
            opset_version=12,
            input_names=['images'],
            output_names=['output'],
            dynamic_axes={'images': {0: 'batch', 2: 'height', 3: 'width'}, 'output': {0: 'batch', 1: 'anchors'}}
        )
        print("ONNX export successful!")
    except Exception as e:
        print(f"Export failed: {e}")

if __name__ == "__main__":
    main()
