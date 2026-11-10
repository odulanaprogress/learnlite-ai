from fastapi import APIRouter, HTTPException, status
from pydantic import ValidationError

from app.rag.tutor import answer_question
from app.schemas.tutor import TutorRequest, TutorResponse

router = APIRouter(
    prefix="/api/v1/tutor",
    tags=["AI Tutor"],
)


@router.post(
    "/ask",
    response_model=TutorResponse,
)
async def ask_tutor(request: TutorRequest):
    try:
        return await answer_question(request)

    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI returned an invalid tutor response.",
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI tutor could not process this question. Please retry.",
        ) from exc
