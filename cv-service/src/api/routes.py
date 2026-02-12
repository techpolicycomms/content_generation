"""
CV Service API - Analyses images of collected waste items.
Endpoint: POST /analyze-image
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ..core.inference import WasteClassifier
from ..core.preprocessing import preprocess_image

app = FastAPI(title="GreenLoop CV Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = WasteClassifier()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "cv-service"}


@app.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    """
    Accepts an uploaded image, runs waste classification/counting,
    and returns detected item counts by category.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await image.read()
        processed = preprocess_image(contents)
        results = classifier.predict(processed)

        return {
            "lanyardCount": results.get("lanyard", 0),
            "plasticCount": results.get("plastic", 0),
            "metalCount": results.get("metal", 0),
            "glassCount": results.get("glass", 0),
            "otherCount": results.get("other", 0),
            "cvConfidence": results.get("confidence", 0.0),
            "detections": results.get("detections", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze-url")
async def analyze_url(payload: dict):
    """
    Accepts a JSON body with imageUrl, downloads the image,
    and runs classification. Used by the backend collection service.
    """
    image_url = payload.get("imageUrl")
    if not image_url:
        raise HTTPException(status_code=400, detail="imageUrl is required")

    try:
        import httpx

        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            response.raise_for_status()

        processed = preprocess_image(response.content)
        results = classifier.predict(processed)

        return {
            "lanyardCount": results.get("lanyard", 0),
            "plasticCount": results.get("plastic", 0),
            "metalCount": results.get("metal", 0),
            "glassCount": results.get("glass", 0),
            "otherCount": results.get("other", 0),
            "cvConfidence": results.get("confidence", 0.0),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
