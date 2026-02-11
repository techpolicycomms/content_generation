"""
Image preprocessing utilities for the CV service.
Handles loading, resizing, and normalising images before inference.
"""

import io
import numpy as np
from PIL import Image

# Standard input size for the model
TARGET_SIZE = (640, 640)


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Convert raw image bytes into a normalised numpy array
    suitable for model inference.

    Args:
        image_bytes: Raw bytes of the uploaded image.

    Returns:
        Numpy array of shape (H, W, 3) with values in [0, 255].
    """
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB if necessary (handles PNG with alpha, grayscale, etc.)
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Resize to target dimensions
    image = image.resize(TARGET_SIZE, Image.LANCZOS)

    # Convert to numpy array
    img_array = np.array(image)

    return img_array
