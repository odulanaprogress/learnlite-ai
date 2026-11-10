from fastapi import FastAPI

from app.config import get_settings
from app.document.routes import router as document_router
from app.generation.routes import router as study_router
from app.rag.routes import router as tutor_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered document processing and learning-resource generation.",
)

app.include_router(document_router)
app.include_router(study_router)
app.include_router(tutor_router)


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "learnlite-ai",
        "version": settings.app_version,
    }
