"""
Waste classification inference engine.
Loads a trained model and runs predictions on preprocessed images.
"""

import os
from typing import Any
import numpy as np

# Model path - update to point to your trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "lanyard_model.pt")

# Waste categories the model can detect
CATEGORIES = ["lanyard", "plastic", "metal", "glass", "other"]


class WasteClassifier:
    """
    Wrapper around a trained object detection model (e.g. YOLOv8).
    Loads the model on initialisation and provides a predict() method.
    """

    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load the trained model. Falls back to mock mode if model file is missing."""
        if os.path.exists(MODEL_PATH):
            try:
                from ultralytics import YOLO

                self.model = YOLO(MODEL_PATH)
                print(f"Model loaded from {MODEL_PATH}")
            except Exception as e:
                print(f"Failed to load model: {e}. Running in mock mode.")
                self.model = None
        else:
            print(f"Model not found at {MODEL_PATH}. Running in mock mode.")
            self.model = None

    def predict(self, image: np.ndarray) -> dict[str, Any]:
        """
        Run inference on a preprocessed image.

        Returns:
            Dict with counts per category, confidence score, and detection details.
        """
        if self.model is None:
            return self._mock_predict(image)

        results = self.model(image)
        detections = []
        counts = {cat: 0 for cat in CATEGORIES}

        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                label = CATEGORIES[cls_id] if cls_id < len(CATEGORIES) else "other"

                counts[label] += 1
                detections.append(
                    {
                        "label": label,
                        "confidence": round(conf, 3),
                        "bbox": box.xyxy[0].tolist(),
                    }
                )

        avg_conf = (
            sum(d["confidence"] for d in detections) / len(detections)
            if detections
            else 0.0
        )

        return {
            **counts,
            "confidence": round(avg_conf, 3),
            "detections": detections,
        }

    def _mock_predict(self, image: np.ndarray) -> dict[str, Any]:
        """Fallback mock predictions for development/testing."""
        return {
            "lanyard": 3,
            "plastic": 5,
            "metal": 2,
            "glass": 1,
            "other": 0,
            "confidence": 0.85,
            "detections": [
                {"label": "lanyard", "confidence": 0.92, "bbox": [10, 20, 100, 150]},
                {"label": "plastic", "confidence": 0.88, "bbox": [120, 30, 200, 160]},
            ],
        }
